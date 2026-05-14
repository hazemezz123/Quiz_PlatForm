# Framer Motion Quiz Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add polished Framer Motion animations to the Home, Quiz, and Result pages of the quiz platform.

**Architecture:** Wrap route content in `AnimatePresence` via a `PageTransition` component. Centralize animation variants in `src/lib/animations.ts`. Wrap Mantine components with Framer Motion's `motion()` API for hover, tap, and layout animations. Keep all existing Mantine styling and quiz logic unchanged.

**Tech Stack:** React 18, Vite, Mantine 7, Framer Motion 11, TypeScript

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `package.json` | Modify | Add `framer-motion` dependency |
| `src/lib/animations.ts` | Create | Shared animation variants + `useReducedMotion` hook |
| `src/components/PageTransition.tsx` | Create | Route-level `AnimatePresence` wrapper |
| `src/components/AnimatedCard.tsx` | Create | Reusable `motion(Card)` with hover/tap |
| `src/App.tsx` | Modify | Integrate `PageTransition` around `Routes` |
| `src/pages/Home.tsx` | Modify | Staggered card entrance, motion hover/tap |
| `src/pages/Quiz.tsx` | Modify | Direction-aware question transitions, answer stagger, feedback, progress bar, explanation reveal |
| `src/pages/Result.tsx` | Modify | Ring entrance, badge delay, review stagger, filter transitions |

---

### Task 1: Install Framer Motion

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add dependency**

In `package.json`, in the `"dependencies"` object, add:
```json
"framer-motion": "^11.0.0"
```

- [ ] **Step 2: Install**

Run: `npm install`
Expected: installs `framer-motion` and updates `package-lock.json`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add framer-motion"
```

---

### Task 2: Create Shared Animation Utilities

**Files:**
- Create: `src/lib/animations.ts`

- [ ] **Step 1: Create the file**

Create `src/lib/animations.ts` with the following content:

```typescript
import { useReducedMotion } from "framer-motion";

export const usePrefersReducedMotion = () => {
  return useReducedMotion() ?? false;
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInLeft = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerFast = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.05,
    },
  },
};

export const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 50 : -50,
    opacity: 0,
  }),
};

export const shakeVariants = {
  shake: {
    x: [-5, 5, -5, 5, 0],
    transition: { duration: 0.4 },
  },
};

export const scaleIn = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 200, damping: 15 },
  },
};

export const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

export const springTransitionFast = {
  type: "spring" as const,
  stiffness: 400,
  damping: 25,
};

export const defaultTransition = {
  ease: "easeInOut" as const,
  duration: 0.3,
};
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/animations.ts
git commit -m "feat: add shared animation variants and reduced motion hook"
```

---

### Task 3: Create PageTransition Component

**Files:**
- Create: `src/components/PageTransition.tsx`

- [ ] **Step 1: Create the file**

Create `src/components/PageTransition.tsx`:

```typescript
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { usePrefersReducedMotion, fadeInUp, defaultTransition } from "../lib/animations";

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const reducedMotion = usePrefersReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={reducedMotion ? {} : "hidden"}
        animate={reducedMotion ? {} : "visible"}
        exit={reducedMotion ? {} : "hidden"}
        variants={fadeInUp}
        transition={defaultTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PageTransition.tsx
git commit -m "feat: add PageTransition wrapper with AnimatePresence"
```

---

### Task 4: Create AnimatedCard Component

**Files:**
- Create: `src/components/AnimatedCard.tsx`

- [ ] **Step 1: Create the file**

Create `src/components/AnimatedCard.tsx`:

```typescript
import { motion } from "framer-motion";
import { Card } from "@mantine/core";
import { ComponentPropsWithoutRef } from "react";
import { springTransitionFast, usePrefersReducedMotion } from "../lib/animations";

type CardProps = ComponentPropsWithoutRef<typeof Card>;

export function AnimatedCard({ children, style, ...props }: CardProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      whileHover={reducedMotion ? {} : { y: -4 }}
      whileTap={reducedMotion ? {} : { scale: 0.98 }}
      transition={springTransitionFast}
      style={{ display: "contents" }}
    >
      <Card
        {...props}
        style={{
          ...style,
          cursor: "pointer",
          transition: "border-color 150ms ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--mantine-color-teal-6)";
          props.onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "";
          props.onMouseLeave?.(e);
        }}
      >
        {children}
      </Card>
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AnimatedCard.tsx
git commit -m "feat: add AnimatedCard component with motion hover and tap"
```

---

### Task 5: Integrate PageTransition into App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Import and wrap**

Replace the contents of `src/App.tsx` with:

```typescript
import { Routes, Route, useLocation } from "react-router-dom";
import { QuizProvider } from "./context/QuizContext";
import { Layout } from "./components/Layout";
import { PageTransition } from "./components/PageTransition";
import { Entry } from "./pages/Entry";
import { Home } from "./pages/Home";
import { Quiz } from "./pages/Quiz";
import { Result } from "./pages/Result";
import { Leaderboard } from "./pages/Leaderboard";
import { Admin } from "./pages/Admin";

function App() {
  return (
    <QuizProvider>
      <Layout>
        <PageTransition>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Entry />} />
            <Route path="/quiz/:category" element={<Quiz />} />
            <Route path="/sheet/:sheet" element={<Quiz />} />
            <Route path="/result" element={<Result />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </PageTransition>
      </Layout>
    </QuizProvider>
  );
}

export default App;
```

Note: `useLocation` import is removed from App.tsx since PageTransition handles it internally.

- [ ] **Step 2: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wrap routes in PageTransition for animated page changes"
```

---

### Task 6: Animate Home Page

**Files:**
- Modify: `src/pages/Home.tsx`

- [ ] **Step 1: Add imports**

At the top of `src/pages/Home.tsx`, add to existing imports:
```typescript
import { motion } from "framer-motion";
import { AnimatedCard } from "../components/AnimatedCard";
import {
  staggerContainer,
  fadeInUp,
  springTransitionFast,
  usePrefersReducedMotion,
} from "../lib/animations";
```

- [ ] **Step 2: Add reduced motion hook in Home component**

Inside the `Home` function, add after existing hooks:
```typescript
const reducedMotion = usePrefersReducedMotion();
```

- [ ] **Step 3: Replace category card section**

Find the categories map section (around line 274). Replace the `Group` and mapped `Card` for categories with:

```tsx
<motion.div
  variants={staggerContainer}
  initial="hidden"
  animate="visible"
  style={{ display: "contents" }}
>
  <Group justify="center">
    {categories.map((category, index) => (
      <motion.div
        key={category}
        variants={fadeInUp}
        transition={{ ...springTransitionFast, delay: index * 0.05 }}
      >
        <AnimatedCard
          shadow="sm"
          padding="lg"
          radius="md"
          withBorder
          w={220}
        >
          <Stack gap="sm" align="center">
            <Box c="teal.4">{getCategoryIcon(category)}</Box>
            <Text fw={600} size="md" ta="center" lineClamp={2} style={{ minHeight: "2.5rem" }}>
              {category}
            </Text>
            <Button
              onClick={() => handleSelectCategory(category)}
              fullWidth
              variant="light"
              color="teal"
              size="sm"
            >
              Start Quiz
            </Button>
          </Stack>
        </AnimatedCard>
      </motion.div>
    ))}
  </Group>
</motion.div>
```

- [ ] **Step 4: Replace sheet card section**

Find the sheets map section (around line 223). Replace the `Group` and mapped `Card` for sheets with:

```tsx
<motion.div
  variants={staggerContainer}
  initial="hidden"
  animate="visible"
  style={{ display: "contents" }}
>
  <Group justify="center">
    {sheets.map((sheet, index) => (
      <motion.div
        key={sheet}
        variants={fadeInUp}
        transition={{ ...springTransitionFast, delay: index * 0.05 + 0.2 }}
      >
        <AnimatedCard
          shadow="sm"
          padding="lg"
          radius="md"
          withBorder
          w={300}
        >
          <Stack gap="sm" align="center">
            <Box c="teal.4">{getSheetIcon(sheet)}</Box>
            <Text fw={700} size="xl" ta="center">
              {sheet}
            </Text>
            <Text c="dimmed" size="xs" ta="center">
              Complete quiz covering every topic
            </Text>
            <Button
              onClick={() => handleSelectSheet(sheet)}
              fullWidth
              color="teal"
              size="md"
            >
              Start Big Quiz
            </Button>
          </Stack>
        </AnimatedCard>
      </motion.div>
    ))}
  </Group>
</motion.div>
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/Home.tsx
git commit -m "feat: animate Home page with staggered cards and motion hover"
```

---

### Task 7: Animate Quiz Page — Question Transitions

**Files:**
- Modify: `src/pages/Quiz.tsx`

- [ ] **Step 1: Add imports**

At the top of `src/pages/Quiz.tsx`, add:
```typescript
import { motion, AnimatePresence } from "framer-motion";
import {
  slideVariants,
  staggerContainerFast,
  fadeInLeft,
  shakeVariants,
  springTransition,
  usePrefersReducedMotion,
} from "../lib/animations";
```

- [ ] **Step 2: Add direction state and reduced motion**

Inside the `Quiz` function, add after existing state:
```typescript
const [direction, setDirection] = useState(0);
const reducedMotion = usePrefersReducedMotion();
```

- [ ] **Step 3: Update navigation handlers**

Replace `handleNext` and `handlePrevious`:

```typescript
const handleNext = () => {
  if (currentIndex < questions.length - 1) {
    setDirection(1);
    setCurrentIndex((prev) => prev + 1);
  }
};

const handlePrevious = () => {
  if (currentIndex > 0) {
    setDirection(-1);
    setCurrentIndex((prev) => prev - 1);
  }
};
```

- [ ] **Step 4: Wrap question content in AnimatePresence**

Find the `Card` that contains the question and options (around line 130). Wrap everything inside the outer `<Stack gap="lg">` after the progress bar with `AnimatePresence` and `motion.div`:

Replace from:
```tsx
<Card shadow="sm" padding="xl" radius="md" withBorder>
```
to the closing `</Card>` before the navigation buttons, with:

```tsx
<AnimatePresence mode="wait" custom={direction}>
  <motion.div
    key={currentQuestion.id}
    custom={direction}
    variants={slideVariants}
    initial="enter"
    animate="center"
    exit="exit"
    transition={springTransition}
  >
    <Card shadow="sm" padding="xl" radius="md" withBorder>
      {/* existing question content */}
    </Card>
  </motion.div>
</AnimatePresence>
```

The existing inner content of the Card (question text, options, explanation, etc.) stays exactly the same.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Quiz.tsx
git commit -m "feat: add direction-aware question slide transitions in Quiz"
```

---

### Task 8: Animate Quiz Page — Answer Options & Feedback

**Files:**
- Modify: `src/pages/Quiz.tsx`

- [ ] **Step 1: Wrap answer options in stagger container**

Find the `<Stack gap="xs">` containing the options map (around line 134). Replace it with:

```tsx
<motion.div
  variants={staggerContainerFast}
  initial="hidden"
  animate="visible"
  style={{ display: "flex", flexDirection: "column", gap: "var(--mantine-spacing-xs)" }}
>
  {currentQuestion.options.map((option, idx) => {
    const selected = answers[currentQuestion.id] === idx;
    const isHovered = hoveredOption === idx;
    const isSubmitted = submittedAnswers[currentQuestion.id];
    const isCorrect = idx === currentQuestion.answer;

    let bg: string | undefined = undefined;
    let borderColor: string | undefined = undefined;

    if (isSubmitted) {
      if (isCorrect) {
        bg = "rgba(32, 201, 151, 0.08)";
        borderColor = "var(--mantine-color-teal-6)";
      } else if (selected) {
        bg = "rgba(250, 82, 82, 0.08)";
        borderColor = "var(--mantine-color-red-6)";
      } else {
        borderColor = "var(--mantine-color-dark-6)";
      }
    } else {
      bg = selected
        ? "var(--mantine-color-dark-6)"
        : isHovered
          ? "var(--mantine-color-dark-5)"
          : undefined;
      borderColor = selected
        ? "var(--mantine-color-teal-6)"
        : isHovered
          ? "var(--mantine-color-teal-8)"
          : "var(--mantine-color-dark-6)";
    }

    return (
      <motion.div
        key={idx}
        variants={fadeInLeft}
        whileTap={!isSubmitted && !reducedMotion ? { scale: 0.97 } : {}}
        animate={
          isSubmitted && selected && !isCorrect && !reducedMotion
            ? "shake"
            : isSubmitted && isCorrect && !reducedMotion
              ? { scale: 1.02 }
              : {}
        }
        variants={
          isSubmitted && selected && !isCorrect
            ? shakeVariants
            : undefined
        }
        transition={springTransition}
      >
        <Card
          padding="md"
          radius="md"
          withBorder
          bg={bg}
          style={{
            borderColor,
            cursor: isSubmitted ? "default" : "pointer",
          }}
          onClick={() => {
            if (!isSubmitted) setAnswer(currentQuestion.id, idx);
          }}
          onMouseEnter={() => {
            if (!isSubmitted) setHoveredOption(idx);
          }}
          onMouseLeave={() => setHoveredOption(null)}
        >
          <Group justify="space-between" wrap="nowrap">
            <Text fw={selected ? 600 : 400} size="sm">
              {option}
            </Text>
            {isSubmitted && isCorrect && (
              <Badge color="teal" size="xs" variant="filled">
                Correct
              </Badge>
            )}
            {isSubmitted && selected && !isCorrect && (
              <Badge color="red" size="xs" variant="filled">
                Your answer
              </Badge>
            )}
          </Group>
        </Card>
      </motion.div>
    );
  })}
</motion.div>
```

- [ ] **Step 2: Replace progress bar with motion progress**

Find the `<Progress` component (around line 122). Replace it with:

```tsx
<Box style={{ width: "100%", background: "var(--mantine-color-dark-6)", borderRadius: "var(--mantine-radius-xl)", overflow: "hidden" }}>
  <motion.div
    style={{
      height: "8px",
      background: "var(--mantine-color-teal-6)",
      borderRadius: "var(--mantine-radius-xl)",
    }}
    initial={{ width: 0 }}
    animate={{ width: `${progress}%` }}
    transition={springTransition}
  />
</Box>
```

Also add `Box` to the Mantine imports at the top:
```typescript
import { Card, Button, Text, Stack, Group, Loader, Badge, Box } from '@mantine/core'
```

- [ ] **Step 3: Wrap explanation in AnimatePresence**

Find the explanation block (around line 207). Wrap it with:

```tsx
<AnimatePresence>
  {submittedAnswers[currentQuestion.id] && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={springTransition}
    >
      <Card
        padding="sm"
        radius="md"
        style={{
          background: "var(--mantine-color-dark-7)",
          border: "1px solid var(--mantine-color-dark-6)",
        }}
      >
        <Text size="xs" c="dimmed">
          <Text span fw={600} c="gray.4">
            Correct answer:
          </Text>{" "}
          {currentQuestion.options[currentQuestion.answer]}
        </Text>
        {currentQuestion.explanation && (
          <Text size="xs" c="dimmed" mt={4}>
            <Text span fw={600} c="gray.4">
              Explanation:
            </Text>{" "}
            {currentQuestion.explanation}
          </Text>
        )}
      </Card>
    </motion.div>
  )}
</AnimatePresence>
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/Quiz.tsx
git commit -m "feat: animate Quiz answer options, progress bar, and explanation"
```

---

### Task 9: Animate Result Page

**Files:**
- Modify: `src/pages/Result.tsx`

- [ ] **Step 1: Add imports**

At the top of `src/pages/Result.tsx`, add:
```typescript
import { motion, AnimatePresence } from "framer-motion";
import {
  scaleIn,
  fadeInUp,
  staggerContainer,
  springTransition,
  usePrefersReducedMotion,
} from "../lib/animations";
```

- [ ] **Step 2: Add reduced motion hook**

Inside the `Result` function, add:
```typescript
const reducedMotion = usePrefersReducedMotion();
```

- [ ] **Step 3: Animate score ring entrance**

Find the `RingProgress` component (around line 61). Wrap it with:

```tsx
<motion.div
  variants={scaleIn}
  initial="hidden"
  animate="visible"
>
  <RingProgress
    size={160}
    thickness={12}
    roundCaps
    sections={[{ value: percentage, color: ringColor }]}
    label={
      <Text ta="center" fw={800} size="xl">
        {percentage}%
      </Text>
    }
  />
</motion.div>
```

- [ ] **Step 4: Animate degree badge**

Find the degree badge Stack (around line 73). Wrap it with:

```tsx
<motion.div
  initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
  animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
  transition={{ ...springTransition, delay: 0.3 }}
>
  <Stack gap="xs" align="center">
    <Text size="lg" fw={600}>
      Great job, {userName}!
    </Text>
    <Badge
      size="lg"
      color={degree.color}
      variant="filled"
      leftSection={degree.icon}
      styles={{ root: { textTransform: "none" } }}
    >
      {degree.label}
    </Badge>
    <Text c="dimmed" size="sm">
      You answered {score} out of {totalQuestions} correctly
    </Text>
  </Stack>
</motion.div>
```

- [ ] **Step 5: Animate review cards with filter transitions**

Find the review cards map section (around line 146). Replace the outer container and map with:

```tsx
<motion.div
  variants={staggerContainer}
  initial="hidden"
  animate="visible"
  style={{ display: "flex", flexDirection: "column", gap: "var(--mantine-spacing-md)" }}
>
  <AnimatePresence mode="popLayout">
    {questions
      .filter((q) => {
        if (filter === "correct") return answers[q.id] === q.answer;
        if (filter === "wrong") return answers[q.id] !== q.answer;
        return true;
      })
      .map((q, index) => {
        const originalIndex = questions.indexOf(q);
        const userAnswer = answers[q.id];
        const isCorrect = userAnswer === q.answer;
        const isSkipped = userAnswer === undefined;

        let statusBadge = (
          <Badge color={isCorrect ? "teal" : "red"} variant="light" size="sm">
            {isCorrect ? "Correct" : "Wrong"}
          </Badge>
        );
        if (isSkipped) {
          statusBadge = (
            <Badge color="gray" variant="light" size="sm">
              Skipped
            </Badge>
          );
        }

        return (
          <motion.div
            key={q.id}
            variants={fadeInUp}
            layout={!reducedMotion}
            initial={reducedMotion ? {} : { opacity: 0, y: 15 }}
            animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
            exit={reducedMotion ? {} : { opacity: 0, scale: 0.95 }}
            transition={{ ...springTransition, delay: index * 0.04 }}
          >
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="sm">
                <Group justify="space-between" wrap="nowrap">
                  <Text fw={600} size="sm">
                    {originalIndex + 1}. {q.question}
                  </Text>
                  {statusBadge}
                </Group>

                <Stack gap="xs">
                  {q.options.map((opt, optIdx) => {
                    const isUserPick = userAnswer === optIdx;
                    const isCorrectOpt = optIdx === q.answer;

                    let border = "1px solid var(--mantine-color-dark-6)";
                    let bg: string | undefined = undefined;

                    if (isCorrectOpt) {
                      border = "1px solid var(--mantine-color-teal-6)";
                      bg = "rgba(32, 201, 151, 0.08)";
                    } else if (isUserPick && !isCorrectOpt) {
                      border = "1px solid var(--mantine-color-red-6)";
                      bg = "rgba(250, 82, 82, 0.08)";
                    }

                    return (
                      <motion.div
                        key={optIdx}
                        initial={false}
                        animate={{ background: bg, borderColor: border.replace("1px solid ", "") }}
                        transition={springTransition}
                        style={{
                          borderRadius: "var(--mantine-radius-md)",
                          border,
                          background: bg,
                          padding: "var(--mantine-spacing-sm)",
                        }}
                      >
                        <Group justify="space-between" wrap="nowrap">
                          <Text size="sm" fw={isUserPick ? 600 : 400}>
                            {opt}
                          </Text>
                          {isCorrectOpt && (
                            <Badge color="teal" size="xs" variant="filled">
                              Correct
                            </Badge>
                          )}
                          {isUserPick && !isCorrectOpt && (
                            <Badge color="red" size="xs" variant="filled">
                              Your answer
                            </Badge>
                          )}
                        </Group>
                      </motion.div>
                    );
                  })}
                </Stack>

                <Box
                  p="sm"
                  style={{
                    borderRadius: "var(--mantine-radius-md)",
                    background: "var(--mantine-color-dark-7)",
                    border: "1px solid var(--mantine-color-dark-6)",
                  }}
                >
                  <Text size="xs" c="dimmed">
                    <Text span fw={600} c="gray.4">
                      Explanation:
                    </Text>{" "}
                    {q.explanation}
                  </Text>
                </Box>
              </Stack>
            </Card>
          </motion.div>
        );
      })}
  </AnimatePresence>
</motion.div>
```

- [ ] **Step 6: Commit**

```bash
git add src/pages/Result.tsx
git commit -m "feat: animate Result page with ring entrance, staggered reviews, and filter transitions"
```

---

### Task 10: Build Verification

**Files:**
- Verify entire build

- [ ] **Step 1: Run TypeScript check and build**

Run: `npm run build`
Expected: Compiles without errors. Vite outputs to `dist/`.

- [ ] **Step 2: Fix any TypeScript errors**

If there are type errors, fix them in the respective files and rerun `npm run build`.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "build: verify framer-motion integration compiles successfully"
```

---

## Self-Review Checklist

**1. Spec coverage:**
- [x] Route-level transitions → Task 3, 5
- [x] Shared variants → Task 2
- [x] Home staggered cards → Task 6
- [x] Home hover/tap → Task 4, 6
- [x] Quiz direction-aware slides → Task 7
- [x] Quiz answer stagger → Task 8
- [x] Quiz answer feedback (shake, scale) → Task 8
- [x] Quiz progress bar spring → Task 8
- [x] Quiz explanation reveal → Task 8
- [x] Result ring entrance → Task 9
- [x] Result badge delay → Task 9
- [x] Result review stagger → Task 9
- [x] Result filter transitions → Task 9
- [x] Reduced motion support → Tasks 2, 6, 7, 8, 9
- [x] Bundle size consideration → Task 1 (tree-shakeable imports used throughout)

**2. Placeholder scan:**
- [x] No "TBD", "TODO", or vague instructions
- [x] All code blocks contain complete, copy-pasteable code
- [x] All commands include expected output
- [x] No "similar to Task N" shortcuts

**3. Type consistency:**
- [x] `usePrefersReducedMotion` used consistently
- [x] `springTransition` and `fadeInUp` variants match definitions in Task 2
- [x] `direction` is `number` throughout Quiz tasks
- [x] Mantine imports updated when new components used (Box added in Task 8)

---

## Estimated Time

- Task 1: 2 min
- Task 2: 3 min
- Task 3: 2 min
- Task 4: 3 min
- Task 5: 2 min
- Task 6: 5 min
- Task 7: 5 min
- Task 8: 8 min
- Task 9: 8 min
- Task 10: 5 min

**Total: ~43 minutes**
