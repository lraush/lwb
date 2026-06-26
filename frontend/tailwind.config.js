/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          0: '#07070d',
          1: '#0f0f1a',
          2: '#141428',
          3: '#1a1a35',
          4: '#21213f',
        },
        purple: {
          DEFAULT: '#7c6af7',
          2: '#a99ff8',
          3: '#d4cffc',
          dim: 'rgba(124,106,247,0.15)',
          glow: 'rgba(124,106,247,0.35)',
        },
        glass: {
          DEFAULT: 'rgba(255,255,255,0.05)',
          border: 'rgba(255,255,255,0.08)',
          hover: 'rgba(255,255,255,0.09)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
        sm: '8px',
        md: '16px',
        xl: '32px',
      },
      boxShadow: {
        glass: '0 4px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        purple: '0 0 24px rgba(124,106,247,0.4)',
        neon: '0 0 20px rgba(124,106,247,0.6), 0 0 40px rgba(124,106,247,0.2)',
        card: '0 8px 40px rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-app': 'linear-gradient(135deg, #07070d 0%, #0f0f1a 50%, #0a0818 100%)',
        'gradient-purple': 'linear-gradient(135deg, #7c6af7, #a99ff8)',
        'gradient-cyan': 'linear-gradient(135deg, #0891b2, #22d3ee)',
        'gradient-green': 'linear-gradient(135deg, #059669, #10b981)',
        'gradient-pink': 'linear-gradient(135deg, #be185d, #ec4899)',
        'neon-btn': 'linear-gradient(135deg, #7c6af7, #ec4899)',
      },
      animation: {
        'fade-up': 'fadeUp 0.35s ease both',
        'fade-in': 'fadeIn 0.25s ease both',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'slide-in': 'slideIn 0.3s ease both',
        'typing': 'typing 1.2s infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        glowPulse: {
          '0%,100%': { boxShadow: '0 0 8px rgba(124,106,247,0.4)' },
          '50%': { boxShadow: '0 0 24px rgba(124,106,247,0.8), 0 0 48px rgba(124,106,247,0.3)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-8px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
