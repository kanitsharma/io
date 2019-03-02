import test from 'ava';
import Effect from '../build/main';

test.cb('Left identity, return a >>= f = f a', t => {
  // lift :: return
  const lift = x => Effect.of(x);
  const f = x => Effect.of(x + 10);

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
  const lift = x => Effect.of(x);
  const m = Effect.of(100);

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
