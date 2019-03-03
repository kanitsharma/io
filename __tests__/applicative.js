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

test.cb('Interchange, u <*> pure y = pure ($ y) <*> u ', t => {
  // lift :: return
  const pure = x => Effect.of(x);
  const f = x => x + 10;
  const u = Effect.of(f);
  const y = 100;
  const $ = x => g => g(x);

  const first = u.ap(pure(y));
  const second = pure($(y)).ap(u);

  // Assertion
  first
    .chain(z =>
      second.map(x => {
        t.is(z, x);
        return x;
      }),
    )
    .fork(
      () => {},
      () => {
        t.end();
      },
    );
});

test.cb('Composition, pure (.) <*> u <*> v <*> w = u <*> (v <*> w) ', t => {
  // lift :: return
  const add = x => x + 10;
  const sub = x => x - 10;
  const compose = f1 => f2 => arg => f1(f2(arg));
  const pure = x => Effect.of(x);
  const u = Effect.of(add);
  const v = Effect.of(sub);
  const w = Effect.of(10);

  const first = pure(compose)
    .ap(u)
    .ap(v)
    .ap(w);

  const second = u.ap(v.ap(w));

  // Assertion
  first
    .chain(z =>
      second.map(x => {
        t.is(z, x);
        return x;
      }),
    )
    .fork(
      () => {},
      () => {
        t.end();
      },
    );
});

test.cb('Parallelism', t => {
  const f = x => y => x + y;
  let firstLoaded = false;
  let secondLoaded = false;

  const M1 = Effect((_, resolve) => {
    setTimeout(() => {
      firstLoaded = true;
      resolve(10);
    }, 1000);
  });

  const M2 = Effect((_, resolve) => {
    setTimeout(() => {
      secondLoaded = true;
      resolve(10);
    }, 1000);
  });

  Effect.of(f)
    .ap(M1)
    .ap(M2)
    .fork(() => {}, () => {});

  setTimeout(() => {
    t.is(firstLoaded, secondLoaded);
    t.end();
  }, 1100);
});
