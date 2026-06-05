import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { ReactNode } from 'react'
import { usePrefersReducedMotion, fadeInUp, defaultTransition } from '../lib/animations'

interface PageTransitionProps {
  children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation()
  const reducedMotion = usePrefersReducedMotion()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={reducedMotion ? {} : 'hidden'}
        animate={reducedMotion ? {} : 'visible'}
        exit={reducedMotion ? {} : 'hidden'}
        variants={fadeInUp}
        transition={defaultTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
