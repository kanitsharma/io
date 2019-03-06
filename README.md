# <h1 style='font-size: 50px;' >IO</h1>

[![Build Status](https://travis-ci.com/kanitsharma/io.svg?token=sGsp6ken9AnVBDihTPmf&branch=master)](https://travis-ci.com/kanitsharma/io)

# Lightweight monadic abstraction to "purely" handle side effects in javascript.

## An IO provides
- Easy cancellation at any point during its computation and resource cleanup after that.
- Clean API for easy resource management while doing side effects.
- Ultra lightweight, Gzipped ~ 1kb.
- Friendly Error Messages.
- Follows Haskell laws for Functors, Applicatives and Monads [(See the tests for these laws)](https://github.com/kanitsharma/io/tree/master/__tests__).