/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', '"SFMono-Regular"', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Deep charcoal surfaces — restrained, not pure black
        ink: {
          900: '#0a0c0f',
          800: '#0f1318',
          700: '#161b22',
          600: '#1e242d',
          500: '#2a313c',
        },
        // Per-room accents (one accent dominant per room)
        pda: '#46e6a0', // green-teal  — Room 1 (Stack)
        tm: '#5cc8ff', // sky         — Room 2 (Tape)
        oracle: '#c08cff', // violet      — Room 3 (Oracle)
        // Semantic
        good: '#46e6a0',
        bad: '#ff6b6b',
        warn: '#ffcf6b',
        muted: '#7b8794',
        faint: '#4a5560',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.04), 0 0 24px -8px var(--glow, rgba(70,230,160,0.25))',
        'glow-soft': '0 0 28px -10px var(--glow, rgba(70,230,160,0.18))',
      },
      keyframes: {
        'caret-blink': { '0%,49%': { opacity: '1' }, '50%,100%': { opacity: '0' } },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scan': { from: { transform: 'translateY(-100%)' }, to: { transform: 'translateY(100%)' } },
        'pulse-soft': { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.55' } },
      },
      animation: {
        'caret-blink': 'caret-blink 1.1s step-end infinite',
        'fade-up': 'fade-up 0.4s ease both',
        'pulse-soft': 'pulse-soft 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
