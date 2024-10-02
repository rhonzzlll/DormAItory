module.exports = {
  plugins: {
    tailwindcss: {
      // Custom configuration options for Tailwind
      purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'], // Specify paths for purging unused styles
    },
    autoprefixer: {
      // Custom configuration options for Autoprefixer
      overrideBrowserslist: ['> 1%', 'last 2 versions'],
    },
  },
}
