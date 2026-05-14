# Framer Motion Animation Design — Quiz Flow (Home → Quiz → Result)

**Date:** 2026-05-14  
**Status:** Approved  
**Scope:** Home, Quiz, and Result pages only

---

## 1. Overview

Add polished Framer Motion animations to the core quiz user journey: Home page category selection, Quiz page question answering, and Result page score review. The goal is to provide satisfying tactile feedback, smooth transitions, and a professional feel without over-engineering or impacting bundle size excessively.

---

## 2. Architecture & Strategy

- **Route-level transitions:** Wrap route content in `AnimatePresence` inside `App.tsx` via a `PageTransition` wrapper component.
- **Shared animation variants:** Centralize reusable variants in `src/lib/animations.ts`.
- **Mantine + Framer Motion coexistence:** Use `motion()` to wrap existing Mantine components. Keep all Mantine props and styling unchanged.
- **Motion defaults:**
  - Spring interactions: `type: "spring", stiffness: 300, damping: 30`
  - Layout transitions: `ease: "easeInOut", duration: 0.3`

---

## 3. New Files

| File | Purpose |
|------|---------|
| `src/lib/animations.ts` | Shared animation variants (fade, slide, stagger, shake, etc.) |
| `src/components/PageTransition.tsx` | Wraps route content for `AnimatePresence` page transitions |
| `src/components/AnimatedCard.tsx` | Reusable `motion(Card)` wrapper with hover/tap defaults |

---

## 4. Home Page Animations

### 4.1 Category Cards — Staggered Entrance
- On mount, cards animate in with `opacity: 0→1` and `translateY: 20→0`.
- Stagger delay: `index * 0.05s` per card.
- Uses `variants` with `staggerChildren` on the container Group.

### 4.2 Card Hover & Tap
- Replace inline `onMouseEnter` / `onMouseLeave` CSS transforms.
- `whileHover={{ y: -4, borderColor: "var(--mantine-color-teal-6)" }}`
- `whileTap={{ scale: 0.98 }}`
- Transition: `type: "spring", stiffness: 400, damping: 25`

### 4.3 Sheet Cards
- Same stagger pattern as category cards.
- Slightly longer initial delay so categories animate first, then sheets.

---

## 5. Quiz Page Animations

### 5.1 Question Transitions (Direction-Aware)
- **Next button:** Current question exits left (`x: -50, opacity: 0`), new question enters from right (`x: 50→0, opacity: 0→1`).
- **Previous button:** Reverse direction.
- `AnimatePresence` with `custom={direction}` prop on the question container.
- Uses `src/lib/animations.ts` `slideVariants`.

### 5.2 Answer Options — Staggered Reveal
- When a new question loads, options stagger in with `opacity: 0→1` and `x: -10→0`.
- Stagger: `0.03s` per option.

### 5.3 Answer Selection Feedback
- **Before submit:** `whileTap={{ scale: 0.97 }}` on tap. Selected state animates border/background via `animate={{ background, borderColor }}`.
- **After submit:**
  - Correct answer: `scale: 1.02` with subtle teal glow (`boxShadow`).
  - Wrong selection: Brief shake animation (`x: [-5, 5, -5, 5, 0]`), duration `0.4s`.

### 5.4 Progress Bar
- Animate width changes with spring physics instead of CSS `transitionDuration`.
- Use `motion.div` with `animate={{ width: \`${progress}%\` }}`.

### 5.5 Explanation Reveal
- When an answer is submitted, show the explanation card with `AnimatePresence`.
- Animation: `opacity: 0→1`, `height: 0→auto` (using `initial={{ opacity: 0, height: 0 }}` and `animate={{ opacity: 1, height: "auto" }}`).

---

## 6. Result Page Animations

### 6.1 Score Ring Entrance
- On mount: `scale: 0→1` with spring (`stiffness: 200, damping: 15`).
- Number counts up from `0` to actual percentage after ring animation settles using Framer Motion `useSpring` or `useMotionValue` mapped to `useTransform`.

### 6.2 Degree Badge
- Fade + slide-up (`y: 10→0, opacity: 0→1`) after score ring animation completes.
- Delay: `0.3s` after ring entrance.

### 6.3 Review Cards — Staggered Entrance
- All review cards stagger in with `opacity: 0→1` and `y: 15→0`.
- Stagger: `0.04s` per card.

### 6.4 Filter Layout Transitions
- When switching between `all` / `correct` / `wrong` filters:
  - Exiting cards: `AnimatePresence` fade out.
  - Entering cards: Staggered fade in.
  - Use `layout` prop on cards for smooth reordering if needed.

### 6.5 Answer Row Color Transitions
- Review page answer rows animate background and border color changes via `animate={{ background, borderColor }}` on mount.

---

## 7. Technical Considerations

### 7.1 Bundle Size
- Framer Motion tree-shakes well. Estimated additional bundle size: ~20–30KB gzipped.
- Only import used features (`motion`, `AnimatePresence`, `useAnimation`, `useInView`).

### 7.2 Performance
- Use `layout` sparingly — only on filter transitions where reordering happens.
- Avoid animating expensive properties (e.g., `box-shadow` frequently). Use transforms and opacity where possible.
- Add `will-change: transform` only during active animations.

### 7.3 Accessibility
- Respect `prefers-reduced-motion` media query.
- If user prefers reduced motion, disable all animations (set `animate` values to immediate defaults).
- Implement via a shared hook or utility in `src/lib/animations.ts`.

### 7.4 Backward Compatibility
- No changes to quiz logic, data flow, routing, or Mantine theming.
- All changes are additive — removal of Framer Motion would leave the app fully functional.

---

## 8. Dependencies

Add to `package.json`:
```json
"framer-motion": "^11.0.0"
```

---

## 9. Out of Scope

- Leaderboard page animations
- Admin page animations
- Entry page animations
- Confetti or particle effects
- Scroll-triggered reveals outside the quiz flow
- Page-level parallax or 3D transforms
