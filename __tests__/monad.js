import test from 'ava';
import IO from '../build/main';

test.cb('Left identity, return a >>= f = f a', t => {
  // lift :: return
  const lift = x => IO.of(x);
  const f = x => IO.of(x + 10);

  const first = lift(100).chain(f);
  const second = f(100);

  // Assertion
  first
    .chain(x =>
      second.map(y => {
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

test.cb('Right identity, m >>= return = m', t => {
  // lift :: return
  const lift = x => IO.of(x);
  const m = IO.of(100);

  const first = m.chain(lift);
  const second = m;

  // Assertion
  first
    .chain(x =>
      second.map(y => {
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

test.cb('Right identity, (m >>= f) >>= g = m >>= (x -> f x >>= g)', t => {
  const f = x => IO.of(x + 10);
  const g = x => IO.of(x - 10);
  const m = IO.of(100);

  const first = m.chain(f).chain(g);
  const second = m.chain(x => f(x).chain(g));

  // Assertion
  first
    .chain(x =>
      second.map(y => {
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
