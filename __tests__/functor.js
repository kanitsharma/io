import test from 'ava';
import IO from '../build/main';

test.cb('Functors must preserve identity morphisms, fmap id = id', t => {
  const id = x => x;
  const normal = x => IO.of(id(x));
  const mapped = x => IO.of(x).map(id);

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

test.cb(
  'Functors preserve composition of morphisms. fmap (f . g)  ==  fmap f . fmap g',
  t => {
    const compose = f => g => (...args) => f(g(...args));
    const f = x => x + 10;
    const g = x => x - 10;
    const first = x => IO.of(x).map(compose(f)(g));

    const second = x =>
      IO.of(x)
        .map(f)
        .map(g);

    // Assertion
    first(100)
      .chain(x =>
        second(100).map(y => {
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
  },
);
