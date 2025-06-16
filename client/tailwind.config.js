/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coral: {
          primary: '#FF385C',
        },
        ink: {
          text: '#222222',
          medium: '#222222B3', // 70% opacity
          light: '#22222266',  // 40% opacity
        },
        cloud: {
          bg: '#F7F7F7',
        }
      },
      maxWidth: {
        'content': '1280px',
      },
      spacing: {
        'rhythm': '24px',
      },
      screens: {
        'mobile': {'max': '768px'},
        'tablet': {'max': '1024px'},
        'desktop': '1024px',
      }
    },
  },
  plugins: [],
} 