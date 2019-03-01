import test from 'ava';
import Effect from '../build/main';

test.cb('Functor Law, fmap id = id', t => {
  const id = x => x;
  const normal = x => Effect.of(id(x));
  const mapped = x => Effect.of(x).map(id);

  // Assertion
  normal(10)
    .chain(x =>
      mapped(10).map(y => {
        t.is(x, y);
        return y;
      }),
    )
    .fork(
      () => {},
      () => {
        t.end();
      },
    );
});

test.cb('Functor Law. fmap (f . g)  ==  fmap f . fmap g', t => {
  const compose = f => g => (...args) => f(g(...args));
  const f = x => x + 10;
  const g = x => x - 10;
  const first = x =>
    Effect.of(x).map(
      compose(
        g,
        f,
      ),
    );
  const second = x =>
    Effect.of(x)
      .map(f)
      .map(g);

  // Assertion
  first(100)
    .chain(x =>
      second(100).map(y => {
        console.log(x, y);
        t.is(x, y);
        return y;
      }),
    )
    .fork(
      () => {},
      () => {
        t.end();
      },
    );
});

test.cb('Chain Test', t => {
  Effect((_, resolve) => {
    resolve('First');
  })
    .chain(x =>
      Effect((_, resolve) => {
        resolve(`${x} Second`);
      }),
    )
    .fork(null, x => {
      t.is(x, 'First Second');
      t.end();
    });
});

test.cb('Cancellation check', t => {
  const run = () =>
    Effect(
      (_, resolve) => {
        setTimeout(() => {
          console.log('First Running');
          resolve('Finished');
        }, 1000);
      },
      () => {
        t.end();
      },
    );

  const cancel = run()
    .map(x => {
      cancel();
      return x;
    })
    .chain(() =>
      Effect((_, resolve) => {
        t.fail();
        setTimeout(() => {
          resolve('Failed');
        }, 1000);
      }),
    )
    .fork(console.log, console.log);
});
