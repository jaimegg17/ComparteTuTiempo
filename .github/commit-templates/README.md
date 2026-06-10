# Commit Message Templates

Templates for commit messages following proyect formats.

## Usage

### Feature
```
feat(scope): brief description
```

**Ejemplos:**
- `feat(api): implement ratings delete endpoint`
- `feat(web): add ratings list component`
- `feat(api): add service validation to rating creation`

### Bugfix
```
fix(scope): brief description
```

**Ejemplos:**
- `fix(api): correct rating validation logic`
- `fix(web): resolve rating dialog error handling`
- `fix(api): fix type error in rating use case`

## Guidelines

- **Time**: use present ("add" no "added")
- **Length**: max 50 char in first line
- **Scope**: `api`, `web`, `contracts`, or omit if multiple
- **Specific and concrete**: Describe what not how

## Otros tipos

- `test:` for tests
- `chore:` for changes of config/dependencies
- `docs:` for documentation
- `refactor:` for refactors
