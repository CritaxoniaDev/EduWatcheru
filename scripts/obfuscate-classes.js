const fs = require('fs');
const path = require('path');
const glob = require('glob');

// First, let's check if the .next directory exists and what it contains
function checkBuildOutput() {
  console.log('Checking build output...');
  
  const nextDir = path.join(process.cwd(), '.next');
  if (!fs.existsSync(nextDir)) {
    console.error('Error: .next directory not found! Make sure you run "next build" first.');
    return false;
  }
  
  console.log('.next directory exists.');
  
  // List top-level directories in .next
  const dirs = fs.readdirSync(nextDir)
    .filter(file => fs.statSync(path.join(nextDir, file)).isDirectory());
  
  console.log('Found directories in .next:', dirs);
  
  // Check for specific expected directories
  const expectedDirs = ['static', 'server', 'cache'];
  const missingDirs = expectedDirs.filter(dir => !dirs.includes(dir));
  
  if (missingDirs.length > 0) {
    console.warn(`Warning: Some expected directories are missing: ${missingDirs.join(', ')}`);
  }
  
  // Check if there are any HTML, CSS, or JS files in the entire .next directory tree
  const allFiles = glob.sync(path.join(nextDir, '**/*'));
  const htmlFiles = allFiles.filter(file => file.endsWith('.html'));
  const cssFiles = allFiles.filter(file => file.endsWith('.css'));
  const jsFiles = allFiles.filter(file => file.endsWith('.js'));
  
  console.log(`Found ${htmlFiles.length} HTML files in total`);
  console.log(`Found ${cssFiles.length} CSS files in total`);
  console.log(`Found ${jsFiles.length} JS files in total`);
  
  // List some example paths to understand the structure
  if (htmlFiles.length > 0) {
    console.log('Example HTML file paths:');
    htmlFiles.slice(0, 3).forEach(file => console.log(` - ${file}`));
  }
  
  if (cssFiles.length > 0) {
    console.log('Example CSS file paths:');
    cssFiles.slice(0, 3).forEach(file => console.log(` - ${file}`));
  }
  
  if (jsFiles.length > 0) {
    console.log('Example JS file paths:');
    jsFiles.slice(0, 3).forEach(file => console.log(` - ${file}`));
  }
  
  return true;
}

// Create a mapping of class names to obfuscated versions
const classMap = {};
let counter = 0;

// Generate short class names
function generateClassName() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  counter++;
  let num = counter;
  
  do {
    result = chars[num % chars.length] + result;
    num = Math.floor(num / chars.length);
  } while (num > 0);
  
  return 'tw-' + result;
}

// Classes to exclude from obfuscation - expanded to preserve functionality
const excludePattern = /^(html|body|dark|fixed|sticky|absolute|relative|static|block|inline|flex|grid|hidden|visible|invisible|opacity|z-|overflow|transition|transform|translate|scale|rotate|skew|origin|delay|duration|ease|animate|cursor|pointer|select|resize|scroll|snap|touch|user|break|truncate|text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)|font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)|tracking|leading|list|placeholder|bg-(transparent|current|black|white|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)|from-|via-|to-|border|divide|rounded|shadow|outline|ring|blur|brightness|contrast|drop|grayscale|hue|invert|saturate|sepia|backdrop|sr-only).*$/;

// Process HTML files
function processHtmlFiles() {
  console.log('Processing HTML files...');
  
  // Use the actual paths we found in checkBuildOutput
  const htmlFiles = glob.sync(path.join(process.cwd(), '.next/**/*.html'));
  
  console.log(`Found ${htmlFiles.length} HTML files to process`);
  
  let totalClassesFound = 0;
  
  htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let classesFoundInFile = 0;
    
    // Find all class attributes
    const classRegexes = [
      /class="([^"]*)"/g,
      /class='([^']*)'/g,
      /className="([^"]*)"/g,
      /className='([^']*)'/g
    ];
    
    classRegexes.forEach(regex => {
      content = content.replace(regex, (match, classNames) => {
        const classes = classNames.split(/\s+/);
        const obfuscatedClasses = classes.map(className => {
          if (!className) return '';
          
          // Skip excluded classes - these are important for functionality
          if (excludePattern.test(className)) {
            return className;
          }
          
          // Skip classes that contain dynamic values (like w-[50px])
          if (className.includes('[') && className.includes(']')) {
            return className;
          }
          
          if (!classMap[className]) {
            classMap[className] = generateClassName();
            classesFoundInFile++;
            totalClassesFound++;
          }
          
          return classMap[className];
        });
        
        return match.replace(classNames, obfuscatedClasses.join(' '));
      });
    });
    
    console.log(`Processed ${file}: found ${classesFoundInFile} classes`);
    fs.writeFileSync(file, content);
  });
  
  console.log(`Total classes found in HTML: ${totalClassesFound}`);
  return totalClassesFound;
}

// Process CSS files
function processCssFiles() {
  console.log('Processing CSS files...');
  
  const cssFiles = glob.sync(path.join(process.cwd(), '.next/**/*.css'));
  
  console.log(`Found ${cssFiles.length} CSS files to process`);
  
  let totalReplacements = 0;
  
  cssFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let replacementsInFile = 0;
    
    Object.entries(classMap).forEach(([original, obfuscated]) => {
      // Skip processing if the original class is empty or very short (likely a utility)
      if (!original || original.length < 2) return;
      
      const escapedOriginal = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // More precise pattern to avoid partial matches
      const pattern = new RegExp(`\\.${escapedOriginal}(\\s|:|,|\\{|\\[|\\]|$)`, 'g');
      
      const newContent = content.replace(pattern, (match, ending) => {
        replacementsInFile++;
        totalReplacements++;
        return `.${obfuscated}${ending}`;
      });
      
      if (newContent !== content) {
        content = newContent;
      }
    });
    
    console.log(`Processed ${file}: made ${replacementsInFile} replacements`);
    fs.writeFileSync(file, content);
  });
  
  console.log(`Total replacements in CSS: ${totalReplacements}`);
  return totalReplacements;
}

// Process JS files
function processJsFiles() {
  console.log('Processing JS files...');
  
  const jsFiles = glob.sync(path.join(process.cwd(), '.next/**/*.js'));
  
  console.log(`Found ${jsFiles.length} JS files to process`);
  
  let totalReplacements = 0;
  
  // Skip files that are critical for functionality
  const skipFiles = [
    'Header', 'search', 'tv-shows', 'movies', 'watch'
  ];
  
  jsFiles.forEach(file => {
    // Skip processing files that match our critical components
    if (skipFiles.some(skipFile => file.includes(skipFile))) {
      console.log(`Skipping critical file: ${file}`);
      return;
    }
    
    let content = fs.readFileSync(file, 'utf8');
    let replacementsInFile = 0;
    
    Object.entries(classMap).forEach(([original, obfuscated]) => {
      // Skip processing if the original class is empty or very short (likely a utility)
      if (!original || original.length < 3) return;
      
      const escapedOriginal = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // More precise patterns to avoid breaking functionality
      const patterns = [
        new RegExp(`"${escapedOriginal}"`, 'g'),
        new RegExp(`'${escapedOriginal}'`, 'g'),
        new RegExp(`className:\\s*["']${escapedOriginal}["']`, 'g'),
        new RegExp(`className:\\s*\`${escapedOriginal}\``, 'g')
      ];
      
      patterns.forEach(pattern => {
        const newContent = content.replace(pattern, (match) => {
          replacementsInFile++;
          totalReplacements++;
          return match.replace(original, obfuscated);
        });
        
        if (newContent !== content) {
          content = newContent;
        }
      });
    });
    
    console.log(`Processed ${file}: made ${replacementsInFile} replacements`);
    fs.writeFileSync(file, content);
  });
  
  console.log(`Total replacements in JS: ${totalReplacements}`);
  return totalReplacements;
}

// Main function
function obfuscateClasses() {
  console.log('Starting class name obfuscation...');
  
  // First check the build output
  if (!checkBuildOutput()) {
    return;
  }
  
  // Process files
  const htmlClasses = processHtmlFiles();
  const cssReplacements = processCssFiles();
  const jsReplacements = processJsFiles();
  
  // Save class mapping for reference
  fs.writeFileSync(
    path.join(process.cwd(), '.next/class-map.json'), 
    JSON.stringify(classMap, null, 2)
  );
  
  console.log(`Obfuscation complete!`);
  console.log(`- ${Object.keys(classMap).length} unique classes processed`);
  console.log(`- ${htmlClasses} classes found in HTML`);
  console.log(`- ${cssReplacements} replacements in CSS`);
  console.log(`- ${jsReplacements} replacements in JS`);
}

// Run the obfuscation
obfuscateClasses();
