# GitFlow Action Release Template

[GitHub Actions](https://docs.github.com/en/actions) has given developers a powerful toolkit to automate workflows and share them in the [GitHub Marketplace](https://github.com/marketplace?type=actions). Unfortunatly, GitHub made some [short-sighted decisions](https://docs.github.com/en/actions/creating-actions/publishing-actions-in-github-marketplace) about how [JavaScript actions](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action) have to be packaged to be published:

- The action must be in a public repository
- Each repository must contain a single action
- The action's metadata file must be in the root directory

If you are building an action that has dependencies or compiling your code with [Typescript](https://www.typescriptlang.org/) and/or [Babel](https://babeljs.io/), you need to check you `node_modules` folder and compiled code into the default branch of your repo, which defeats the purpose of Node.js module pattern, bloats the size of the final payload and adds a lot of noise to your development graph. This is because when GitHub pulls as JavaScript and action it simply checks out the entire source code for the release.

Fortunatly, we we can also specify actions as [Docker images](https://docs.github.com/en/free-pro-team@latest/actions/creating-actions/metadata-syntax-for-github-actions#runs-for-docker-actions) in public registries, which allows us to build the action code a when a new release is cut. This repository is a template that is configures a build and release workflow that automate the process if you simply follow the tried and true [GitFlow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) branching model.

## Usage
