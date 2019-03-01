import test from 'ava';
import Effect from '../build/main';

test.cb('Cancellation check', t => {
  const run = () =>
    Effect(
      (_, resolve) => {
        setTimeout(() => {
          console.log('First Running');
          resolve('Finished');
        }, 1000);
      },
      () => {
        t.end();
      },
    );

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
