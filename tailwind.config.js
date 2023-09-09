/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: ({ theme }) => ({
        // primary: theme.colors.fuchsia,
        primary: theme.colors.pink,
        error: theme.colors.red,
        bd: theme.colors.neutral,
      }),
      height: {
        screen: '100dvh',
      },
      gridAutoRows: {
        fixed: '3rem',
      },
    },
  },
  plugins: [],
};
