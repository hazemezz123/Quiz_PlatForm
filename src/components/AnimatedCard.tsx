import { motion } from "framer-motion";
import { Card } from "@mantine/core";
import { ReactNode, CSSProperties, MouseEvent } from "react";
import { springTransitionFast, usePrefersReducedMotion } from "../lib/animations";

interface AnimatedCardProps {
  children: ReactNode;
  style?: CSSProperties;
  onMouseEnter?: (e: MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (e: MouseEvent<HTMLDivElement>) => void;
  [key: string]: any;
}

export function AnimatedCard({ children, style, onMouseEnter, onMouseLeave, ...props }: AnimatedCardProps) {
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
        onMouseEnter={(e: MouseEvent<HTMLDivElement>) => {
          e.currentTarget.style.borderColor = "var(--mantine-color-teal-6)";
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e: MouseEvent<HTMLDivElement>) => {
          e.currentTarget.style.borderColor = "";
          onMouseLeave?.(e);
        }}
      >
        {children}
      </Card>
    </motion.div>
  );
}
