import { readFile, writeFile, access, readdir } from 'fs/promises';
import { resolve, join, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
const distPath = resolve(__dirname, 'dist');

async function getAllHtmlFiles() {
  try {
    const files = await readdir(distPath);
    return files.filter(file => extname(file) === '.html');
  } catch (error) {
    console.log('Error reading dist directory:', error.message);
    return [];
  }
}

async function fixPaths() {
  const htmlFiles = await getAllHtmlFiles();
  
  if (htmlFiles.length === 0) {
    console.log('No HTML files found in dist directory');
    return;
  }

  for (const file of htmlFiles) {
    const filePath = join(distPath, file);
    
    try {
      await access(filePath);
      let content = await readFile(filePath, 'utf8');
      content = content.replace(/url\(['"]?\/img\/([^'")]+)['"]?\)/g, 'url(../img/$1)');
      await writeFile(filePath, content, 'utf8');
      console.log(`✓ Fixed paths in ${file}`);
    } catch (error) {
      console.log(`✗ Error processing ${file}:`, error.message);
    }
  }
}

fixPaths().catch(console.error);