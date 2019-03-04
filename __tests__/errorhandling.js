import test from 'ava';
import IO from '../build/main';

test.cb('Side IO is not a function', t => {
  try {
    IO(10);
    t.fail();
  } catch (e) {
    t.is(e, 'Side IOs can only be functions');
  }
  t.end();
});

test.cb('Missing Argument in fork', t => {
  try {
    IO((_, resolve) => resolve(10)).fork();
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
    IO((_, resolve) => {
      resolve('First');

      return () => {};
    })
      .chain(x =>
        IO((_, resolve) => {
          resolve(`${x} Second`);

          return () => {};
        }),
      )
      .chain(x =>
        IO((_, resolve) => {
          resolve(x);

          return 1;
        }),
      )
      .fork(() => {}, () => {});
  } catch (e) {
    t.is(e, 'Side IOs should only return functions for cleanup');
    t.end();
  }
});
