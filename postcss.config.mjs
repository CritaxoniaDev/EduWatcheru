const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    "autoprefixer": {},
    // Only apply CSS minification in production
    ...(process.env.NODE_ENV === 'production' ? {
      "cssnano": {
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
        }],
      }
    } : {})
  },
};

export default config;
