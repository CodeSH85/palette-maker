import * as sass from 'sass';

export async function compileSass(filePath) {
	const { css } = await sass.compileAsync(filePath, {
		style: 'compressed'
	});
	return css;
}
