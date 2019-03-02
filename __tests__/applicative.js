import test from 'ava';
import Effect from '../build/main';

test.cb('Identity, pure id <*> v = v ', t => {
  // lift :: return
  const pure = x => Effect.of(x);
  const id = x => x;
  const v = Effect.of(100);

  const first = pure(id).ap(v);
  const second = v;

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

test.cb('Homomorphism, pure f <*> pure x = pure (f x) ', t => {
  // lift :: return
  const pure = x => Effect.of(x);
  const f = x => x + 10;
  const x = 100;

  const first = pure(f).ap(pure(x));
  const second = pure(f(x));

  // Assertion
  first
    .chain(z =>
      second.map(y => {
        t.is(z, y);
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
