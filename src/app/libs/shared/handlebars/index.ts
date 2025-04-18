// import { normalizeTemplate } from "./normalizer";
// import { validateTemplateStacks } from "./validator";
import { extractPathsFromTemplate } from "./parser";

// import { generateMockData } from "./mockGenerator";

export function processHandlebarsTemplate(template: string): Record<string, any> {
	// const normalized = normalizeTemplate(template);
	// validateTemplateStacks(normalized);

	const paths = extractPathsFromTemplate(normalized);
	// const mock = generateMockData(paths);

	return mock;
}
