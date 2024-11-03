import Rule, { Validation } from "../models";
import { JsonType } from "../../shared/types";
import utils, { CYAN, RED, RESET_COLOR } from "../../shared/utils";

const urlFields: Record<string, string[]> = {
	CallApi: ["callApiUdt.hom.url", "callApiUdt.hom.authentication.authenticationUri", "callApiUdt.prod.url", "callApiUdt.prod.authentication.authenticationUri"],
};

export class ValidUrlRule implements Rule {
	validate(activity: JsonType): Validation[] | null {
		const { activityType, activityName } = activity;
		const fields = urlFields[activityType] || [];
		const results: Validation[] = [];

		fields.forEach((field) => {
			let url = utils.getNestedField(activity, field);
			const originalUrl = url || "";

			let isUrl = false;
			if (url) {
				url = this.removeHandlebarsExpressions(url!);
				if (url === "" && originalUrl.includes("{{")) {
					return; // Ignorar URLs vazias se foi removido expressoes de handlebars
				}

				isUrl = this.isValidUrl(url);
			}

			if (!isUrl) {
				results.push({
					type: "URL INVÁLIDA",
					level: "ERROR",
					blockType: activityType,
					blockName: activityName,
					issue: `URL inválida no campo "${field}"`,
					note: `URL: "${originalUrl}".`,
					message: `A URL no campo ${CYAN}"${field}"${RESET_COLOR} da atividade ${CYAN}"${activityName}"${RESET_COLOR} deve ser uma URL válida: ${RED}${originalUrl}${RESET_COLOR}.`,
				});
			} else {
				if (!this.isValidProtocolUrl(url!)) {
					results.push({
						type: "URL INVÁLIDA",
						level: "ERROR",
						blockType: activityType,
						blockName: activityName,
						issue: `Protocolo HTTPS ausente no campo "${field}"`,
						note: `URL: "${originalUrl}".`,
						message: `A URL no campo ${CYAN}"${field}"${RESET_COLOR} da atividade ${CYAN}"${activityName}"${RESET_COLOR} deve ter o protocolo HTTPS: ${RED}${originalUrl}${RESET_COLOR}.`,
					});
				}
			}
		});

		return results.filter((result) => result !== null);
	}

	private removeHandlebarsExpressions(url: string): string {
		return url.replace(/{{{?.*?}}}?/g, "").trim();
	}

	private isValidUrl(url: string): boolean {
		try {
			new URL(url);
			return true;
		} catch (e) {
			return false;
		}
	}

	private isValidProtocolUrl(url: string): boolean {
		try {
			const parsedUrl = new URL(url);
			return parsedUrl.protocol === "https:";
		} catch (e) {
			return false;
		}
	}
}
