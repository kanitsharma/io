import test from 'ava';
import IO from '../build/main';
import fetch from 'node-fetch';

test.cb('Map Test', t => {
  IO((_, resolve) => {
    resolve('First');
  })
    .map(x => `${x} Second`)
    .fork(
      () => {},
      x => {
        t.is(x, 'First Second');
        t.end();
      },
    );
});

test.cb('Chain Test', t => {
  IO((_, resolve) => {
    resolve('First');
  })
    .chain(x =>
      IO((_, resolve) => {
        resolve(`${x} Second`);
      }),
    )
    .fork(
      () => {},
      x => {
        t.is(x, 'First Second');
        t.end();
      },
    );
});

test.cb('Cancellation and Cleanup Test', t => {
  const run = () =>
    IO((_, resolve) => {
      setTimeout(() => {
        resolve('Finished');
      }, 1000);

      return () => t.end();
    });

  const cancel = run()
    .map(x => {
      cancel();
      return x;
    })
    .chain(() =>
      IO((_, resolve) => {
        t.fail();
        setTimeout(() => {
          resolve('Failed');
        }, 1000);
      }),
    )
    .fork(console.log, console.log);
});

test.cb('EncaseP Test', t => {
  const pureFetch = IO.encaseP(fetch);

  pureFetch('https://jsonplaceholder.typicode.com/todos/1')
    .chain(IO.encaseP(response => response.json()))
    .fork(console.error, response => {
      t.is(response.userId, 1);
      t.end();
    });
});
