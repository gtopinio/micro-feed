# Development Setup

## Git Hooks (Husky)

This project uses Husky for git hooks to maintain code quality:

### Pre-commit Hook

- **TypeScript type checking** - Ensures no type errors
- **ESLint** - Code linting with auto-fix
- **Prettier** - Code formatting

### Commit Message Validation

- **Conventional Commits** format enforced
- Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `build`, `ci`, `revert`

### Example Commit Messages

```
feat: add user authentication
fix: resolve post creation bug
docs: update README with setup instructions
chore: update dependencies
```

### Available Scripts

- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking
- `npm run dev` - Start development server
- `npm run build` - Build for production

## Getting Started

1. Install dependencies: `npm install`
2. Copy environment variables: `cp .env.example .env.local`
3. Set up Supabase database (instructions below)
4. Run development server: `npm run dev`

---

_More setup instructions will be added as we implement the core features._
