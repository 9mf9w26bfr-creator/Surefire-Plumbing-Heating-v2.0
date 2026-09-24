import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        foreground: '#0F2B4A',
        background: '#FFFFFF',
      },
    },
  },
  plugins: [],
} satisfies Config;