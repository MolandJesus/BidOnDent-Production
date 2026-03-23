import { motion } from "motion/react";
import type { ReactNode } from "react";

export const screenTransition = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.2 },
};

export function AnimatedScreen({
  screenKey,
  children,
}: {
  screenKey: string;
  children: ReactNode;
}) {
  return (
    <motion.div key={screenKey} {...screenTransition}>
      {children}
    </motion.div>
  );
}
