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
          0: '#0f1117',
          1: '#16191f',
          2: '#1c2028',
          3: '#242832',
          4: '#2c3140',
        },
        border: {
          DEFAULT: '#2a2f3d',
          subtle: '#1f2330',
        },
        accent: {
          indigo: '#6366f1',
          amber: '#f59e0b',
          red: '#ef4444',
          green: '#22c55e',
          blue: '#3b82f6',
          purple: '#a855f7',
          orange: '#f97316',
        },
        text: {
          primary: '#e2e8f0',
          secondary: '#94a3b8',
          muted: '#64748b',
        },
      },
    },
  },
  plugins: [],
}
