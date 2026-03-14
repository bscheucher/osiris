import tailwindForms from '@tailwindcss/forms'
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'ibis-blue': '#0058A2',
        'ibis-blue-light': '#066cc2',
        'ibis-blue-dark': '#044276',
        'ibis-cyan': '#1a92d5',
        'ibis-indigo-light': '#5851e1',
        'ibis-indigo': '#544fc9',
        'ibis-purple': '#5d00a2',
        'ibis-emerald': '#00a27a',
        'ibis-yellow': '#fcc700',
        'ibis-yellow-light': '#ffd432',
        'ibis-gray-dark': '#b1b2b4',
        'ibis-gray-light': '#d9dadc',
        'ibis-gray-lighter': '#F5F8FD',
      },
      maxWidth: {
        '8xl': '96rem',
        '9xl': '112rem',
      },
      backgroundImage: {
        'gradient-grid':
          'linear-gradient(90deg, var(--tw-gradient-grid)), linear-gradient(0deg, var(--tw-gradient-grid))',
      },
      fontFamily: {
        inter: ['var(--font-inter)', 'sans-serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
        mulish: ['var(--font-mulish)', 'sans-serif'],
      },
      keyframes: {
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateY(1rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'slide-in': 'slide-in .25s ease-in-out forwards',
      },
      screens: {
        '3xl': '1800px', // 1800px and up
        '4xl': '1920px', // 1920px and up
      },
    },
  },
  plugins: [tailwindForms],
}
export default config
