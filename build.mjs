import * as esbuild from 'esbuild';

await esbuild.build({
	outdir: './dist',
	entryPoints: ['./src/code.ts'],
  bundle: true,
	treeShaking: true,
	target: 'es2019' // Figma support limited js features.
})
