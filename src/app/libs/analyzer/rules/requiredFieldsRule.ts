import { JsonType } from '../../shared/types';
import utils, { CYAN, RED, RESET_COLOR } from '../../shared/utils';
import Rule, { Validation } from '../models';

const requiredFields: Record<string, (string | string[])[]> = {
	Decision: ['inputDataLoc', 'decisionUdt.conditions', 'decisionUdt.decisionEngineType'],
	CallApi: [
		'callApiUdt.hom.url',
		'callApiUdt.hom.authentication.authenticationType',
		'callApiUdt.hom.authentication.authenticationUri',
		['callApiUdt.hom.authentication.clientId', 'callApiUdt.hom.authentication.client_id'],
		['callApiUdt.hom.authentication.clientSecret', 'callApiUdt.hom.authentication.client_secret'],
		'callApiUdt.prod.url',
		'callApiUdt.prod.authentication.authenticationType',
		'callApiUdt.prod.authentication.authenticationUri',
		['callApiUdt.prod.authentication.clientId', 'callApiUdt.prod.authentication.client_id'],
		['callApiUdt.prod.authentication.clientSecret', 'callApiUdt.prod.authentication.client_secret'],
	],
	Filter: ['inputDataLoc', 'filterUdt.filterCondition', 'filterUdt.inputDataLocFilter'],
	GoToFlow: ['goToFlowUdt.subFlowId', 'goToFlowUdt.startSubFlowActivityName'],
	Mapper: ['mapperUdt.mapperTemplate'],
	SendMessage: ['sendMessageUdt.sendMessageTemplate'],
	UserRequest: ['requestUserInfoUdt.requestUserInfoTemplate'],
	UserResponse: ['userResponseInfoUdt.respSchema', 'userResponseInfoUdt.userReplyTries'],
};

export class RequiredFieldsRule implements Rule {
	validate(activity: JsonType): Validation | Validation[] | null {
		const { activityType, activityName } = activity;
		const required = requiredFields[activityType] || [];

		const missingFields = required.filter((field) => {
			if (Array.isArray(field)) {
				// return field.some((f) => !utils.getNestedField(activity, f));
				return field.every((f) => {
					const value = utils.getNestedField(activity, f);
					return !value || value.trim() === '';
				});
			}

			const value = utils.getNestedField(activity, field);
			return !value || value.trim() === '';
		});

		// Se houver campos obrigatórios faltando, retorna a validação com erro
		if (missingFields.length > 0) {
			const missingFieldsMessage = missingFields
				.map((field) => {
					if (Array.isArray(field)) {
						return field.join(' ou ');
					}
					return field;
				})
				.join(', ');

			return {
				type: 'CAMPO OBRIGATORIO',
				level: 'ERROR',
				blockType: activityType,
				blockName: activityName,
				issue: 'Campos obrigatórios faltando',
				note: `ausente: ${missingFieldsMessage}`,
				message: `Campos obrigatórios do ${activityType} ${CYAN}"${activityName}"${RESET_COLOR} não foram preenchidos: ${RED}${missingFieldsMessage}${RESET_COLOR}.`,
			};
		}

		return null;
	}
}
