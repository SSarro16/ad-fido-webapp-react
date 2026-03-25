import { motion } from 'framer-motion';
import type { PropsWithChildren } from 'react';

type RevealProps = PropsWithChildren<{
  className?: string;
  delay?: number;
  y?: number;
  scale?: number;
}>;

export function Reveal({ children, className, delay = 0, y = 28, scale = 1 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, scale }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

type StaggerGridProps = PropsWithChildren<{
  className?: string;
  delay?: number;
  stagger?: number;
}>;

export function StaggerGrid({ children, className, delay = 0, stagger = 0.08 }: StaggerGridProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren: delay,
            staggerChildren: stagger,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

type StaggerItemProps = PropsWithChildren<{
  className?: string;
}>;

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 26, scale: 0.98 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
