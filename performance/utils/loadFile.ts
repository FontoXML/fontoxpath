declare var window: any;

export default async function loadFile(filename: string): Promise<string> {
	if (typeof window !== 'undefined' && window.fetch) {
		const request = new window.Request(`${window.location}${filename}`);
		const response = await window.fetch(request);
		return response.text();
	} else {
		const fs = await import('fs');
		return fs.readFileSync(filename).toString();
	}
}
