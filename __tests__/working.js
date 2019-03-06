import test from 'ava';
import IO from '../build/main';

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
