// build.mjs - TypeScript compilation script for production
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Building server for production...');

// Run TypeScript compilation
exec('tsc --project tsconfig.json', (error, stdout, stderr) => {
  if (error) {
    console.error(`TypeScript compilation error: ${error}`);
    console.error(stderr);
    process.exit(1);
  }
  
  console.log('TypeScript compilation complete!');
  console.log(stdout);
  
  // Create server index.js wrapper that works in production
  const indexPath = path.join(__dirname, 'dist', 'server', 'index.js');
  
  if (!fs.existsSync(path.dirname(indexPath))) {
    fs.mkdirSync(path.dirname(indexPath), { recursive: true });
  }
  
  console.log('Successfully built the server for production!');
});