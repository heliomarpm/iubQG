import { JsonType } from '../../shared/types';
import { CYAN, GREEN, RED, RESET_COLOR, YELLOW } from '../../shared/utils';
import Rule, { Validation } from '../models';

export class ConsistencyRule implements Rule {
	private static readonly expectedOutputDataLocPatterns = [/^(.+)_result$/, /^([^|]+)\|(.+)_result$/];

	validate(activity: JsonType): Validation | Validation[] | null {
		const { activityType, activityName, inputDataLoc, outputDataLoc } = activity;
		const results: Validation[] = [];

		if (activityType === 'StartFlow' || outputDataLoc?.endsWith('__sessionData__')) {
			return results;
		}

		// if (!activityName || !outputDataLoc) {
		// 	results.push({
		// 		type: "CONSISTENCY_ERROR",
		// 		level: "ERROR",
		// 		message: `Atividade ${CYAN}"${activityName || "sem nome"}"${RESET_COLOR}, não possui campos ${RED}"activityName"${RESET_COLOR} ou ${RED}"outputDataLoc"${RESET_COLOR} válidos.`,
		// 		blockType: activityType,
		// 		blockName: activityName,
		// 	});
		// }

		// Verifica se nome de resultado finaliza com "_result"
		const expectedOutputDataLoc = ConsistencyRule.expectedOutputDataLocPatterns
			.map(pattern => pattern.exec(outputDataLoc)?.[1])
			.find(match => match);

		if (!expectedOutputDataLoc) {
			results.push({
				type: 'INCONSISTENTE',
				level: 'INFO',
				blockType: activityType,
				blockName: activityName,
				issue: '"Nome de Resultado" inconsistente',
				note: `Esperado: "${activityName}_result", encontrado: "${outputDataLoc.split('|').pop()}".`,
				message: `O ${activityType} ${CYAN}"${activityName}"${RESET_COLOR}, está com "Nome de Resultado" inconsistente. Esperado: ${GREEN}${activityName}_result${RESET_COLOR}, encontrado: ${YELLOW}${outputDataLoc.split('|').pop()}${RESET_COLOR}.`,
			});
		} else {
			// Verifica se nome de resultado é consistente com o nome do bloco
			const outputDataName = outputDataLoc.split('|').pop().replace('_result', '');

			if (!activityName.startsWith(outputDataName)) {
				results.push({
					type: 'INCONSISTENTE',
					level: 'INFO',
					blockType: activityType,
					blockName: activityName,
					issue: '"Nome de Resultado" muito diferente',
					note: `Esperado: "${activityName}_result", encontrado: "${outputDataLoc.split('|').pop()}".`,
					message: `O ${activityType} ${CYAN}"${activityName}"${RESET_COLOR}, está com o "Nome de Resultado" muito diferente. Esperado: ${GREEN}${activityName}_result${RESET_COLOR}, encontrado ${YELLOW}"${outputDataLoc.split('|').pop()}"${RESET_COLOR}.`,
				});
			}
		}

		if (activityType === 'Filter') {
			if (inputDataLoc?.length < 1) {
				// mover para validacao de campos obrigatorios
				results.push({
					type: 'INCONSISTENTE',
					level: 'ERROR',
					blockType: activityType,
					blockName: activityName,
					issue: 'Filtro deve conter ao menos um item de entrada',
					note: `Esperado: "${activityName}_result", encontrado: "${outputDataLoc.split('|').pop()}".`,
					message: `O ${activityType} ${CYAN}"${activityName}"${RESET_COLOR}, deve conter ao menos ${RED}1 item${RESET_COLOR} em dados de entrada.`,
				});
			} else {
				const expectedInputDataLocFilter = activity.inputDataLoc[0].split('|').pop();
				const inputDataLocFilter = activity.filterUdt?.inputDataLocFilter;

				if (expectedInputDataLocFilter !== inputDataLocFilter) {
					results.push({
						type: 'INCONSISTENTE',
						level: 'ERROR',
						blockType: activityType,
						blockName: activityName,
						issue: '"Output" incorreto',
						note: `Esperado: "${expectedInputDataLocFilter}", encontrado: "${inputDataLocFilter}".`,
						message: `O ${activityType} ${CYAN}"${activityName}"${RESET_COLOR}, está com "Output" incorreto. Esperado: ${GREEN}${expectedInputDataLocFilter}${RESET_COLOR}, encontrado: ${RED}${inputDataLocFilter}${RESET_COLOR}.`,
					});
				}
			}
		}

		if (activityType === 'UserResponse') {
			const userReplyTries = activity.userResponseInfoUdt?.userReplyTries || [];

			const attemptChecks = userReplyTries.filter(
				(item: JsonType) => item.item1 && item.item1.includes('attemptCheck') && item.item1.includes('numTentativas'),
			);

			if (attemptChecks.length < 2) {
				results.push({
					type: 'INCONSISTENTE',
					level: 'WARNING',
					blockType: activityType,
					blockName: activityName,
					issue: 'Nº TENTATIVAS inadequadas',
					note: `Esperado: "${activityName}_result", encontrado: "${outputDataLoc.split('|').pop()}".`,
					message: `Verifique se o ${activityType} ${CYAN}"${activityName}"${RESET_COLOR}, contém a validação de TENTATIVAS adequada.`,
				});
			}
		}

		if (Array.isArray(inputDataLoc) && inputDataLoc?.find((input: string) => input.startsWith('|'))?.length > 0) {
			results.push({
				type: 'INPUT INCONSISTENTE',
				level: 'ERROR',
				blockType: activityType,
				blockName: activityName,
				issue: 'Campo de entrada inválido',
				note: "Campo de entrada não deve iniciar com '|'",
				message: `O ${activityType} ${CYAN}"${activityName}"${RESET_COLOR}, está com campo de entrada iniciando com ${RED}"|"${RESET_COLOR}.`,
			});
		}

		if (outputDataLoc.startsWith('|')) {
			results.push({
				type: 'OUTPUT INCONSISTENTE',
				level: 'ERROR',
				blockType: activityType,
				blockName: activityName,
				issue: 'Campo de saída inválido',
				note: "Campo de saída não deve iniciar com '|'",
				message: `O ${activityType} ${CYAN}"${activityName}"${RESET_COLOR}, está com campo de saída iniciando com ${RED}"|"${RESET_COLOR}.`,
			});
		}

		return results.filter(result => result !== null);
	}
}
