import Rule, { Validation } from "../models";
import { JsonType } from "../../shared/types";
import utils, { CYAN, RED, RESET_COLOR } from "../../shared/utils";

const requiredFields: Record<string, string[]> = {
	Decision: ["inputDataLoc", "decisionUdt.conditions", "decisionUdt.decisionEngineType"],
	CallApi: [
		"callApiUdt.hom.url",
		"callApiUdt.hom.authentication.authenticationType",
		"callApiUdt.hom.authentication.authenticationUri",
		"callApiUdt.hom.authentication.clientId",
		"callApiUdt.hom.authentication.client_secret",
		"callApiUdt.prod.url",
		"callApiUdt.prod.authentication.authenticationType",
		"callApiUdt.prod.authentication.authenticationUri",
		"callApiUdt.prod.authentication.clientId",
		"callApiUdt.prod.authentication.client_secret",
	],
	Filter: ["inputDataLoc", "filterUdt.filterCondition", "filterUdt.inputDataLocFilter"],
	GoToFlow: ["goToFlowUdt.subFlowId", "goToFlowUdt.startSubFlowActivityName"],
	Mapper: ["mapperUdt.mapperTemplate"],
	SendMessage: ["sendMessageUdt.sendMessageTemplate"],
	UserRequest: ["requestUserInfoUdt.requestUserInfoTemplate"],
	UserResponse: ["userResponseInfoUdt.respSchema", "userResponseInfoUdt.userReplyTries"],
};

export class RequiredFieldsRule implements Rule {
	validate(activity: JsonType): Validation | Validation[] | null {
		const { activityType, activityName } = activity;
		const required = requiredFields[activityType] || [];

		const missingFields = required.filter((field) => {
			const value = utils.getNestedField(activity, field);
			return !value || value.trim() === "";
		});

		// Se houver campos obrigatórios faltando, retorna a validação com erro
		if (missingFields.length > 0) {
			return {
				type: "CAMPO OBRIGATORIO",
				level: "ERROR",
				blockType: activityType,
				blockName: activityName,
				issue: "Campos obrigatórios faltando",
				note: `ausente: ${missingFields.join(", ")}`,
				message: `Campos obrigatórios do ${activityType} ${CYAN}"${activityName}"${RESET_COLOR} não foram preenchidos: ${RED}${missingFields.join(", ")}${RESET_COLOR}.`,
			};
		}

		return null;
	}
}
