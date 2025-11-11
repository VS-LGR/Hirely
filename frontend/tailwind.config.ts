import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Pastel Marrom e Bege
        bege: {
          light: '#F5F1E8',
          medium: '#E8DDD4',
        },
        brown: {
          light: '#D4C4B0',
          pastel: '#C9B8A5',
          soft: '#B8A082',
          dark: '#8B7355',
          accent: '#A68B6F',
        },
        // Cores de feedback
        success: '#C4B5A0',
        warning: '#D4B8A0',
        error: '#C4A5A0',
        info: '#A5B8C4',
        // Backgrounds
        background: '#F5F1E8',
        foreground: '#8B7355',
        // Cards
        card: {
          DEFAULT: '#F5F1E8',
          foreground: '#8B7355',
        },
        // Inputs
        input: '#E8DDD4',
        // Primary (botões principais)
        primary: {
          DEFAULT: '#A68B6F',
          foreground: '#F5F1E8',
        },
        // Secondary
        secondary: {
          DEFAULT: '#C9B8A5',
          foreground: '#8B7355',
        },
        // Muted
        muted: {
          DEFAULT: '#E8DDD4',
          foreground: '#B8A082',
        },
        // Border
        border: '#D4C4B0',
        // Ring (focus)
        ring: '#A68B6F',
      },
      borderRadius: {
        lg: '12px',
        md: '8px',
        sm: '6px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 8px rgba(139, 115, 85, 0.08)',
        medium: '0 4px 16px rgba(139, 115, 85, 0.12)',
      },
    },
  },
  plugins: [],
}

export default config


