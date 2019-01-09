import * as fs from 'fs';
import * as path from 'path';

if (!fs.promises) {
	(fs as any).promises = {
		readFile: fs.readFileSync
	};
}

function createAssetPath (assetPath) {
	return path.join('test', 'assets', assetPath);
}

/**
 * @class
 * Wrapper for fs for reading test assets
 */
export default new class testFs {
	lstatSync (assetPath) {
		return fs.lstatSync(createAssetPath(assetPath));
	}

	existsSync (assetPath) {
		return fs.existsSync(createAssetPath(assetPath));
	}

	readdirSync (dirPath) {
		return fs.readdirSync(createAssetPath(dirPath));
	}

	async readFile (filePath) {
		const overridePath = path.join('overrides', filePath);
		if (this.existsSync(overridePath)) {
			filePath = overridePath;
		}
		return await fs.promises.readFile(createAssetPath(filePath), 'utf-8');
	}

	readFileSync (filePath) {
		const overridePath = path.join('overrides', filePath);
		if (this.existsSync(overridePath)) {
			filePath = overridePath;
		}
		return fs.readFileSync(createAssetPath(filePath), 'utf-8');
	}

	writeFileSync (filePath, content) {
		return fs.writeFileSync(createAssetPath(filePath), content);
	}
}();
