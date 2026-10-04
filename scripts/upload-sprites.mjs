// Uploads src/assets/<theme>/<digit>.(png|gif) to the R2 bucket bound as SPRITES in wrangler.toml.
//
//   npm run sprites:upload           -> local bucket used by `wrangler dev`
//   npm run sprites:upload:remote    -> the bucket on your Cloudflare account
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const assetsDir = join(root, 'src', 'assets');
const wrangler = join(root, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
const remote = process.argv.includes('--remote');

const config = readFileSync(join(root, 'wrangler.toml'), 'utf8');
const bucket = config.match(/binding\s*=\s*"SPRITES"\s*\n\s*bucket_name\s*=\s*"([^"]+)"/)?.[1];
if (!bucket) {
  console.error('No R2 bucket bound as SPRITES in wrangler.toml.');
  process.exit(1);
}

const sprites = readdirSync(assetsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .flatMap(({ name: theme }) =>
    readdirSync(join(assetsDir, theme))
      .filter((file) => /^\d\.(png|gif)$/.test(file))
      .map((file) => ({ theme, file }))
  );

console.log(`Uploading ${sprites.length} sprites to "${bucket}" (${remote ? 'remote' : 'local'})`);

for (const [i, { theme, file }] of sprites.entries()) {
  console.log(`  [${i + 1}/${sprites.length}] ${theme}/${file}`);
  // Wrangler 3 writes to the remote bucket unless --local is given.
  const args = ['r2', 'object', 'put', `${bucket}/${theme}/${file}`, '--file', join(assetsDir, theme, file)];
  if (!remote) args.push('--local');
  execFileSync(process.execPath, [wrangler, ...args], { stdio: ['ignore', 'ignore', 'inherit'] });
}

console.log('Done.');
