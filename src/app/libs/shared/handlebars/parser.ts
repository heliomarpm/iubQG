import Handlebars from "handlebars";

export function extractPathsFromTemplate(template: string): string[] {
	const ast = Handlebars.parse(template);
	const paths = new Set<string>();

	function walk(node: any, currentPath: string[] = []) {
		if (!node) return;

		switch (node.type) {
			case "Program":
				node.body.forEach((n: any) => walk(n, currentPath));
				break;
			case "MustacheStatement":
			case "BlockStatement":
				processPath(node.path, currentPath);
				if (node.program) walk(node.program, currentPath.concat(node.path.parts || []));
				if (node.inverse) walk(node.inverse, currentPath.concat(node.path.parts || []));
				break;
			case "PartialStatement":
				node.params.forEach((param: any) => walk(param, currentPath));
				break;
			case "SubExpression":
				processPath(node.path, currentPath);
				node.params.forEach((param: any) => walk(param, currentPath));
				break;
		}
	}

	function processPath(pathNode: any, parentPath: string[]) {
		if (!pathNode.parts) return;
		const fullPath = [...parentPath, ...pathNode.parts].filter(Boolean).join(".");
		if (fullPath && !fullPath.startsWith("@")) {
			paths.add(fullPath);
		}
	}

	walk(ast);
	return Array.from(paths);
}
