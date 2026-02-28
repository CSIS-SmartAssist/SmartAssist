# Figma Context — Final Design

**File:** [Final Design](https://www.figma.com/design/aQVPOnniaSWxAIwnNG698p/Final-Design?node-id=0-1)  
**fileKey:** `aQVPOnniaSWxAIwnNG698p`  
**Purpose:** Reference for screens, light/dark inconsistencies, and responsive behavior. No code yet — context only. You will guide what to do where.

---

## 1. Screens in the file

| Screen | Desktop (light/dark) | Mobile (light/dark) | Notes |
|--------|----------------------|----------------------|--------|
| **Onboarding / Login** | ✓ | ✓ | “Elevate your Academic Journey” — form, social logins (Google, Apple, Facebook), keep me logged in, forgot password. Background has abstract shapes (teal/purple). |
| **Resource booking** | ✓ | ✓ | Grid of resources (rooms, etc.) with images, ratings, prices, “Book now”. Desktop: top nav. Mobile: vertical list, bottom nav. |
| **My Documents** | ✓ | ✓ | Desktop: table/card layout, categories (All, Recent, Shared), upload. Mobile: vertical list/cards. |
| **Smart Assist chat** | ✓ | ✓ | Message bubbles (user vs AI), input, send, suggested prompts. |
| **Dashboards / analytics** | ✓ | ✓ | “Business Command Center”, line charts, data cards (e.g. Total Students, Active Tutors, Reviews), filters. Desktop: multi-chart. Mobile: stacked cards, simplified charts. |

---

## 2. Light vs dark — inconsistencies to align (you’ll specify what to do)

- **Buttons (primary, e.g. Login, Book now)**  
  Dark: more vibrant / glowing (teal/blue). Light: flatter, soft purple.  
  → Decide: same token with theme variants, or separate tokens.

- **Chat**  
  - Input: dark = distinct blue; light = light gray.  
  - Send button: dark = vibrant blue; light = soft purple.  
  → Decide: one set of input/button tokens or theme-specific.

- **Login background**  
  Abstract shapes (teal/purple) — pattern/opacity may differ by theme.  
  → Decide: one asset with theme tint, or separate light/dark assets.

- **Cards / containers**  
  Dark: brighter borders or subtle glow. Light: more diffuse shadows.  
  → Decide: border vs shadow emphasis and if we need theme-specific shadow/border tokens.

- **Icons**  
  Possible hue/saturation differences between themes.  
  → Decide: single icon color token or theme-specific.

---

## 3. Responsiveness — viewports to support

- **Desktop**  
  Multi-column, top nav, full layouts (grids, tables, multi-chart dashboards).

- **Mobile web (mweb)**  
  Single column, vertical stack, bottom nav where relevant; lists/cards instead of tables/grids; simplified charts.

- **In-between (tablet / mid)**  
  Not shown explicitly in the file; assume progressive change:  
  - Grid → fewer columns → single column.  
  - Typography, spacing, and component layout should scale with breakpoints (e.g. Tailwind `sm`/`md`/`lg`).

**Breakpoints to use (Tailwind default):**  
`sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `2xl` 1536px — exact usage to be decided per screen.

---

## 4. Implementation checklist (for when we code)

- [ ] Resolve light/dark inconsistencies (per your guidance).
- [ ] Desktop: all screens responsive at large viewport.
- [ ] Mobile: all screens responsive (stack, bottom nav, touch-friendly).
- [ ] In-between: breakpoints and layout transitions defined per screen.
- [ ] Colors: only design token classes / CSS variables; no hardcoded colors.

---

You can point to specific screens or components (e.g. “login button”, “chat input”, “dashboard cards”) and say how they should behave in light vs dark and at each viewport; we’ll apply that when we start coding.
