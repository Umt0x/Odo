// wrangler.toml bundles PNG files as binary data (and vitest.config.ts mirrors that in tests).
declare module '*.png' {
  const data: ArrayBuffer;
  export default data;
}
