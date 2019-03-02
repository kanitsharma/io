const Effect = (F, cleanup = () => {}, cancellations = []) => {
  let toCancel = false;

  const cancel = () => {
    toCancel = true;
  };

  const empty = _ => Effect(() => {}, cleanup);

  const cancellableApply = (f, g) => (...args) => {
    if (toCancel) {
      return g ? g() : null;
    }
    return f(...args);
  };

  const ap = m => {
    let fullCleanUp = () => {};

    return Effect((reject, resolve) => {
      let fn = false;
      let val = false;
      let rejected = false;

      const rejecter = x => {
        if (rejected) {
          return x;
        }

        rejected = true;
        return reject(x);
      };

      const resolver = setter => x => {
        if (rejected) {
          return;
        }

        setter(x);

        if (fn && val) {
          resolve(fn(val));
        }
      };

      // Parent Fork to get function
      F(
        rejecter,
        resolver(x => {
          fn = x;
        }),
      );

      // M fork to get the argument
      const { cleanup: cleanup1 } = m.fork(
        rejecter,
        resolver(x => {
          val = x;
        }),
      );

      fullCleanUp = () => {
        cleanup1();
        cleanup();
      };
    }, fullCleanUp);
  };

  const map = f =>
    Effect(
      (reject, resolve) =>
        F(
          x => cancellableApply(reject)(x),
          y => cancellableApply(resolve)(f(y)),
        ),
      cleanup,
      [...cancellations, cancel],
    );

  const chain = f =>
    Effect(
      (reject, resolve) =>
        F(
          x => cancellableApply(reject)(x),
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

  const runCancellations = () => {
    cancellations.forEach(f => f());
    cleanup();
  };

  const fork = (reject, resolve) => {
    const resolver = x => (toCancel ? x : resolve(x));

    F(reject, resolver);

    return {
      cancel: runCancellations,
      cleanup,
    };
  };

  return { map, chain, empty, orElse, fold, cata, bimap, fork, ap };
};

Effect.of = x => Effect((_, resolve) => resolve(x));
Effect.rejected = x => Effect(reject => reject(x));
Effect.toString = () => 'Effect';

export default Effect;
