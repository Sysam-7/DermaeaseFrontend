export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#FFFFFF',
        secondary: '#FFD400',
        black: '#000000'
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};


