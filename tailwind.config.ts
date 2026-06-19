import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        foreground: '#111827',
        primary: {
          DEFAULT: '#38BDF8',
          dark: '#0EA5E9',
          light: '#7DD3FC',
        },
        secondary: '#22D3EE',
        accent: '#38BDF8',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        muted: '#6B7280',
        border: '#E5E7EB',
        card: '#FFFFFF',
        sidebarBg: '#0F172A',
        sidebarHover: '#1E293B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 8px -1px rgba(15, 23, 42, 0.03)',
        glass: '0 8px 32px 0 rgba(15, 23, 42, 0.08)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
