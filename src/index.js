let toCancel = false;

const Effect = (F, cleanup = () => {}) => {
  const empty = _ => Effect(() => {}, cleanup);

  const cancellableApply = (f, g) => (...args) => {
    if (toCancel) {
      return g ? g() : null;
    }
    return f(...args);
  };

  const map = f =>
    Effect(
      (reject, resolve) =>
        F(x => reject(x), y => cancellableApply(resolve)(f(y))),
      cleanup,
    );

  const chain = f =>
    Effect(
      (reject, resolve) =>
        F(
          x => reject(x),
          y => cancellableApply(f, empty)(y).fork(reject, resolve),
        ),
      cleanup,
    );

  const orElse = f =>
    Effect(
      (reject, resolve) =>
        F(
          x => cancellableApply(f)(x).fork(reject, resolve),
          y => cancellableApply(resolve)(y),
        ),
      cleanup,
    );

  const fold = (f, g) =>
    Effect(
      (_, resolve) =>
        F(
          x => cancellableApply(resolve)(f(x)),
          y => cancellableApply(resolve)(g(y)),
        ),
      cleanup,
    );

  const cata = pattern =>
    cancellableApply(fold)(pattern.Rejected, pattern.Resolved);

  const bimap = (f, g) =>
    Effect(
      (reject, resolve) =>
        F(
          x => cancellableApply(reject)(f(x)),
          y => cancellableApply(resolve)(g(y)),
        ),
      cleanup,
    );

  const fork = (reject, resolve) => {
    const resolver = (...args) => {
      if (!toCancel) {
        resolve(...args);
      }
    };
    F(reject, resolver);
    return () => {
      toCancel = true;
    };
  };

  return { map, chain, empty, orElse, fold, cata, bimap, fork };
};

Effect.of = x => Effect((_, resolve) => resolve(x));
Effect.rejected = x => Effect(reject => reject(x));
Effect.toString = () => 'Effect';

const run = () =>
  Effect((_, resolve) => {
    setTimeout(() => {
      console.log('First Finished');
      resolve('Finished');
    }, 1000);
  });

const cancel = run()
  .map(x => {
    cancel();
    return `${x} !`;
  })
  .map(x => {
    console.log(x);
    return x;
  })
  .chain(x =>
    Effect((reject, resolve) => {
      setTimeout(() => {
        console.log('Second Finished');
        resolve(x);
      }, 1000);
    }),
  )
  .fork(console.log, console.log);
