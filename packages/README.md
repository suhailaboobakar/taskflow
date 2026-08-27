# Shared Packages

Shared packages hold stable cross-application code. They should stay small, typed, and framework-light unless a package explicitly owns framework-specific behavior.

- `config`: Shared configuration helpers and tooling presets.
- `contracts`: API request, response, and validation contracts.
- `domain`: Framework-independent domain primitives.
- `ui`: Reusable design-system primitives for the React client.
