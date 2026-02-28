# SmartAssist Design Token System

Design tokens derived from [Figma — Final Design](https://www.figma.com/design/aQVPOnniaSWxAIwnNG698p/Final-Design?node-id=0-1).

**Primary:** **Color tokens** (below) are the core of the system — use them for all UI colors in light and dark theme. No hardcoded hex/rgb in components.  
**Source:** Token values are taken from the **desktop** view in Figma. These same desktop theme colors apply at **all viewports** (desktop, tablet, mobile). Mobile in Figma is used only for **layout and positioning** (e.g. single column, bottom nav), not for different colors.  
**Rest:** Typography, spacing, radius, shadows, breakpoints can be managed with Tailwind’s utilities as needed; the tables below are optional reference.

---

## 1. Color Tokens

### Backgrounds
| Token | Light | Dark | Usage |
|-------|--------|------|--------|
| `background` | Near white | Near black / dark blue-grey | Page, app canvas |
| `background-secondary` | Light grey | Lighter dark grey | Cards, panels, elevated surfaces |
| `background-tertiary` | Slightly darker grey | Subtle elevation | Inputs, dropdowns |
| `background-accent` | Primary tint (subtle) | Primary tint (subtle) | Hover states, selected |

### Text
| Token | Light | Dark | Usage |
|-------|--------|------|--------|
| `foreground` | Dark grey / black | White / light grey | Primary text |
| `foreground-secondary` | Medium grey | Medium light grey | Secondary text, captions |
| `foreground-muted` | Lighter grey | Muted light grey | Placeholders, hints |
| `foreground-on-accent` | White | White | Text on primary/accent buttons |

### Accent / Brand
| Token | Light | Dark | Usage |
|-------|--------|------|--------|
| `primary` | Purple/blue | Same (vibrant on dark) | Primary buttons, links, key actions |
| `primary-hover` | Darker purple/blue | Lighter | Hover state |
| `primary-muted` | Light purple tint | Dark purple tint | Backgrounds, badges |
| `accent-teal` | Teal | Teal | Success, secondary accent, charts |
| `accent-green` | Green | Green | Success, positive states |
| `accent-orange` | Orange | Orange | Warning, highlights |
| `accent-red` | Red | Red | Error, destructive |

### Borders & Dividers
| Token | Light | Dark | Usage |
|-------|--------|------|--------|
| `border` | Light grey | Dark grey | Default borders |
| `border-strong` | Darker grey | Lighter grey | Focus, emphasis |
| `border-focus` | Primary / teal | Teal glow | Focus rings |

### Shadows (light mode only; dark uses subtle glow or border)
| Token | Value | Usage |
|-------|--------|--------|
| `shadow-sm` | Subtle | Cards, dropdowns |
| `shadow-md` | Medium | Modals, raised panels |
| `shadow-lg` | Large | Overlays |

---

## 2. Typography Tokens

| Token | Value | Usage |
|-------|--------|--------|
| `font-sans` | Geist / system UI | Body, UI |
| `font-mono` | Geist Mono / monospace | Code, data |
| `text-xs` | 0.75rem | Captions, labels |
| `text-sm` | 0.875rem | Secondary, form labels |
| `text-base` | 1rem | Body |
| `text-lg` | 1.125rem | Lead, emphasis |
| `text-xl` | 1.25rem | Section titles |
| `text-2xl` | 1.5rem | Page titles |
| `text-3xl` | 1.875rem | Hero, login title |
| `font-normal` | 400 | Body |
| `font-medium` | 500 | Labels, buttons |
| `font-semibold` | 600 | Headings |
| `font-bold` | 700 | Strong emphasis |
| `leading-tight` | 1.25 | Headings |
| `leading-normal` | 1.5 | Body |
| `leading-relaxed` | 1.625 | Long copy |

---

## 3. Spacing Tokens

| Token | Value | Usage |
|-------|--------|--------|
| `space-0` | 0 | Reset |
| `space-1` | 0.25rem (4px) | Icon padding, tight gaps |
| `space-2` | 0.5rem (8px) | Inline gaps |
| `space-3` | 0.75rem (12px) | Small padding |
| `space-4` | 1rem (16px) | Default padding |
| `space-5` | 1.25rem (20px) | |
| `space-6` | 1.5rem (24px) | Section padding |
| `space-8` | 2rem (32px) | Large sections |
| `space-10` | 2.5rem (40px) | |
| `space-12` | 3rem (48px) | Page margins |
| `space-16` | 4rem (64px) | Hero, large blocks |

---

## 4. Radius Tokens

| Token | Value | Usage |
|-------|--------|--------|
| `radius-none` | 0 | |
| `radius-sm` | 0.25rem (4px) | Badges, tags |
| `radius-md` | 0.375rem (6px) | Buttons, inputs |
| `radius-lg` | 0.5rem (8px) | Cards, modals |
| `radius-xl` | 0.75rem (12px) | Panels |
| `radius-full` | 9999px | Pills, avatars |

---

## 5. Breakpoints (responsive)

| Token | Min width | Usage |
|-------|-----------|--------|
| `sm` | 640px | Large phones, small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Wide |

---

## 6. Z-Index Scale

| Token | Value | Usage |
|-------|--------|--------|
| `z-base` | 0 | Default |
| `z-dropdown` | 50 | Dropdowns |
| `z-sticky` | 100 | Sticky headers |
| `z-modal` | 200 | Modals |
| `z-toast` | 300 | Toasts |
| `z-tooltip` | 400 | Tooltips |

---

## 7. Usage in Code

- **Tailwind:** Use semantic utility classes: `bg-background`, `text-foreground`, `bg-primary`, `text-primary`, `border-border`, `rounded-lg`, `shadow-md`, etc.
- **CSS:** Use `var(--token-name)` when custom CSS is needed.
- **Dark mode:** Toggle via `class="dark"` on `<html>`. All tokens switch via CSS variables.

---

## 8. Theme Toggle

- **Provider:** `src/components/theme-provider.tsx` (wraps app in layout; uses `next-themes` with `attribute="class"`).
- **Toggle:** `src/components/ui/theme-toggle.tsx` — use `<ThemeToggle />` anywhere to switch light/dark. Respects system preference by default; toggle overrides for the session.

---

## 9. Figma Reference

- **File:** [Final Design](https://www.figma.com/design/aQVPOnniaSWxAIwnNG698p/Final-Design?node-id=0-1)
- **fileKey:** `aQVPOnniaSWxAIwnNG698p`
- Screens: Login, resource booking, My Documents, dashboard (Business Command Center), chat — in light and dark, desktop and mobile.
- After tokens are locked, we implement screens one by one using this file.
