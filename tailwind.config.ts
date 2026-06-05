import type { Config } from 'tailwindcss';

// Brand tokens kept 1:1 with sparrow-website and sparrow-staff-portal so all three
// systems share one visual language (per Susanna's System Brief). The participant
// experience leans warmer (sage/cream/gold) and gamified, but the palette is shared.
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sparrow: {
          green: '#1E4D30',
          'green-dark': '#163A24',
          gold: '#F0A500',
          ink: '#1A1A1A',
          gray: '#767676',
          rule: '#D8D8D8',
          mist: '#F5F5F5',
          sage: '#E8F2EC',
          cream: '#FFF8E1',
        },
        area: {
          relational: '#E8743B',
          physical_financial: '#2563EB',
          spiritual: '#7C3AED',
          emotional: '#0E9F8E',
          general: '#767676',
        },
      },
      fontFamily: {
        serif: ['"Fraunces Variable"', 'Fraunces', 'Georgia', 'serif'],
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'Arial', 'sans-serif'],
      },
      maxWidth: { content: '72rem', phone: '30rem' },
      borderRadius: { '2xl': '1rem' },
      boxShadow: {
        card: '0 1px 3px rgba(26,26,26,0.06), 0 1px 2px rgba(26,26,26,0.04)',
      },
    },
  },
  plugins: [],
};

export default config;
