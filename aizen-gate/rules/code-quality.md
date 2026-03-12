---
trigger: manual
---

# CODE-QUALITY.MD - Code Quality Standards

> **Objective**: Maintain consistent, maintainable, and high-quality code across the entire project.

---

## 1. CLEAN CODE PRINCIPLES

### 1.1 Naming Conventions
1. **Variables**: Use descriptive names (`userCount` not `n`).
2. **Functions**: Verb + Noun pattern (`calculateTotal`, `fetchUsers`).
3. **Classes**: PascalCase (`UserService`, `OrderController`).
4. **Constants**: UPPER_SNAKE_CASE for values that never change.

### 1.2 Function Rules
1. **Single Responsibility**: One function does one thing.
2. **Small Functions**: Maximum 30 lines per function.
3. **No Duplicate Code**: Extract repeated logic to utilities.
4. **Early Returns**: Return early to avoid nested conditionals.

### 1.3 Comments
1. **Why, not What**: Explain reasoning, not implementation.
2. **TODO markers**: Use `// TODO: description` for future work.
3. **JSDoc/TSDoc**: Document public APIs with proper type definitions.

---

## 2. SOLID PRINCIPLES

### 2.1 Single Responsibility (S)
- Each class/module has one reason to change.
- Example: `UserValidator` validates, `UserRepository` saves.

### 2.2 Open/Closed (O)
- Open for extension, closed for modification.
- Use interfaces and inheritance to add features.

### 2.3 Liskov Substitution (L)
- Subtypes must be substitutable for their base types.
- Don't weaken preconditions or strengthen postconditions.

### 2.4 Interface Segregation (I)
- Prefer small, specific interfaces over large ones.
- Example: `Readable` and `Writable` instead of `IO`.

### 2.5 Dependency Inversion (D)
- Depend on abstractions, not concretions.
- Use dependency injection for better testability.

---

## 3. CODE REVIEW CHECKLIST

### Before Submission
- [ ] Code follows naming conventions
- [ ] No console.log or debug statements left
- [ ] Functions are small and focused
- [ ] Error handling is in place
- [ ] Unit tests included for new logic
- [ ] No hardcoded values (use constants/env)
- [ ] No security vulnerabilities (injection, secrets)

### During Review
- [ ] Logic is correct and handles edge cases
- [ ] Performance implications considered
- [ ] Code is readable and maintainable
- [ ] Tests provide adequate coverage

---

## 4. CODE FORMATTING

1. **Auto-format**: Use Prettier or biome for consistent formatting.
2. **Lint**: Run linter before commits (ESLint, Biome).
3. **Pre-commit hooks**: Enforce checks on commit.

---

## 5. COMPLEXITY METRICS

1. **Cyclomatic Complexity**: Keep functions under 10.
2. **Nesting Depth**: Maximum 3 levels of nesting.
3. **Coupling**: Minimize dependencies between modules.
4. **Cohesion**: Related code lives together.