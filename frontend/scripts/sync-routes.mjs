import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toAbsolute = (p) => path.resolve(__dirname, '..', p);

const BUCKET_NAME = process.env.BUCKET_NAME || execSync(
  'aws cloudformation describe-stacks --stack-name naive-sculpture-gallery --region eu-central-1 --query "Stacks[0].Outputs[?OutputKey==\'GalleryBucketName\'].OutputValue" --output text',
  { encoding: 'utf-8' }
).trim();

const DIST_DIR = toAbsolute('dist');

console.log(`Uploading clean URL routes to S3 bucket: ${BUCKET_NAME}...`);

// Find all index.html files inside subdirectories of dist
function getDirectories(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getDirectories(fullPath));
    } else if (entry.name === 'index.html' && dir !== DIST_DIR) {
      files.push(fullPath);
    }
  }
  return files;
}

const htmlFiles = getDirectories(DIST_DIR);

for (const file of htmlFiles) {
  // e.g. /path/to/dist/sculpture/anhelyk-marmur/index.html -> sculpture/anhelyk-marmur
  const relDir = path.relative(DIST_DIR, path.dirname(file));
  const s3Key = relDir.replace(/\\/g, '/');

  console.log(`  -> s3://${BUCKET_NAME}/${s3Key}`);
  execSync(
    `aws s3 cp "${file}" "s3://${BUCKET_NAME}/${s3Key}" --content-type "text/html" --cache-control "no-cache, no-store, must-revalidate"`,
    { stdio: 'ignore' }
  );
}

console.log('Clean URL routes successfully synced to S3!');
