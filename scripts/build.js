import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { compileSass } from './compileSass.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.resolve(__dirname, '../dist');

const isWatchMode = process.argv.includes('--watch');

const scssFilePath = path.resolve(__dirname, '../src/styles/style.scss');

const buildOptions = {
	entryPoints: [
		'./src/main.ts',
		'./src/ui.ts',
		"./src/index.html"
	],
  outdir: './dist',
	minify: true,
  bundle: true,
  treeShaking: true,

	assetNames: 'assets/[name]',
	loader: {
		".html": "file"
	},
  target: 'es2016',
	write: false,
	external: []
};

function injectCodeAssets(html, css, js) {
	return html
		.replace('</head>', `<style>${css}</style></head>`)
    .replace('</body>', `<script>${js}</script></body>`);
}

async function build() {
	try {
    const result = await esbuild.build(buildOptions);
    const code = result.outputFiles.find(f => f.path.endsWith('code.js'))?.text || '';
    const ui = result.outputFiles.find(f => f.path.endsWith('ui.js'))?.text || '';
    const html = result.outputFiles.find(f => f.path.endsWith('.html'))?.text || '';
    const css = await compileSass(scssFilePath);

    const finalHtml = injectCodeAssets(html, css, ui);

    await fs.mkdir(outDir, { recursive: true });
    await Promise.all([
      fs.writeFile(path.join(outDir, 'ui.html'), finalHtml),
      fs.writeFile(path.join(outDir, 'code.js'), code)
    ]);
    console.log('✅ Build complete!');
  } catch (err) {
    console.error('❌ Build failed:', err);
  }
}

if (isWatchMode) {
  esbuild.context(buildOptions).then(ctx => {
    ctx.watch();
    console.log('👀 Watching for changes...');
  });
} else {
  build();
}
