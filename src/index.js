const Effect = (F, cancellations = []) => {
  if (typeof F !== 'function') {
    throw 'Side Effects can only be functions';
  }

  let toCancel = false;

  const cancel = () => {
    toCancel = true;
  };

  const empty = _ => Effect(() => {});

  const cancellableApply = (f, g) => (...args) => {
    if (toCancel) {
      return g ? g() : null;
    }
    return f(...args);
  };

  const ap = m =>
    Effect((reject, resolve) => {
      let fn;
      let val;
      let rejected = false;

      const rejecter = x => {
        if (rejected) {
          return x;
        }

        rejected = true;
        return cancellableApply(reject)(x);
      };

      const resolver = setter => x => {
        if (rejected) {
          return;
        }

        setter(x);

        if (fn !== undefined && val !== undefined) {
          cancellableApply(resolve)(fn(val));
        }
      };

      // child fork to get the argument
      const innerCleanup = m.fork(
        rejecter,
        resolver(x => {
          val = x;
        }),
      );
      if (innerCleanup && typeof innerCleanup !== 'function') {
        throw 'Side Effects should only return functions for cleanup';
      }

      // Parent Fork to get function
      const outerCleanup = F(
        rejecter,
        resolver(x => {
          fn = x;
        }),
      );
      if (innerCleanup && typeof innerCleanup !== 'function') {
        throw 'Side Effects should only return functions for cleanup';
      }

      return () => {
        if (innerCleanup) innerCleanup();
        if (outerCleanup) outerCleanup();
      };
    });

  const map = f =>
    Effect(
      (reject, resolve) =>
        F(
          x => cancellableApply(reject)(x),
          y => cancellableApply(resolve)(f(y)),
        ),
      [...cancellations, cancel],
    );

  const chain = f =>
    Effect(
      (reject, resolve) => {
        let innerCleanup;
        const parentCleanup = F(
          x => cancellableApply(reject)(x),
          y =>
            f(y).fork(
              reject,
              x => cancellableApply(resolve)(x),
              // If the chained Effect is run, we get its cleanup in the callback
              cleanup => {
                innerCleanup = cleanup;
              },
            ),
        );

        if (parentCleanup && typeof parentCleanup !== 'function') {
          throw 'Side Effects should only return functions for cleanup';
        }

        // Composed cleanup function
        return () => {
          parentCleanup();
          if (innerCleanup) {
            innerCleanup();
          }
        };
      },
      [...cancellations, cancel],
    );

  const orElse = f =>
    Effect(
      (reject, resolve) =>
        F(
          x => cancellableApply(f)(x).fork(reject, resolve),
          y => cancellableApply(resolve)(y),
        ),
      [...cancellations, cancel],
    );

  const fold = (f, g) =>
    Effect(
      (_, resolve) =>
        F(
          x => cancellableApply(resolve)(f(x)),
          y => cancellableApply(resolve)(g(y)),
        ),
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
      [...cancellations, cancel],
    );

  const runCancellations = cleanup => () => {
    cancellations.forEach(f => f());
    cleanup();
  };

  const fork = (reject, resolve, callBack) => {
    if (typeof reject !== 'function' || typeof resolve !== 'function') {
      throw 'Fork should always be provided this onRejected and onResolved functions. fork(onRejected, onResolved)';
    }

    const cleanup = F(reject, x => cancellableApply(resolve)(x));

    if (cleanup && typeof cleanup !== 'function') {
      throw 'Side Effects should only return functions for cleanup';
    }

    // Callback to get inner cleanup function from a chained effect
    if (callBack) {
      callBack(cleanup);
    }

    return runCancellations(cleanup);
  };

  const toString = () => 'Effect';

  return { map, chain, empty, orElse, fold, cata, bimap, fork, ap, toString };
};

Effect.of = x => Effect((_, resolve) => resolve(x));
Effect.rejected = x => Effect(reject => reject(x));

export default Effect;
