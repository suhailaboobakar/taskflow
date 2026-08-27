# Web App

The web app will be the premium Taskflow client experience.

Planned boundaries:

- `src/app`: Application bootstrap, providers, routing, and global composition.
- `src/features`: Product features such as auth, tasks, dashboard, search, and settings.
- `src/shared`: Client-only shared utilities, hooks, and components.
- `src/widgets`: Composed surfaces that combine multiple features for a screen.

Feature folders should keep UI, hooks, state, schemas, and tests close to the behavior they support.
