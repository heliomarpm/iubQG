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
				activity.nextDecitionActivityId =
					definition.nextActivityDecisionList && JSON.stringify(definition.nextActivityDecisionList) !== "{}" ? definition.nextActivityDecisionList : undefined;
			}
		});

		return flow;
	},

	isJson(str: string): boolean {
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

	isEquals(value1: any, value2: any, ignoreOrder = false): boolean {
		if (value1 === value2) {
			return true;
		}

		if (Array.isArray(value1) && Array.isArray(value2)) {
			if (ignoreOrder) {
				return value1.length === value2.length && value1.every((val) => value2.some((otherVal) => utils.isEquals(val, otherVal)));
			}
			return value1.length === value2.length && value1.every((val, index) => utils.isEquals(val, value2[index]));
		}

		if (typeof value1 === "object" && typeof value2 === "object" && value1 !== null && value2 !== null) {
			const keys1 = Object.keys(value1);
			const keys2 = Object.keys(value2);

			return keys1.length === keys2.length && keys1.every((key) => utils.isEquals(value1[key], value2[key]));
		}

		return false;
	},

	/**
	 * Classifica objetos com base em múltiplas propriedades.
	 *
	 * Se o nome da propriedade for prefixado com "-", a classificação será em ordem decrescente.
	 *
	 * @param {string | string[]} properties - Propriedades para classificar.
	 * @returns {function} Uma função comparadora para uso com métodos de classificação como Array.prototype.sort.
	 *
	 * @example
	 * const validations = [
	 *     { level: "WARNING", type: "TypeA", message: "This is a warning." },
	 *     { level: "ERROR", type: "TypeE", message: "Something went wrong." },
	 *     { level: "ERROR", type: "TypeE", message: "Another error." },
	 * ];
	 *
	 * const sortedValidations = validations.sort(sortByProps(['level', 'type', '-message']));
	 * console.log(sortedValidations); // [{ level: "ERROR", type: "TypeE", message: "Something went wrong." }, ...]
	 */
	sortByProps(properties: string | string[]): (a: any, b: any) => number {
		const propertyList = Array.isArray(properties) ? properties : [properties];

		const stringifyValue = (value: any): string => {
			return String(typeof value === "object" ? JSON.stringify(value || "") : value || "");
		};

		return (a: any, b: any): number => {
			for (const property of propertyList) {
				let sortOrder = 1;
				let currentProperty = property;

				if (property.startsWith("-")) {
					sortOrder = -1;
					currentProperty = property.substring(1);
				}

				const comparisonResult = stringifyValue(a[currentProperty]).localeCompare(stringifyValue(b[currentProperty]));

				if (comparisonResult !== 0) {
					return comparisonResult * sortOrder;
				}
			}
			return 0;
		};
	},
};

export default utils;
