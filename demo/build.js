import fs from 'fs';
import path from 'path';
import { DOMParser } from 'xmldom';
import { build } from 'vite';

const copySVG = (app) => {
	const srcXML = app + ".xml";

	fs.readFile(srcXML, 'utf8', (err, data) => {
		if (err) {
			console.error('Error reading file:', err);
			return;
		}
		// Parse the XML into a DOM
		const doc = new DOMParser().parseFromString(data, 'text/xml');

		const scriptElement = doc.documentElement.getElementsByTagName('script')[0];
		// yuck
		const script = scriptElement.getAttribute("xlink:href");
		const input = {};
		input[app] = script;

		const viteConfig = {
			build: {
				outDir: 'dist',
				rollupOptions: {
					input: input,
					output:
					{
						format: 'iife'
					}
				}
			}
		};
		// Run the build
		build(viteConfig)
		.then((rollup) => {
			const bundle = rollup.output[0].fileName
			//console.log('bundle', bundle);
			scriptElement.removeAttribute("type");
			// yuck
			scriptElement.setAttribute("xlink:href", bundle);
			const outputXML = doc.toString();
			const dstXML = viteConfig.build.outDir + '/' + srcXML;
			//console.log('output XML', outputXML);
			// Write the file asynchronously
			fs.writeFile(dstXML, outputXML, 'utf8', (err) => {
				if (err) {
					console.error('Error writing file:', err);
				}
			});		
		})
		.catch((error) => {
			console.error('Build failed:', error);
		});
	});
}

for (const app of [ 'chainreaction', 'boxup', 'tilemathics']) {
	copySVG(app);
}
