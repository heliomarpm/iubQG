const Utils = {
	getNestedField: (block: any, field: string): string | null | undefined => {
		const result = field.split(".").reduce((obj, key) => (obj ? obj[key] : undefined), block);
		return result;
	},
	normalizeTemplate: (template: string): string =>{
		return template
			.replace(/^\s+/gm, "")
			.replace(/\n{2,}/g, "\n")
			.trim();
	}
};

export default Utils;
