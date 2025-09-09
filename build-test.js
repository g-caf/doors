// Simple build test
const fs = require('fs');
const path = require('path');

// Check if all required files exist
const requiredFiles = [
  'src/App.tsx',
  'src/main.tsx',
  'src/index.css',
  'package.json',
  'vite.config.ts'
];

console.log('🔍 Checking project structure...');

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`✅ ${file} - exists`);
  } else {
    console.log(`❌ ${file} - missing`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log('\n✅ All required files are present!');
  console.log('\n📋 Project Summary:');
  console.log('- React 18 + TypeScript');
  console.log('- Tailwind CSS for styling');
  console.log('- React Router for routing');
  console.log('- Kiosk interface at / or /kiosk');
  console.log('- Admin dashboard at /admin');
  console.log('- Demo credentials: admin / admin123');
  
  console.log('\n🚀 To run the project:');
  console.log('1. npm run dev - start development server');
  console.log('2. npm run build - build for production');
  console.log('3. npm run preview - preview production build');
} else {
  console.log('\n❌ Some files are missing. Please check the project structure.');
}
