/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './_layouts/**/*.html',
    './_includes/**/*.html',
    './*.html',
    './_posts/**/*.md',
    './assets/js/**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2563EB',
          dark: '#1D4ED8'
        }
      },
      fontFamily: {
        sans: ['"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif']
      },
      maxWidth: {
        reader: '48rem'
      },
      boxShadow: {
        soft: '0 1px 3px rgba(0, 37, 55, .06)',
        card: '0 8px 24px rgba(52, 61, 70, .12)'
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'fade-up': 'fade-up .5s ease both'
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography')
  ]
};
