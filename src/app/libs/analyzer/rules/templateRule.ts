import handlebarsHelper from "../../shared/handlebars/handlebars.helper";
import { JsonType } from "../../shared/types";
import utils, { CYAN, RED, RESET_COLOR } from "../../shared/utils";
import Rule, { Validation } from "../models";

const templateFields: Record<string, string> = {
	Mapper: "mapperUdt.mapperTemplate",
	SendMessage: "sendMessageUdt.sendMessageTemplate",
	UserRequest: "requestUserInfoUdt.requestUserInfoTemplate",
	UserResponse: "userResponseInfoUdt.respSchema",
};

export class TemplateRule implements Rule {
	validate(activity: JsonType): Validation | Validation[] | null {
		const { activityName, activityType } = activity;
		const field = templateFields[activityType] || "";

		if (field.length > 0) {
			let template = utils.getNestedField(activity, field);

			if (template) {
				const result = handlebarsHelper.processTemplate(template);
				if (!result.success) {
					return {
						type: "TEMPLATE",
						level: "ERROR",
						blockType: activityType,
						blockName: activityName,
						issue: "Template Handlebars inválido",
						note: `${result.result}.`, // Template: ${JSON.stringify(template)}`,
						message: `O ${activityType} ${CYAN}"${activityName}"${RESET_COLOR} contém erro ao processar o template! ${RED}${result.result}${RESET_COLOR}.`,
					};
				}

				if (result.result.startsWith("{") || result.result.startsWith("[")) {
					const sanitizedJson = result.result
						.replace(/\r\n\t|\r|\n|\t/g, "") // Remove quebras de linha
						.replace(/,(\s*}|\s*])/g, "$1"); // Remove vírgula antes de chave de fechamento

					if (!utils.isJson(sanitizedJson)) {
						// Tenta adicionar aspas às chaves e verifica novamente

						// [...sanitizedJson.matchAll(/:\s*([^,\n}\s]+)/g)].forEach((m, i) => {
						// 	console.log(`Match ${i}:`, JSON.stringify(m[1]), 'raw:', m[0]);
						// });

						const finalJson = sanitizedJson
							.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3') // Corrige chaves sem aspas
							// .replace(/:\s*valor_mock(?=[,\n}])/g, ': "valor_mock"'); // Corrige valor_mock sem aspas após dois-pontos
							.replace(/:\s*([^\s",}\]]+)/g, (match, value) => {
								// Só converte se for exatamente "valor_mock"
								if (value === "valor_mock") {
									return `: "valor_mock"`;
								}
								return match;
							});

						if (!utils.isJson(finalJson)) {
							return {
								type: "TEMPLATE",
								level: "ERROR",
								blockType: activityType,
								blockName: activityName,
								issue: "Resultado não gerou um JSON válido",
								note: `${JSON.stringify(result.result)}`,
								message: `O ${activityType} ${CYAN}"${activityName}"${RESET_COLOR} resultou em um JSON inválido: ${RED}${finalJson}${RESET_COLOR}.`,
							};
						}
					}
				}
			}
		}

		return null;
	}
}
