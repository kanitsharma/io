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

  const map = f =>
    Effect(
      (reject, resolve) =>
        F(
          x => cancellableApply(reject)(x),
          y => cancellableApply(resolve)(f(y))
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

  const fork = (reject, resolve) => {
    F(reject, resolve);
    return () => {
      cancellations.forEach(f => f());
      cleanup();
    };
  };

  return { map, chain, empty, orElse, fold, cata, bimap, fork };
};

Effect.of = x => Effect((_, resolve) => resolve(x));
Effect.rejected = x => Effect(reject => reject(x));
Effect.toString = () => 'Effect';

export default Effect;
