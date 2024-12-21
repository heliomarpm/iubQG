/* eslint-disable @typescript-eslint/no-explicit-any */
// import fs from "fs";
// import path from "path";

import { JsonType } from "../types";

const utils = {
	// loadJsonFilesFromDirectory(directoryPath: string, extensions = [".json"]): JsonType[] {
	// 	const files = fs.readdirSync(directoryPath);
	// 	return files.filter((file) => extensions.some((ext) => file.endsWith(ext))).map((file) => JSON.parse(fs.readFileSync(path.join(directoryPath, file), "utf8")));
	// },

	updateActivityConfigurations(flow: JsonType) {
		const { definicao_atividade, configuracao_atividade } = flow;

		configuracao_atividade.forEach((activity: JsonType) => {
			const definition = definicao_atividade.activityList.find((def: JsonType) => def.activityId === activity.activityId);

			if (definition) {
				activity.nextActivityId = definition.nextActivityId && JSON.stringify(definition.nextActivityId) !== "{}" ? definition.nextActivityId : undefined;
				activity.nextDecitionActivityId = definition.nextActivityDecisionList && JSON.stringify(definition.nextActivityDecisionList) !== "{}" ? definition.nextActivityDecisionList : undefined;
			}
		});

		return flow;
	},

	isValidJson(str: string): boolean {
		try {
			JSON.parse(str);
			return true;
		} catch {
			return false;
		}
	},

	getNestedField(block: JsonType, field: string): string | null | undefined {
		const result = field.split(".").reduce((obj, key) => (obj ? obj[key] : undefined), block);
		//return JSON.stringify(result);

		if (result === null || result === undefined) {
			return result;
		}

		if (typeof result === "object") {
			return JSON.stringify(result);
		}
		return String(result);
	},

	isEqual(value1: any, value2: any, ignoreOrder = false): boolean {
		if (value1 === value2) {
			return true;
		}

		if (Array.isArray(value1) && Array.isArray(value2)) {
			if (ignoreOrder) {
				return value1.length === value2.length && value1.every((val) => value2.some((otherVal) => utils.isEqual(val, otherVal)));
			}
			return value1.length === value2.length && value1.every((val, index) => utils.isEqual(val, value2[index]));
		}

		if (typeof value1 === "object" && typeof value2 === "object" && value1 !== null && value2 !== null) {
			const keys1 = Object.keys(value1);
			const keys2 = Object.keys(value2);

			return keys1.length === keys2.length && keys1.every((key) => utils.isEqual(value1[key], value2[key]));
		}

		return false;
	},

	/**
	 * Função para ordenar objetos com base em múltiplas propriedades.
	 *
	 * @param {string | string[]} properties
	 * @returns {function} Uma função que pode ser usada com métodos de ordenação, como Array.prototype.sort.
	 *
	 * @example
	 * const validations = [
	 *     { level: "ERROR", type: "TypeA", message: "Something went wrong." },
	 *     { level: "WARNING", type: "TypeB", message: "This is a warning." },
	 *     { level: "ERROR", type: "TypeB", message: "Another error." },
	 * ];
	 *
	 * const sortedValidations = validations.sort(dynamicSort(['level', 'type', '-message'])); *
	 */
	dynamicSort(properties: string | string[]): (a: any, b: any) => number {
		properties = Array.isArray(properties) ? properties : [properties];

		const toStringValue = (value: any): string => {
			return (typeof value === "object" ? JSON.stringify(value || "") : value || "") as string;
		}

		return (a: any, b: any): number => {
			for (const property of properties) {
				let sortOrder = 1;
				let prop = property;

				if (property.startsWith("-")) {
					sortOrder = -1;
					prop = property.substring(1); // Remove o sinal de menos
				}

				const comparison = toStringValue(a[prop]).localeCompare(toStringValue(b[prop]));

				// Se a comparação não for zero, retorna o resultado multiplicado pela ordem
				if (comparison !== 0) {
					return comparison * sortOrder;
				}
			}
			return 0; // Se todos os campos forem iguais
		};
	},
	zeroPad: (value: number, max: number) => {
		return value.toString().padStart(Math.floor(Math.log10(max) + 1), "0");
	},
	padStart(value: number | string, length: number, prefix = "0"): string {
		return value.toString().padStart(length, prefix);
	},
};

export default utils;
