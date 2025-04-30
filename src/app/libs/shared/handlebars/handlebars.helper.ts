/* eslint-disable @typescript-eslint/no-explicit-any */
import Handlebars, { normalizeTemplate, validateTemplateBlocks } from "./handlebars";

type MockData = Record<string, any>;

class HandlebarsHelper {
	private reservedWords = new Set(["null", "else", "this", "@root", "@key", "@index", "@first", "@last", "@level", ...Object.keys(Handlebars.helpers)]);
	private arrayPaths = new Set<string>();

	public processTemplate(template: string): {
		success: boolean;
		result: string;
		mockData: MockData;
	} {
		try {
			validateTemplateBlocks(template);

			let normalized = normalizeTemplate(template);

			//replace ifCond para if
			normalized = normalized
				.replace(/{{\s*#ifCond/g, "{{#if")
				.replace(/{{\s*\/ifCond/g, "{{/if")
				.replace(/{{\s*this\.([\w.]+)\s*}}/g, "{{$1}}");

			this.arrayPaths.clear();

			const ast = Handlebars.parse(normalized);
			const paths = this.parseAST(ast);
			const mockData = this.buildMockDataFromPaths(paths);
			const compiled = Handlebars.compile(normalized, { noEscape: true });
			const result = compiled(mockData);

			// console.log("Template Processado:", {
			// 	template: normalized,
			// 	mockData,
			// 	result,
			// });

			return { success: true, result, mockData };
		} catch (error) {
			let message = (error as Error).message;
			const idx = message.indexOf("\n-----------------------^\nExpecting ");
			if (idx !== -1) {
				message = `${message.substring(0, idx).trim()}...`;
			}

			return {
				success: false,
				result: message,
				mockData: {},
			};
		}
	}

	private isReservedWord(word: string): boolean {
		return (
			this.reservedWords.has(word) || /^['"`0-9]/.test(word) // Ignora strings e números
		);
	}

	private resolveRelativePath(context: string[], path: string): string[] {
		const parts = path.split("/");
		const newContext = [...context];

		for (const part of parts) {
			if (part === "..") {
				newContext.pop(); // Sobe um nível
			} else if (part !== ".") {
				newContext.push(part); // Caminho relativo válido
			}
		}
		return newContext;
	}

	private parseAST(ast: hbs.AST.Program): string[] {
		const pathSet = new Set<string>();

		const parseNode = (node: any, context: string[] = []): void => {
			if (!node) return;

			switch (node.type) {
				case "Program":
					node.body.forEach((childNode: any) => parseNode(childNode, context));
					break;

				case "MustacheStatement":
				case "SubExpression":
					if (node.path?.original === "lookup" && node.params?.length >= 2) {
						const [target] = node.params;
						if (target?.type === "PathExpression" && !this.isReservedWord(target.original)) {
							const resolvedPath = this.resolveRelativePath(context, target.original);
							const pathString = resolvedPath.join(".");

							// Marcar como array (sufixar com [])
							pathSet.add(`${pathString}[]`);
						}
					} else {
						if (node.params) {
							node.params.forEach((param: any) => parseNode(param, context));
						}
						if (node.hash) {
							parseNode(node.hash, context);
						}
						if (node.path?.type === "PathExpression" && !this.isReservedWord(node.path.original)) {
							const resolvedPath = this.resolveRelativePath(context, node.path.original);
							pathSet.add(resolvedPath.join("."));
						}
					}
					break;

				case "BlockStatement":
					if (node.path?.original === "with" || node.path?.original === "each") {
						const param = node.params?.[0];
						if (param?.type === "PathExpression") {
							const newContext = [...context, param.original];

							// Marcar caminho como array se for "each"
							if (node.path.original === "each") {
								this.arrayPaths.add(newContext.join("."));
							}

							parseNode(node.program, newContext);
						}
						if (node.inverse) parseNode(node.inverse, context);
					} else {
						parseNode(node.program, context);
						if (node.inverse) parseNode(node.inverse, context);
					}
					if (node.params) {
						node.params.forEach((param: any) => parseNode(param, context));
					}
					break;

				case "Hash":
					node.pairs.forEach((pair: { value: any }) => parseNode(pair.value, context));
					break;

				case "PathExpression":
					if (!this.isReservedWord(node.original)) {
						const resolvedPath = this.resolveRelativePath(context, node.original);
						pathSet.add(resolvedPath.join("."));
					}
					break;

				default:
					if (node.body) node.body.forEach((childNode: any) => parseNode(childNode, context));
					if (node.program) parseNode(node.program, context);
					if (node.inverse) parseNode(node.inverse, context);
					break;
			}
		};

		parseNode(ast);
		return [...pathSet];
	}

	private buildMockDataFromPaths(paths: string[]): MockData {
		const context: MockData = {};

		for (const fullPath of paths) {
			// Trata casos como: "items.@root.globalName"
			if (fullPath.includes("@root.")) {
				// Extrai o path real removendo a parte do contexto anterior
				const parts = fullPath.split(".");
				const rootIndex = parts.indexOf("@root");

				// Exemplo: ["items", "@root", "globalName"] → ["items"] e ["globalName"]
				const beforeRoot = parts.slice(0, rootIndex); // ["items"]
				const afterRoot = parts.slice(rootIndex + 1); // ["globalName"]

				// Reprocessa como dois caminhos separados
				paths.push(beforeRoot.join("."));
				paths.push(afterRoot.join("."));
				continue;
			}
			if (fullPath.startsWith("@")) continue; // ignora paths especiais como @root, @index etc.

			const isMarkedAsArray = fullPath.endsWith("[]");
			const cleanPath = isMarkedAsArray ? fullPath.slice(0, -2) : fullPath;
			const parts = cleanPath.split(".");
			let current = context;

			for (let index = 0; index < parts.length; index++) {
				const part = parts[index];
				const pathSoFar = parts.slice(0, index + 1).join(".");
				const isLeaf = index === parts.length - 1;

				const isArray = this.arrayPaths.has(pathSoFar) || (isLeaf && isMarkedAsArray);

				if (!current[part]) {
					if (isArray) {
						current[part] = [isLeaf ? this.generateMockValue(part) : {}];
						current = current[part][0]; // entra no objeto do array
					} else {
						current[part] = isLeaf ? this.generateMockValue(part) : {};
						current = current[part];
					}
				} else {
					current = Array.isArray(current[part]) ? current[part][0] : current[part];
				}
			}
		}

		return context;
	}

	private generateMockValue(keyName: string): any {
		const key = keyName.toLowerCase();

		if (["id", "codigo", "index", "qtd", "quantity", "count", "num", "numero", "value"].some((k) => key.includes(k))) return 1;
		if (["valor", "currency", "amount"].some((k) => key.includes(k))) return 1234.56;
		if (["date", "data"].some((k) => key.includes(k))) return new Date().toISOString();
		if (["age", "idade"].some((k) => key.includes(k))) return 21;
		if (["active", "ativo", "enabled", "disabled"].some((k) => key.includes(k))) return Math.random() > 0.5;
		if (key.includes("email")) return "exemplo@mock.com";

		return "valor_mock";
	}
}

export default new HandlebarsHelper();
