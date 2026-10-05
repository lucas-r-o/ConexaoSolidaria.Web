# Angular Template Conventions

Read this file when building forms, tables, or when the project has styling rules to follow.

## Forms
- One `<label for>` per input, with a matching `id`.
- Show errors only after `touched` or `dirty`.
- Use `role="alert"` on validation messages.
- Disable submit with `[disabled]="form.invalid"`.

## Styling
- Source of truth: `src/styles.css` (`:root` variables). Read it before styling.
- Use `var(--name)` for every color, font, spacing, radius and shadow.
- Do not hardcode colors, and do not create new variables without asking.
- Put component-specific styles in the component's own CSS file, using the global variables.

## Naming
- Selector prefix: `app-`.
- File names: `feature-name.component.html`.