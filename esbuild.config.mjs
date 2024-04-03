import esbuild from 'esbuild';
import process from 'process';

const prod = process.argv[2] === 'production';

const context = await esbuild.context({
	entryPoints: ['main.ts'],
	bundle: true,
	platform: 'node',
	target: 'es2022',
	outfile: './build/main.js',
});

if (prod) {
	await context.rebuild();
	process.exit(0);
} else {
	await context.watch();
}
