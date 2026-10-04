import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    {
      name: 'png-as-data',
      enforce: 'pre',
      // Mirrors the Data rule in wrangler.toml: importing a PNG gives its bytes as an ArrayBuffer.
      load(id) {
        if (!id.endsWith('.png')) return null;
        const base64 = readFileSync(id).toString('base64');
        return `export default Uint8Array.from(atob(${JSON.stringify(base64)}), (c) => c.charCodeAt(0)).buffer;`;
      },
    },
  ],
});
