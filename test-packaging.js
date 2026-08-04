import { execSync } from 'child_process';
import fs from 'fs';

try {
  console.log('Running build validation...');
  execSync('npm run build:single', { stdio: 'inherit' });
  
  if (!fs.existsSync('dist-standalone/index.html')) {
    throw new Error('Build failed: dist-standalone/index.html not generated');
  }

  console.log('Packaging test passed successfully.');
} catch (e) {
  console.error('Packaging test failed:', e.message);
  process.exit(1);
}
