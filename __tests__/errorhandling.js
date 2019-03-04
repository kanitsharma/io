import test from 'ava';
import Effect from '../build/main';

test.cb('Side Effect is not a function', t => {
  try {
    Effect(10);
    t.fail();
  } catch (e) {
    t.is(e, 'Side Effects can only be functions');
  }
  t.end();
});

test.cb('Missing Argument in fork', t => {
  try {
    Effect((_, resolve) => resolve(10)).fork();
    t.fail();
  } catch (e) {
    t.is(
      e,
      'Fork should always be provided this onRejected and onResolved functions. fork(onRejected, onResolved)',
    );
  }
  t.end();
});

test.cb('Cleanup error handling test', t => {
  try {
    Effect((_, resolve) => {
      resolve('First');

      return () => {};
    })
      .chain(x =>
        Effect((_, resolve) => {
          resolve(`${x} Second`);

          return () => {};
        }),
      )
      .chain(x =>
        Effect((_, resolve) => {
          resolve(x);

          return 1;
        }),
      )
      .fork(() => {}, () => {});
  } catch (e) {
    t.is(e, 'Side Effects should only return functions for cleanup');
    t.end();
  }
});
