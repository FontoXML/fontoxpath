declare var window: Window;

export default async function loadFile(filename: string): Promise<string> {
	if (typeof window !== 'undefined' && window.fetch) {
		const request = new Request(`${window.location}assets/${filename}`);
		const response = await window.fetch(request);
		return response.text();
	} else {
		const fs = await import('fs');
		return fs.readFileSync(`./performance/assets/${filename}`).toString();
	}
}
