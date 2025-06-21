import * as esbuild from 'esbuild';

import fs from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { compileSass } from './compileSass.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const isWatchMode = process.argv.includes('--watch');

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

async function build() {
	const result = await esbuild.build(buildOptions);

	const code = result.outputFiles.find(file => file.path.endsWith('main.js'))?.text;
	const ui = result.outputFiles.find(file => file.path.endsWith('ui.js'))?.text;

	const cssCode = await compileSass(scssFilePath);

  const htmlCode = result.outputFiles.find(file => file.path.endsWith('.html'))?.text || '';

	const styleTemplate = `<style>${cssCode}</style>`;
	const htmlHeadEndIndex = htmlCode.indexOf('</head>');

	const headStart = htmlCode.slice(0, htmlHeadEndIndex);
	const headToEnd = htmlCode.slice(htmlHeadEndIndex, htmlCode.length - 1);
	const injectedHtml = headStart.concat(styleTemplate).concat(headToEnd);

	const scriptTemplateForUI = `<script>${ui}</script>`;
	const scriptEndIndex = injectedHtml.indexOf('</body>');
	const bodyStart = injectedHtml.slice(0, scriptEndIndex);
	const bodyToEnd = injectedHtml.slice(scriptEndIndex, injectedHtml.length - 1);
	const injectedHtmlForUI =
		bodyStart
			.concat(scriptTemplateForUI)
			.concat(bodyToEnd);

	fs.writeFile('./dist/ui.html', injectedHtmlForUI, err => {
		if (err) {
			console.error(err);
		}
	});
	fs.writeFile('./dist/code.js', code, err => {
		if (err) {
			console.error(err);
		}
	})
}

build();

// if (isWatchMode) {
//   const ctx = await esbuild.context(buildOptions);
//   await ctx.watch()
//   console.log("👀 Watching for changes...");
// } else {
//   await build();
//   console.log("✅ Build complete!");
// }
