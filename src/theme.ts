import { createTheme } from '@mantine/core'

export const appTheme = createTheme({
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  fontFamilyMonospace: 'JetBrains Mono, monospace',
  primaryColor: 'teal',
  primaryShade: { light: 6, dark: 5 },
  colors: {
    teal: [
      '#e6f7ed',
      '#c3eed6',
      '#a0e5bf',
      '#7ddca8',
      '#5ad391',
      '#2fbf6a',
      '#279a55',
      '#1f7440',
      '#174e2b',
      '#0f2716',
    ],
  },
  defaultRadius: 'md',
  autoContrast: true,
  cursorType: 'pointer',
  focusRing: 'auto',
  headings: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    fontWeight: '700',
    textWrap: 'balance',
  },
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.3)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.4)',
    md: '0 4px 6px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.4)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.5)',
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
})
