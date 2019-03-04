# IO
Lightweight monadic abstraction to "purely" handle side effects in javascript.

## An IO provides
- Easy cancellation at any point during its computation and resource cleanup after that.
- Clean API for easy resource management while doing side effects.
- Ultra lightweight.
- Friendly Error Messages.
- Follows Haskell laws for Functors, Applicatives and Monads [(See the tests for these laws)](https://github.com/kanitsharma/io/tree/master/__tests__).