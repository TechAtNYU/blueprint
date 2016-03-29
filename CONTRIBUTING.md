# How to contribute

If you are submitting a pull request or pushing to one of our branches then we expect you to adhere to the styling guidelines. We use JSCS (JavaScript Code Style) and JSHint. For sublime you can install the packages:

- [Sublime​Linter-jscs](https://packagecontrol.io/packages/SublimeLinter-jscs)
- [SublimeLinter-jshint](https://github.com/SublimeLinter/SublimeLinter-jshint)

Then when you run the Command-Shift-P in Sublime Text 3 you will see:

- `JSCS: Format this file` -- you should run that on your particular file
- Also you should run `JSHint` and make sure to follow those guidelines.

For development we use the branch `develop`, and for the master branch we use the branch `master`. The `master` branch pushes straight to production so be careful when committing directly to it.
