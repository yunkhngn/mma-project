/** @type {import('tailwindcss').Config} */
module.exports = {
  // Scan all component and screen files for class names
  content: [
    './src/app/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
    './src/features/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Brand colors matching app.json splash (#208AEF)
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#208AEF',
          600: '#1d7fd8',
          700: '#1a6bbf',
          800: '#1558a6',
          900: '#0f3d7a',
          950: '#0a2754',
        },
      },
    },
  },
  plugins: [],
};
