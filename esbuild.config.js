import * as esbuild from 'esbuild';

const isWatchMode = process.argv.includes('--watch');

const buildOptions = {
  outdir: './dist',
  entryPoints: ['./src/code.ts'],
  bundle: true,
  treeShaking: true,
  target: 'es2019',
};

if (isWatchMode) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log("👀 Watching for changes...");
} else {
  await esbuild.build(buildOptions);
  console.log("✅ Build complete!");
}
