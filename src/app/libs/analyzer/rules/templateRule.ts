import Rule, { Validation } from "../models";
import { JsonType } from "../../shared/types";
import utils, { CYAN, RED, RESET_COLOR } from "../../shared/utils";

const templateFields: Record<string, string> = {
	Mapper: "mapperUdt.mapperTemplate",
	SendMessage: "sendMessageUdt.sendMessageTemplate",
	UserRequest: "requestUserInfoUdt.requestUserInfoTemplate",
	UserResponse: "userResponseInfoUdt.respSchema",
};

export class TemplateRule implements Rule {
	validate(activity: JsonType): Validation[] | null {
		const { activityName, activityType } = activity;
		const field = templateFields[activityType] || "";

		if (field.length > 0) {
			const template = utils.getNestedField(activity, field);

			if (template) {
				const isValidJson = this.isValidTemplate(template);

				if (!isValidJson) {
					return [{
						type: "TEMPLATE",
						level: "ERROR",
						blockType: activityType,
						blockName: activityName,
						issue: "Template inválido",
						note: `${JSON.stringify(template)}`,
						message: `O ${activityType} ${CYAN}"${activityName}"${RESET_COLOR} não contém template válido: ${RED}${JSON.stringify(template)}${RESET_COLOR}.`,
					}];
				}
			}
		}
		return null;
	}

	private isValidTemplate(str: string): boolean {
		// Valida chaves abertas e fechadas
		const isValid = this.checkHandlebarsBraces(str);
		if (!isValid) {
			return false;
		}

		// Substitui expressões Handlebars por valores fictícios
		const sanitizedJson = str
			.replace(/{{{?\s*#.*?}}}?/gs, "@@@") // Remove expressões Handlebars {{#...}} e {{{#...}}}
			.replace(/{{{?\s*\/.*?}}}?/gs, "@@@") // Remove expressões Handlebars {{/...}} e {{{/...}}}
			.replace(/@@@\s*{{{?\s*else\s*}}}?\s*@@@/g, "") // Remove {{else}} entre {{#}}
			.replace(/@@@\s*{{{?\s*else\s*}}}?/g, "") // Remove {{else}} após {{#}}
			.replace(/@@@/g, "") // Remove {{#}}
			.replace(/,\s*{{{?\s*else\s*}}}?\s*,/g, "") // Remove {{else}} entre vírgulas
			.replace(/,\s*{{{?\s*else\s*}}}?/g, "") // Remove {{else}} após vírgula
			.replace(/{{{?\s*else\s*}}}?\s*,/g, "") // Remove {{else}} antes de vírgula
			.replace(/{{{?\s*else\s*}}}?/g, ",") // Substitui {{else}} isolado por ","
			.replace(/{{{?\s*[^}]+}}}?/g, "0") // Substitui variáveis {{expr}} ou {{{expr}}} por "0"
			.replace(/\\\//g, "/") // Substitui barras invertidas por barras normais
			.replace(/\r\n\t|\r|\n|\t/g, "") // Remove quebras de linha
			.replace(/,(\s*}|\s*])/g, "$1") // Remove vírgula antes de chave de fechamento
			.replace(/,"\w+",/g, ","); // Remove valores incompletos sem dois-pontos entre eles

		if (utils.isValidJson(sanitizedJson)) return true;

		// Tenta adicionar aspas às chaves e verifica novamente
		// const finalJson = sanitizedJson.replace(/(\w+)\s*:/g, '"$1":');
		const finalJson = sanitizedJson.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');

		// if (utils.isValidJson(finalJson)) return true;
		// console.error("Template original:\n", str);
		// console.error("Template inválido:\n", finalJson);

		return utils.isValidJson(finalJson);
	}

	private checkHandlebarsBraces(str: string): boolean {
		if (!str.includes("{{")) {
			return true; // Sem chaves Handlebars, não há necessidade de verificar
		}

		const bracesStack: string[] = [];
		const pattern = /({{{?|}}}?)/g;
		let match;

		while ((match = pattern.exec(str)) !== null) {
			const brace = match[0];

			if (brace === "{{{" || brace === "{{") {
				bracesStack.push(brace);
			} else if (brace === "}}}") {
				const lastBrace = bracesStack.pop();
				if (lastBrace !== "{{{") return false;
			} else if (brace === "}}") {
				const lastBrace = bracesStack.pop();
				if (lastBrace !== "{{") return false;
			}
		}

		return bracesStack.length === 0;
	}
}
