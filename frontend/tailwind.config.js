export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'neon-blue': '#ff8c00',
        'neon-emerald': '#ffaa00',
        'neon-green': '#ff8c00',
        'neon-purple': '#a855f7',
        'neon-pink': '#ec4899',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backdropFilter: {
        'blur-xl': 'blur(24px)',
      },
    },
  },
  plugins: [],
}
