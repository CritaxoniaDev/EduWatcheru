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
          // Disable class name mangling to prevent breaking layouts
          reduceIdents: false,
          zindex: false,
          normalizeWhitespace: true,
          // Preserve important Tailwind classes
          minifySelectors: {
            customPseudos: true,
            removeQuotedAttributes: true,
            // Don't transform class selectors
            transformsEnabled: {
              rotateX: true,
              rotateY: true,
              rotateZ: true,
              scale: true,
              skewX: true,
              skewY: true,
              translate: true,
              translateX: true,
              translateY: true,
            }
          }
        }],
      }
    } : {})
  },
};

export default config;
