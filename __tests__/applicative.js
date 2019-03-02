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