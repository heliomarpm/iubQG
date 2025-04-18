import { JsonType } from "../../shared/types";
import { CYAN, GREEN, RED, RESET_COLOR } from "../../shared/utils";
import Rule, { Validation } from "../models";

export class RequestRule implements Rule {
	private readonly activityList: JsonType[];

	constructor(activityList: JsonType[]) {
		this.activityList = activityList;
	}

	validate(activity: JsonType): Validation | Validation[] | null {
		const results: Validation[] = [];
		const { activityId, activityType, activityName } = activity;

		if (activityType !== "UserRequest") {
			return null;
		}

		const nextActivityId = this.activityList.find((act) => act.activityId === activityId)?.nextActivityId;

		// console.log(`Validando ${activityId} ${CYAN}${activityType} ${activityName}${RESET_COLOR} -> ${GREEN}${nextActivityId}${RESET_COLOR}`);
		const nextActivity = this.activityList.find((act) => act.activityId === nextActivityId);

		if (!nextActivity || nextActivity.activityType !== "UserResponse") {
			return {
				type: "CONEXÃO INVÁLIDA",
				level: "ERROR",
				blockType: activityType,
				blockName: activityName,
				issue: "Conexão inválida",
				note: "Conexão subsequente deve ser do tipo 'UserResponse'.",
				message: `O ${activityType} ${CYAN}"${activityName}"${RESET_COLOR} contém uma conexão inválida. A conexão subsequente precisa ser ${GREEN}"UserResponse"${RESET_COLOR}.`,
			};
		}

		// Extraindo as opções de "acoes" no UserRequest
		const requestTemplate = activity.requestUserInfoUdt?.requestUserInfoTemplate || "";
		const options = this.extractRequestOptions(requestTemplate);

		// Extraindo o padrão regex do UserResponse
		const responsePattern = this.extractResponsePattern(nextActivity);

		try {
			// Verifica se o pattern é uma regex válida
			const regex = new RegExp(responsePattern.replace(/\\\\/g, "\\"));

			if (responsePattern) {
				// Valida se o padrão contém "^" e "$" nas extremidades
				if (!responsePattern.startsWith("^") || !responsePattern.endsWith("$")) {
					results.push({
						type: "REGEX INCONSISTENTE",
						level: "ERROR",
						blockType: nextActivity.activityType,
						blockName: nextActivity.activityName,
						issue: "Regex inconsistente",
						note: "O padrão deve iniciar e terminar com ^ e $",
						message: `O padrão ${RED}"${responsePattern}"${RESET_COLOR} no ${CYAN}"${nextActivity.activityName}"${RESET_COLOR} deve começar com ${GREEN}"^"${RESET_COLOR} e terminar com ${GREEN}"$"${RESET_COLOR}.`,
					});
				}
			} else if (options.length > 0) {
				results.push({
					type: "REGEX INCONSISTENTE",
					level: "ERROR",
					blockType: nextActivity.activityType,
					blockName: nextActivity.activityName,
					issue: "Regex inconsistente",
					note: "O padrão não foi definido",
					message: `O ${nextActivity.activityType} ${CYAN}"${nextActivity.activityName}"${RESET_COLOR}, ${RED}não possui${RESET_COLOR} um padrão regex definido.`,
				});
			}

			// Validando se as opções do UserRequest coincidem com o regex do UserResponse
			const invalidOptions = options.filter((option) => !regex.test(option));

			if (invalidOptions.length > 0) {
				results.push({
					type: "REGEX INCONSISTENTE",
					level: "ERROR",
					blockType: nextActivity.activityType,
					blockName: nextActivity.activityName,
					issue: "Regex inconsistente",
					note: `Padrão incompatível com opções "(${options.join("|")})" do UserRequest "${activityName}"`,
					message: `As opções ${RED}[${options}]${RESET_COLOR} definidas no ${CYAN}"${activityName}"${RESET_COLOR} não são compatíveis com o padrão esperado no ${CYAN}"${nextActivity.activityName}"${RESET_COLOR}: ${RED}"${responsePattern}"${RESET_COLOR}.`,
				});
			}
			// }
		} catch (error) {
			results.push({
				type: "REGEX INVÁLIDA",
				level: "ERROR",
				blockType: nextActivity.activityType,
				blockName: nextActivity.activityName,
				issue: "Regex inválida",
				note: "Expressão regular inválida",
				message: `O padrão ${RED}"${responsePattern}"${RESET_COLOR} no ${CYAN}"${nextActivity.activityName}"${RESET_COLOR} não é uma expressão regular válida.`,
			});
		}

		return results.length > 0 ? results : null;
	}

	private extractRequestOptions(template: string): string[] {
		const cleanedTemplate = template.replace(/\n|\r|\t/g, "");
		const actionMatches = cleanedTemplate.match(/["']acao["']:\s*["'](\{.*?\}|.*?)["']/g) || [];
		const handlebarsTest = /^{{{?.*}}}?$/g;

		return actionMatches.map((item) => {
			const match = item.match(/["']acao["']:\s*(.*)$/);

			if (match) {
				const value = match[1]
					.replace(/^"(.*)"$/, "$1") 	// Remove aspas externas, se existirem
					.replace(/'/g, '"') 				// Substitui aspas simples por aspas duplas
					.replace(/\\"/g, '"'); 			// Remove escapes de aspas duplas

				// Caso seja uma string simples, retorne diretamente
				if (!value.startsWith("{") || !value.endsWith("}")) {
					return value;
				}

				// Verifica se é uma expressão Handlebars
				if (handlebarsTest.test(value)) {
					return "01";
				}

				try {
					const parsed = JSON.parse(value.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3').replace(/'/g, '"'));
					const firstValue = parsed[Object.keys(parsed)[0]];

					return firstValue !== undefined 
								? (handlebarsTest.test(firstValue) ? "02" : firstValue) 
								: null;
				} catch (e) {
					try {
						const jsonValue = value.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
						const parsed = JSON.parse(jsonValue.replace(/'/g, '"'));
						const firstValue = parsed[Object.keys(parsed)[0]];
						return firstValue !== undefined ? firstValue : null;
					} catch (error) {
						return null;
					}
				}
			}
			return null;
		});
	}

	private extractResponsePattern(activity: JsonType): string {
		const responseSchema = activity.userResponseInfoUdt?.respSchema || "";
		const patternMatch = responseSchema.match(/"pattern":\s*"([^"]+)"/);

		return patternMatch ? patternMatch[1] : "";
	}
}
