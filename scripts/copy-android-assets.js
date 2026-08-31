import fs from 'fs';
import path from 'path';

const srcDir = path.resolve(process.cwd(), 'dist');
const destDir = path.resolve(process.cwd(), 'android/app/src/main/assets/dist');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else if (exists) {
    const parent = path.dirname(dest);
    if (!fs.existsSync(parent)) {
      fs.mkdirSync(parent, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

if (fs.existsSync(srcDir)) {
  console.log(`Copying web build assets from ${srcDir} to ${destDir}...`);
  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true, force: true });
  }
  fs.mkdirSync(destDir, { recursive: true });
  copyRecursiveSync(srcDir, destDir);
  console.log('Android assets synced successfully!');
} else {
  console.error('Error: dist folder does not exist. Run "npm run build" first.');
  process.exit(1);
}
