/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        vault: {
          bg: '#0B0B0D',
          surface: '#141416',
          surface2: '#1C1C1F',
          border: '#2A2A2E',
          text: '#EDEBE6',
          muted: '#8C8A85',
          gold: '#C9A15A',
          goldSoft: '#8A754A',
          teal: '#33E0C4',
          danger: '#E0554A',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '14px',
      },
      spacing: {
        18: '4.5rem',
      },
    },
  },
  plugins: [],
}
