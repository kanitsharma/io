<img src='logo.png' width='400' height='400'  style='margin-bottom: -70px; transform: translateX(-50px);' />

# Lightweight monadic abstraction to "purely" handle side effects in javascript.

## An IO provides
- Easy cancellation at any point during its computation and resource cleanup after that.
- Clean API for easy resource management while doing side effects.
- Ultra lightweight, Gzipped ~ 1kb.
- Friendly Error Messages.
- Follows Haskell laws for Functors, Applicatives and Monads [(See the tests for these laws)](https://github.com/kanitsharma/io/tree/master/__tests__).