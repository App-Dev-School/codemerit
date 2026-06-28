# CodeMerit — Color Management Guide

All app colors are managed in **one file**:
**`src/assets/css/tokens.css`**

Edit that file → rebuild Tailwind → colors update everywhere.

---

## How to rebuild after changing colors

```bash
npx tailwindcss -i ./src/tailwind.scss -o ./src/assets/css/tailwind.output.css
```

---

## Token Reference

Each token has two values — one for **light mode** (`:root`) and one for **dark mode** (`.dark`).

### Backgrounds

| Token | Class to use | Light value | Dark value | Used for |
|---|---|---|---|---|
| `--cm-surface` | `bg-cm-surface` | `#ffffff` | `#0f172a` | Main cards, page background |
| `--cm-surface-muted` | `bg-cm-surface-muted` | `#f8fafc` | `#020617` | Sidebars, subheaders, panels |
| `--cm-surface-raised` | `bg-cm-surface-raised` | `#f1f5f9` | `#1e293b` | Inputs, chips, inner boxes |
| `--cm-surface-hover` | `bg-cm-surface-hover` | `#e2e8f0` | `#334155` | Button hover states |

### Borders

| Token | Class to use | Light value | Dark value | Used for |
|---|---|---|---|---|
| `--cm-border` | `border-cm-border` | `#e2e8f0` | `#1e293b` | Default dividers, card outlines |
| `--cm-border-strong` | `border-cm-border-strong` | `#cbd5e1` | `#334155` | Emphasized borders, focus rings |

### Text

| Token | Class to use | Light value | Dark value | Used for |
|---|---|---|---|---|
| `--cm-text-primary` | `text-cm-text-primary` | `#0f172a` | `#f8fafc` | Headings, important labels |
| `--cm-text-secondary` | `text-cm-text-secondary` | `#64748b` | `#94a3b8` | Body text, descriptions |
| `--cm-text-muted` | `text-cm-text-muted` | `#94a3b8` | `#475569` | Placeholders, timestamps, meta |

### Brand (change these to rebrand the app)

| Token | Class to use | Light value | Dark value | Used for |
|---|---|---|---|---|
| `--cm-brand` | `bg-cm-brand` | `#6366f1` | `#818cf8` | Primary buttons, active states |
| `--cm-brand-dim` | `bg-cm-brand-dim` | `indigo 10% opacity` | `indigo 12% opacity` | Subtle brand tint on backgrounds |
| `--cm-brand-text` | `text-cm-brand-text` | `#4338ca` | `#818cf8` | Brand-colored text on surfaces |
| `--cm-brand-ring` | `ring-cm-brand-ring` | `indigo 35% opacity` | `indigo 40% opacity` | Focus ring, active outlines |

---

## How to change the brand color

Open `src/assets/css/tokens.css` and change these two lines:

```css
:root {
  --cm-brand:      #6366f1;   /* ← your new light mode brand color */
  --cm-brand-text: #4338ca;   /* ← slightly darker shade for text  */
}

.dark {
  --cm-brand:      #818cf8;   /* ← your new dark mode brand color  */
  --cm-brand-text: #818cf8;
}
```

Then rebuild Tailwind. Every button, badge, and accent in the app updates.

---

## Colors NOT in tokens.css

These are **status/accent colors** that stay fixed regardless of theme. They are Tailwind's built-in palette and read fine on both light and dark backgrounds:

| Purpose | Light class | Dark class | Example use |
|---|---|---|---|
| Success | `text-emerald-600` | `text-emerald-400` | Online badge, passed |
| Warning | `text-amber-600` | `text-amber-400` | Under review, caution |
| Danger | `text-rose-600` | `text-rose-400` | No hire, error |
| Info | `text-sky-600` | `text-sky-400` | Info chips |
| Code / Terminal | `text-cyan-600` | `text-cyan-400` | Code labels |

These are written directly in components as `text-emerald-600 dark:text-emerald-400`.

---

## Cheat sheet — what to write in a component

```html
<!-- Card shell -->
<div class="bg-cm-surface border border-cm-border rounded-xl shadow-sm">

  <!-- Section header -->
  <div class="bg-cm-surface-muted border-b border-cm-border px-4 py-3">
    <h3 class="text-cm-text-primary font-semibold">Title</h3>
    <p class="text-cm-text-secondary text-sm">Description</p>
  </div>

  <!-- Inner content -->
  <div class="p-4">
    <input class="bg-cm-surface-raised border border-cm-border
                  text-cm-text-primary placeholder:text-cm-text-muted" />

    <!-- Primary action -->
    <button class="bg-cm-brand text-white hover:opacity-90">
      Submit
    </button>

    <!-- Subtle brand tint -->
    <span class="bg-cm-brand-dim text-cm-brand-text border border-cm-brand">
      Badge
    </span>
  </div>

</div>
```

---

## File locations

| File | Purpose |
|---|---|
| `src/assets/css/tokens.css` | **Edit this** — all color values |
| `tailwind.config.js` | Maps token names to Tailwind classes (don't touch) |
| `src/assets/css/tailwind.output.css` | Auto-generated, never edit manually |
| `src/app/core/service/theme.service.ts` | Handles the light/dark toggle at runtime |
