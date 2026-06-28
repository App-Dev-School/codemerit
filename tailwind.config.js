/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/shared/components/interview-panel/**/*.{html,ts}',
    './src/app/pages/interview-panel-container/**/*.{html,ts}',
    './src/app/pages/welcome/**/*.{html,ts}',
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
}
