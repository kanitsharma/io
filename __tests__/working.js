import test from 'ava';
import Effect from '../build/main';

test.cb('Map Test', t => {
  Effect((_, resolve) => {
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
  Effect((_, resolve) => {
    resolve('First');
  })
    .chain(x =>
      Effect((_, resolve) => {
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
    Effect((_, resolve) => {
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
      Effect((_, resolve) => {
        t.fail();
        setTimeout(() => {
          resolve('Failed');
        }, 1000);
      }),
    )
    .fork(console.log, console.log);
});
