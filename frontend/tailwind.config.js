/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        kernel: {
          navy: '#0B0C10',
          dark: '#1F2833',
          gray: '#C5C6C7',
          cyan: '#66FCF1',
          teal: '#45A29E',
          violet: '#8A2BE2',
          orange: '#FF8C00'
        },
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        border: 'var(--border)',
      },
      fontFamily: {
        cinematic: ['"Inter"', 'sans-serif'],
        pixel: ['"Press Start 2P"', 'monospace'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'glitch': 'glitch 1s linear infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        glitch: {
          '2%, 64%': { transform: 'translate(2px, 0) skew(0deg)' },
          '4%, 60%': { transform: 'translate(-2px, 0) skew(0deg)' },
          '62%': { transform: 'translate(0, 0) skew(5deg)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        }
      }
    },
  },
  plugins: [],
}

