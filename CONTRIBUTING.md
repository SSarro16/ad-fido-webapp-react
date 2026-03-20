# Contributing

This repository uses a lightweight feature-branching workflow designed to work well with GitHub, CI, and Render deployments.

## Branch Strategy

- `main` is the production-ready branch
- create short-lived branches from `main` for each feature, fix, or refactor
- merge changes back through Pull Requests
- keep branches focused on one change at a time

Recommended branch names:

- `feature/<short-name>`
- `fix/<short-name>`
- `refactor/<short-name>`
- `docs/<short-name>`

## Commit Messages

Use Conventional Commits:

- `feat: add Render deployment blueprint`
- `fix: serve SPA routes in production`
- `docs: add repository workflow guide`
- `refactor: simplify environment configuration`
- `test: add subscriber service coverage`
- `chore: update project tooling`

Each commit should represent one logical unit of work whenever possible.

## Pull Requests

Open a Pull Request before merging into `main`.

A good PR should:

- have a clear title
- describe the change and why it exists
- stay focused on one main concern
- be small enough to review confidently
- pass CI before merge

## GitHub Settings

After the GitHub repository is created, enable these recommended settings:

- protect `main`
- require pull requests before merging
- require CI checks to pass before merging
- auto-delete merged branches

## Deployment

Render deploys from this repository using [`render.yaml`](./render.yaml).

Before merging changes that affect production behavior, verify:

- `npm run typecheck`
- `npm run lint`
- `npm run test:run`
- `npm run build`

## Reference Material

The project also includes internal reference notes under [`version-control/`](./version-control/):

- Git and GitHub basics
- pull request guidance
- branching strategy notes
