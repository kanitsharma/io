<h1 align="center">
  <br>
  <a href="https://github.com/kanitsharma/io"><img src="logo.png" alt="io" width="200"></a>
</h1>

<h4 align="center">Lightweight monadic abstraction to "purely" handle side effects in javascript.</h4>

<p align="center">
  <a href="https://github.com/prettier/prettier">
        <img src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg" alt="prettier"/>
  </a>
  <a href="https://github.com/rajatsharma/hellpack">
        <img src="https://img.shields.io/badge/uses-hellpack%20%F0%9F%94%A5-%23414770.svg" alt="hellpack"/>
  </a>
  <a href="https://travis-ci.com/kanitsharma/io">
        <img src="https://travis-ci.com/kanitsharma/io.svg?token=sGsp6ken9AnVBDihTPmf&branch=master" alt="travis"/>
  </a>

### An IO provides
- Easy cancellation at any point during its computation and resource cleanup after that.
- Clean API for easy resource management while doing side effects.
- Ultra lightweight, Gzipped ~ 1kb.
- Friendly Error Messages.
- Follows Haskell laws for Functors, Applicatives and Monads [(See the tests for these laws)](https://github.com/kanitsharma/io/tree/master/__tests__).