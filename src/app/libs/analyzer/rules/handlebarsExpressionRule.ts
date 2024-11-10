import { JsonType } from '../../shared/types';
import utils, { CYAN, RESET_COLOR, YELLOW } from '../../shared/utils';
import Rule, { Validation } from '../models';

const consistencyFields: Record<string, string[]> = {
	SendMessage: ['sendMessageUdt.sendMessageTemplate'],
	UserRequest: ['requestUserInfoUdt.requestUserInfoTemplate'],
	UserResponse: ['userResponseInfoUdt.respSchema', 'userResponseInfoUdt.userReplyTries'],
	Decision: ['decisionUdt.conditions'],
	Mapper: ['mapperUdt.mapperTemplate'],
	Filter: ['filterUdt.filterTemplate'],
	CallApi: [
		'callApiUdt.prod.body',
		'callApiUdt.prod.queryString',
		'callApiUdt.prod.routing',
	],
};

export class HandlebarsExpressionRule implements Rule {
	// Expressões handlebars de controle que podem ser ignoradas
	private controlExpressionRegex = /{{\s*#|{{\s*\/|{{\s*else/;
	// Expressões handlebars de valores (duas ou três chaves)
	private valueExpressionRegex = /{{2,3}[^{}]+}{2,3}/g;

	validate(activity: JsonType): Validation | Validation[] | null {
		const { activityName, activityType } = activity;
		const consistencyFieldsForType = consistencyFields[activityType] || [];
		const results: Validation[] = [];

		consistencyFieldsForType.forEach(field => {
			const fieldValue = utils.getNestedField(activity, field);

			if (fieldValue) {
				let match: RegExpExecArray | null;

				// Usar exec para capturar todas as expressões
				while ((match = this.valueExpressionRegex.exec(fieldValue)) !== null) {
					const expression = match[0].trim();

					// Ignorar expressões de controle
					if (!this.controlExpressionRegex.test(expression)) {
						// Se não for uma expressão com três chaves, sinalizar
						if (!expression.startsWith('{{{') || !expression.endsWith('}}}')) {
							results.push({
								type: 'HANDLEBARS ENCODING',
								level: 'WARNING',
								blockType: activityType,
								blockName: activityName,
								issue: 'Expressão com problema em potencial',
								note: `Envolva a expressão "${expression}" do campo "${field}" por 3 chaves "{{{ }}}".`,
								message: `No ${activityType} ${CYAN}"${activityName}"${RESET_COLOR}, envolva a expressão ${YELLOW}"${expression}"${RESET_COLOR} do campo ${CYAN}"${field}"${RESET_COLOR} por 3 chaves ${YELLOW}"{{{ }}}"${RESET_COLOR}.`,
							});
						}
					}
				}
			}
		});

		return results.filter(result => result !== null);
	}
}
