
#!/usr/bin/env node

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

const staticPath = path.resolve(process.cwd(), "dist/public/index.html");

console.log('🔍 Checking if client is built...');

if (!existsSync(staticPath)) {
  console.log('⚠️  Client not built, building now...');
  
  const buildProcess = spawn('npm', ['run', 'build'], {
    stdio: 'inherit',
    shell: true
  });

  buildProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Client built successfully, starting production server...');
      startServer();
    } else {
      console.error('❌ Build failed with code:', code);
      process.exit(1);
    }
  });
} else {
  console.log('✅ Client already built, starting production server...');
  startServer();
}

function startServer() {
  const serverProcess = spawn('node', ['server.js'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: 'production'
    }
  });

  serverProcess.on('close', (code) => {
    console.log(`Server exited with code ${code}`);
  });
}
