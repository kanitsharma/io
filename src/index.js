const IO = (F, cancellations = []) => {
  if (typeof F !== 'function') {
    throw 'Side IOs can only be functions';
  }

  let toCancel = false;

  const cancel = () => {
    toCancel = true;
  };

  const empty = _ => IO(() => {});

  const cancellableApply = (f, g) => (...args) => {
    if (toCancel) {
      return g ? g() : null;
    }
    return f(...args);
  };

  const ap = m =>
    IO(
      (reject, resolve) => {
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
          throw 'Side IOs should only return functions for cleanup';
        }

        // Parent Fork to get function
        const outerCleanup = F(
          rejecter,
          resolver(x => {
            fn = x;
          }),
        );
        if (innerCleanup && typeof innerCleanup !== 'function') {
          throw 'Side IOs should only return functions for cleanup';
        }

        return () => {
          if (innerCleanup) innerCleanup();
          if (outerCleanup) outerCleanup();
        };
      },
      [...cancellations, cancel],
    );

  const map = f =>
    IO(
      (reject, resolve) =>
        F(
          x => cancellableApply(reject)(x),
          y => cancellableApply(resolve)(f(y)),
        ),
      [...cancellations, cancel],
    );

  const chain = f =>
    IO(
      (reject, resolve) => {
        let innerCleanup;
        const parentCleanup = F(
          x => cancellableApply(reject)(x),
          y =>
            f(y).fork(
              reject,
              x => cancellableApply(resolve)(x),
              // If the chained IO is run, we get its cleanup in the callback
              cleanup => {
                innerCleanup = cleanup;
              },
            ),
        );

        if (parentCleanup && typeof parentCleanup !== 'function') {
          throw 'Side IOs should only return functions for cleanup';
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
    IO(
      (reject, resolve) =>
        F(
          x => cancellableApply(f)(x).fork(reject, resolve),
          y => cancellableApply(resolve)(y),
        ),
      [...cancellations, cancel],
    );

  const fold = (f, g) =>
    IO(
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
    IO(
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
      throw 'Side IOs should only return functions for cleanup';
    }

    // Callback to get inner cleanup function from a chained IO
    if (callBack) {
      callBack(cleanup);
    }

    return runCancellations(cleanup);
  };

  const show = () => `IO(${F.toString()})`;

  return { map, chain, empty, orElse, fold, cata, bimap, fork, ap, show };
};

IO.of = x => IO((_, resolve) => resolve(x));
IO.rejected = x => IO(reject => reject(x));
IO.encaseP = fn => (...args) =>
  IO((reject, resolve) => {
    fn(...args)
      .then(resolve)
      .catch(reject);
  });

export default IO;
