<h1 align="center">
  <br>
  <a href="https://github.com/kanitsharma/io"><img src="logo.png" alt="io" width="200"></a>
</h1>

<h4 align="center">Lightweight monadic abstraction to "purely" handle side effects in javascript.</h4>

<p align="center">
  <a href="https://github.com/prettier/prettier">
        <img src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg" alt="prettier"/>
  </a>
  <a href="https://github.com/rajatsharma/hellpack">
        <img src="https://img.shields.io/badge/uses-hellpack%20%F0%9F%94%A5-%23414770.svg" alt="hellpack"/>
  </a>
    <a href="https://github.com/kanitsharma/io/blob/license.md">
        <img src="https://badgen.net/badge/license/MIT/blue" alt="license"/>
  </a>
  <a href="https://travis-ci.com/kanitsharma/io">
        <img src="https://travis-ci.com/kanitsharma/io.svg?token=sGsp6ken9AnVBDihTPmf&branch=master" alt="travis"/>
  </a>

### An IO provides
- Lazy evaluation of side effects.
- Easy cancellation at any point during its computation and resource cleanup after that.
- Clean API for easy resource management while doing side effects.
- Ultra lightweight, Gzipped ~ 1kb.
- Friendly Error Messages.
- Follows Haskell laws for Functors, Applicatives and Monads [(See the tests for these laws)](https://github.com/kanitsharma/io/tree/master/__tests__).

## Getting Started

```
  yarn add @kimera/io
```
or
```
  npm install --save @kimera/io
```

## Basic Examples

```javascript
import IO from '@kimera/io'

IO.of(1)
  .map(x => x + 10)
  .chain(x => IO.of(x + '!')) // JavaScript is awesome
  .fork(
    err => console.log(err),
    x => console.log(x) // 11!
  )

// Fetching data from API
const pureFetch = IO.encaseP(fetch);

pureFetch('https://jsonplaceholder.typicode.com/todos/1')
  .chain(IO.encaseP(response => response.json()))
  .fork(
    console.error,
    console.log
  });
```

## API

<img align="right" width="100"  src="https://camo.githubusercontent.com/b76c9e0a143a4dab12bbf5e9796d8eaa1b4d757a/68747470733a2f2f7261772e6769746875622e636f6d2f66616e746173796c616e642f66616e746173792d6c616e642f6d61737465722f6c6f676f2e706e67" alt="travis"/>

IO implements Fantasy Land and Static Land -compatible Functor, Bifunctor, Applicative and  Monad (of, ap, map, bimap, chain).
All versions of Fantasy Land are supported.

## Creating IOs

#### IO
Creates an IO with the given computation. A computation is a function which takes two callbacks. Both are continuations for the computation. The first is reject, commonly abbreviated to rej; The second is resolve, or res. When the computation is finished (possibly asynchronously) it may call the appropriate continuation with a failure or success value.

Additionally, the computation may return a function containing resource management logic.

```javascript
IO((reject, resolve) => {
  setTimeout(resolve, 3000, 'Hello world');
});
```

#### of
Creates an IO which immediately resolves with the given value.

```javascript
IO.of('Hello')
  .map(x => `${x} World!`)
  .fork(console.err, console.log)
```

####  rejected
Creates an IO which immediately rejects with the given value.

```javascript
IO.rejected('Hello')
  .map(x => `${x} World!`)
  .fork(console.err, console.log) // Hello
```

#### encaseP
Allows Promise-returning functions to be turned into IO-returning functions.

Takes a function which returns a Promise, and a value, and returns an IO. When forked, the IO calls the function with the value to produce the Promise, and resolves with its resolution value, or rejects with its rejection reason.

```javascript
const pureFetch = IO.encaseP(fetch);

pureFetch('https://jsonplaceholder.typicode.com/todos/1')
  .chain(IO.encaseP(response => response.json()))
  .fork(
    console.error,
    console.log
  });
```

### Transforming IO

#### map
Transforms the resolution value inside the OP, and returns an IO with the new value. The transformation is only applied to the resolution branch: if the IO is rejected, the transformation is ignored.

```javascript
  IO.of(1)
    .map(x => x + 1)
    .fork(console.error, console.log);
```

#### bimap
Maps the left function over the rejection value, or the right function over the resolution value, depending on which is present.

```javascript
IO.of(1)
  .bimap(x => x + '!', x => x + 1)
  .fork(console.error, console.log);
  //> 2

IO.reject('error')
  .bimap(x => x + '!', x => x + 1)
  .fork(console.error, console.log);
  //! "error!"
```

#### chain
Sequence a new IO using the resolution value from another. Similarly to map, chain expects a function to transform the resolution value of an IO. But instead of returning the new value, chain expects an IO to be returned.

The transformation is only applied to the resolution branch: if the IO is rejected, the transformation is ignored.

```javascript
IO.of(1)
  .chain(x => IO.of(x + 1))
  .fork(console.error, console.log);
  //> 2
```

#### ap
Applies the function contained in the left-hand IO or Apply to the value contained in the right-hand IO or Apply. If one of the IO rejects the resulting IO will also be rejected.

```javascript
IO.of(x => y => x + y)
  .ap(IO.of(1))
  .ap(IO.of(2))
  .fork(console.error, console.log);
//> 3
```

#### fold
Applies the left function to the rejection value, or the right function to the resolution value, depending on which is present, and resolves with the result.
Can be used with other type constructors like Left | Right from Either.

```javascript
IO.of('hello')
  .fold(Left, Right)
  .fork(() => {}, console.log);
  //> Right('hello')

IO.reject('it broke')
  .fold(Left, Right)
  .fork(() => {}, console.log);
  //> Left('it broke')
```

### Running IOs in parallel using Applicatives (Parallelism)
If an IO contains a function with order greater than 1, then the IOs applied to it will run parallely.

```javascript
  const f = x => y => x + y;
  let firstLoaded = false;
  let secondLoaded = false;

  const M1 = IO((_, resolve) => {
    setTimeout(() => {
      firstLoaded = true;
      resolve(10);
    }, 1000);
  });

  const M2 = IO((_, resolve) => {
    setTimeout(() => {
      secondLoaded = true;
      resolve(10);
    }, 1000);
  });

  IO.of(f)
    .ap(M1)
    .ap(M2)
    .fork(() => {}, () => {});

  setTimeout(() => {
    console.log(firstLoaded, secondLoaded) // true, true
  }, 1100);
```

### Running IOs

#### fork
Execute the computation represented by an IO, passing reject and resolve callbacks to continue once there is a result.

This function is called fork because it literally represents a fork in our program: a point where a single code-path splits in two. It is recommended to keep the number of calls to fork at a minimum for this reason. The more forks, the higher the code complexity.

Generally, one only needs to call fork in a single place in the entire program.

```javascript
IO.of('world').fork(
  err => console.log(`Oh no! ${err.message}`),
  thing => console.log(`Hello ${thing}!`)
);
```

### Cancelling IOs

Once forked, an IO can be cancelled at any point during its computation.
Note that if cancelled, handler functions passed into fork will not run, instead the clean up functions returned from the side effecty functions will run.

```javascript
const run = () => IO((_, resolve) => {
  let timeout setTimeout(() => {
    resolve('Finished');
  }, 1000);

  return () => clearTimeout(timeout);
});

const cancelAndCleanup = run()
  .map(x => {
    cancelAndCleanup();
    return x;
  })
  .chain(() =>
    IO((_, resolve) => {
      setTimeout(() => {
        resolve('Failed');
      }, 1000);
    }),
  )
  .fork(console.log, console.log);
```

### Cleaning up after running sideEffects

Additionally functions inside IO can return a cleanup or resource management.
If your computation chain is composed together with multiple IOs returning these cleanup functions, then if cancellation/cleanup function is called, all the cleanup functions will run according to their respective order,

```javascript
const computation = IO((reject, resolve) => {
    resolve('Running');

    return () => console.log('First Cleanup');
  })
  .chain(x => IO((reject, resolve) => {
    resolve(x + ' Second Running');

    return () => console.log('Second Cleanup')
  }))

const cleanup = computaion.fork(console.err, console.log)

cleanup()
// First Cleanup
// Second Cleanup
```
