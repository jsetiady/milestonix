/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        surface: {
          0: '#f8f9fa',
          1: '#ffffff',
          2: '#f3f4f5',
          3: '#edeeef',
          4: '#e7e8e9',
        },
        border: {
          DEFAULT: '#d1d5db',
          subtle: '#e1e3e4',
        },
        accent: {
          indigo: '#4648d4',
          amber: '#d97706',
          red: '#dc2626',
          green: '#16a34a',
          blue: '#2563eb',
          purple: '#7c3aed',
          orange: '#c2410c',
        },
        text: {
          primary: '#191c1d',
          secondary: '#464554',
          muted: '#767586',
        },
      },
    },
  },
  plugins: [],
}
