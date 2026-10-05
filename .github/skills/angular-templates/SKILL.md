---
name: angular-templates
description: Creates and edits Angular component HTML templates (.component.html) following modern conventions - built-in control flow, signals, reactive forms, accessibility and @defer. Use when the user says "create the template", "build the HTML for this component", "add a form", "create a list/table/card component", or edits any .component.html file. Do NOT use for component TypeScript logic, services, routing, or SCSS-only tasks.
---

# Angular Templates

Build Angular HTML templates that are accessible, performant and free of logic. Assumes Angular 17+ with standalone components and signals. If the project uses an older version, check `package.json` first and use `*ngIf` / `*ngFor` instead of control flow.

## Instructions

### Step 1: Read the component first

Open the `.component.ts` file before writing any HTML. Identify inputs, outputs, signals, `computed()` values and form definitions, so the template binds to what already exists. Do not invent properties.

### Step 2: Follow the project patterns

Look at one or two existing `.component.html` files in the project. Match their naming, CSS approach (Tailwind, Angular Material, SCSS classes) and structure before introducing anything new.

### Step 2b: Read the global palette

Open `src/styles.css` and read the `:root` block. Use only the CSS variables defined there (colors, spacing, radius, fonts, shadows) in templates and component styles. Never hardcode hex, rgb or hsl values. If a needed color has no variable, use the closest existing one and tell the user instead of inventing a new color.

### Step 3: Write the template

Apply these rules:

- Use built-in control flow (`@if`, `@for`, `@switch`), not `*ngIf` / `*ngFor`.
- Always add `track` in `@for`, for example `@for (item of items(); track item.id)`.
- Call signals in the template: `{{ count() }}`.
- Keep logic out of templates. Move conditions and transformations to `computed()` or the class.
- Use `[class.active]` and `[style.width.px]` for simple cases instead of `ngClass` / `ngStyle`.
- Use semantic tags (`button`, `nav`, `section`, `main`, `ul`) and never a `div` with `(click)` as a button.
- Add `alt` to images (`alt=""` if decorative) and `aria-label` to icon-only buttons.
- Use `@defer` for heavy or below-the-fold content (charts, editors, maps). Do not defer content visible on first load.
- Forms: use reactive forms (`[formGroup]`, `formControlName`). Read `references/conventions.md` for form and validation message patterns.

### Step 4: Keep it small

If the template grows past roughly 100 lines or repeats a block, extract a child component and mention it to the user.

### Step 5: Check the result

Confirm that every binding exists in the `.ts` file, every `@for` has `track`, every image has `alt`, and every required import (`ReactiveFormsModule`, child components) is listed in the component `imports`.

## Examples

### Example 1: List with empty state

User says: "Create the template for a user list component"

Actions:
1. Read `user-list.component.ts` and find the `users` signal.
2. Write the template using `@if`, `@for` and `@else`.

Result:

```html
@if (users().length) {
  <ul>
    @for (user of users(); track user.id) {
      <li>{{ user.name }}</li>
    }
  </ul>
} @else {
  <p>No users found.</p>
}
```

### Example 2: Login form

User says: "Add the HTML for the login form"

Actions:
1. Read the `FormGroup` in the `.ts` file and use its exact control names.
2. Bind with `[formGroup]` and `formControlName`.

Result:

```html
<form [formGroup]="form" (ngSubmit)="submit()">
  <label for="email">Email</label>
  <input id="email" type="email" formControlName="email" />
  @if (form.controls.email.touched && form.controls.email.errors?.['required']) {
    <span role="alert">Email is required.</span>
  }

  <button type="submit" [disabled]="form.invalid">Sign in</button>
</form>
```

### Example 3: Heavy content

User says: "Add the sales chart at the bottom of the dashboard"

Result:

```html
@defer (on viewport) {
  <app-sales-chart [data]="sales()" />
} @placeholder {
  <p>Loading chart...</p>
}
```

## Troubleshooting

### Error: `@if` or `@for` is not recognized

Cause: the project uses Angular older than 17. Solution: check `package.json`, then use `*ngIf` / `*ngFor` with `trackBy`.

### Error: Can't bind to 'formGroup' since it isn't a known property of 'form'

Cause: `ReactiveFormsModule` is missing. Solution: add it to the component `imports` array.

### Error: Property does not exist on type

Cause: the template uses a property that is not in the `.ts` file. Solution: re-read the component class and use the real names, or ask the user before adding new ones.

### Error: Colors look wrong or default

Cause: the template uses a variable name that doesn't exist in `:root`. Solution: re-read `src/styles.css` and use the exact variable names.