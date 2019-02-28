const Effect = (F, cleanup = () => {}, cancellations = []) => {
  let toCancel = false;

  const cancel = () => {
    toCancel = true;
    console.log('Cancelled');
  };

  const empty = _ => Effect(() => {}, cleanup, true);

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
      [...cancellations, cancel],
    );

  const chain = f =>
    Effect(
      (reject, resolve) =>
        F(
          x => reject(x),
          y => cancellableApply(f, empty)(y).fork(reject, resolve),
        ),
      cleanup,
      [...cancellations, cancel],
    );

  const orElse = f =>
    Effect(
      (reject, resolve) =>
        F(
          x => cancellableApply(f)(x).fork(reject, resolve),
          y => cancellableApply(resolve)(y),
        ),
      cleanup,
      [...cancellations, cancel],
    );

  const fold = (f, g) =>
    Effect(
      (_, resolve) =>
        F(
          x => cancellableApply(resolve)(f(x)),
          y => cancellableApply(resolve)(g(y)),
        ),
      cleanup,
      [...cancellations, cancel],
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
      [...cancellations, cancel],
    );

  const fork = (reject, resolve) => {
    const resolver = (...args) => {
      if (!toCancel) {
        resolve(...args);
      }
    };
    F(reject, resolver);
    return () => {
      cancellations.forEach(f => f());
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
    Effect((_, resolve) => {
      setTimeout(() => {
        console.log('Second Finished');
        resolve(x);
      }, 1000);
    }),
  )
  .fork(console.log, console.log);
