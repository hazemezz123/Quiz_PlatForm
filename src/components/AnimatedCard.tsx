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
