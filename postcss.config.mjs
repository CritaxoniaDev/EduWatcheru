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
          // Completely disable class name mangling
          reduceIdents: false,
          zindex: false,
          normalizeWhitespace: true,
          // Don't merge identical selectors as it can break specificity
          mergeIdents: false,
          // Don't merge rules as it can break media queries
          mergeRules: false,
          // Don't rebase URLs
          rebaseTo: false
        }],
      },
      // Add a custom plugin to handle class obfuscation safely
      "postcss-rename": {
        // Only target specific patterns that are safe to rename
        includes: [
          // Target only utility classes that don't affect layout
          /^text-(?!white|black|gray|blue|red|green|yellow|purple|pink)/,
          /^bg-(?!white|black|gray|blue|red|green|yellow|purple|pink)/,
          /^hover:/,
          /^focus:/
        ],
        // Exclude critical classes used in your components
        excludes: [
          // Navigation and layout classes
          /^container$/,
          /^flex$/,
          /^grid$/,
          /^justify-/,
          /^items-/,
          /^gap-/,
          /^p-/,
          /^m-/,
          /^w-/,
          /^h-/,
          /^min-h-/,
          /^max-w-/,
          /^rounded/,
          /^border/,
          /^shadow/,
          /^transition/,
          /^transform/,
          /^scale/,
          /^rotate/,
          /^translate/,
          /^skew/,
          /^opacity/,
          /^z-/,
          /^overflow/,
          /^sr-only$/,
          // Animation classes
          /^animate-/,
          // Position classes
          /^fixed$/,
          /^absolute$/,
          /^relative$/,
          /^sticky$/,
          /^inset-/,
          /^top-/,
          /^right-/,
          /^bottom-/,
          /^left-/,
          // Display classes
          /^block$/,
          /^inline$/,
          /^inline-block$/,
          /^hidden$/,
          // Critical component-specific classes
          /^backdrop-blur/,
          /^bg-gradient-to-/
        ],
        // Use a simple transformation for class names
        transformer: function(className) {
          // Only transform if it's not excluded
          if (this.excludes.some(pattern => pattern.test(className))) {
            return className;
          }
          
          // Simple hash function for class names
          let hash = 0;
          for (let i = 0; i < className.length; i++) {
            hash = ((hash << 5) - hash) + className.charCodeAt(i);
            hash = hash & hash; // Convert to 32bit integer
          }
          
          // Use a prefix to avoid conflicts
          return 'tw-' + Math.abs(hash).toString(36).substring(0, 4);
        }
      }
    } : {})
  },
};

export default config;
