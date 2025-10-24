/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff8f1',
          100: '#ffead5',
          200: '#fdd0aa',
          300: '#fab574',
          400: '#f7903c',
          500: '#f57c00',
          600: '#e65100',
          700: '#bf360c',
          800: '#8d2f0a',
          900: '#4e1707',
        },
        secondary: {
          50: '#f7f4f1',
          100: '#ede6dd',
          200: '#dcc9b8',
          300: '#c4a388',
          400: '#b08968',
          500: '#8b5a3c',
          600: '#7a4d35',
          700: '#66412d',
          800: '#523327',
          900: '#3d2720',
        },
        accent: {
          50: '#fcf3f3',
          100: '#f8e4e4',
          200: '#f2cdcd',
          300: '#e8a7a7',
          400: '#db7a7a',
          500: '#c85454',
          600: '#b23b3b',
          700: '#952f2f',
          800: '#7d2b2b',
          900: '#682929',
        },
      },
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-subtle': 'bounceSubtle 2s infinite',
        'pulse-soft': 'pulseSoft 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceSubtle: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-5px)' },
          '60%': { transform: 'translateY(-3px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      boxShadow: {
        'elegant': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
