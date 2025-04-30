import { JsonType } from "../../shared/types";
import { CYAN, RED, RESET_COLOR, YELLOW } from "../../shared/utils";
import Rule, { Validation } from "../models";

export class ReferenceRule implements Rule {
	private activityList: JsonType[];
	private outputCache: Map<string, number>;

	constructor(activityList: JsonType[]) {
		this.activityList = activityList;
		this.outputCache = new Map<string, number>();

		// Cache the output locations of all blocks
		activityList.forEach((block) => {
			this.outputCache.set(block.outputDataLoc, 0);
		});
	}

	validate(activity: JsonType): Validation | Validation[] | null {
		const { activityName, activityType, inputDataLoc } = activity;
		const results: Validation[] = [];

		inputDataLoc.forEach((input: string) => {
			try {
				input = input.includes("|") ? input : `${activity.flowName}|${input}`;

				const [flow, output] = input.trim().split("|");

				if (flow !== activity.flowName) {
					//referencia externa
					results.push({
						type: "REFERENCIA EXTERNA",
						level: "WARNING",
						blockType: activityType,
						blockName: activityName,
						issue: "input de outro fluxo",
						note: `Assegure-se de que o input exista: ${JSON.stringify(input)}.`,
						message: `O ${activityType} ${CYAN}"${activityName}"${RESET_COLOR} recebe um input de outro fluxo: ${YELLOW}${JSON.stringify(input)}${RESET_COLOR}.`,
					});
				} else {
					//referencia interna
					let cacheStatus = this.outputCache.get(input) ?? 0;

					if (cacheStatus === 0) {
						// Se não verificado, verifica se existe
						const refExists = this.activityList.some((a) => a.outputDataLoc === input || a.outputDataLoc === output);

						if (refExists) {
							this.outputCache.set(input, 1); // Marca como válido
						} else {
							cacheStatus = 2;
							this.outputCache.set(input, 2); // Marca como inválido
						}
					}
					if (cacheStatus === 2) {
						results.push({
							type: "REFERENCIA INTERNA",
							level: "ERROR",
							blockType: activityType,
							blockName: activityName,
							issue: "input inexistente",
							note: `Substitua o input: ${JSON.stringify(input)}.`,
							message: `O ${activityType} ${CYAN}"${activityName}"${RESET_COLOR} recebe um input inexistente: ${RED}${JSON.stringify(input)}${RESET_COLOR}.`,
						});
					}
				}
			} catch (error) {
				results.push({
					type: "REFERENCIA INVALIDA",
					level: "ERROR",
					blockType: activityType,
					blockName: activityName,
					issue: "Referência impossível validar",
					note: `Verifique: "${JSON.stringify(input)}".`,
					message: `O ${activityType} ${CYAN}"${activityName}"${RESET_COLOR} contém uma referencia que não foi possível validar: ${RED}${JSON.stringify(input)}${RESET_COLOR}. \n\tErro => ${RED}${error}${RESET_COLOR}.`,
				});
			}
		});

		return results.filter((result) => result !== null);
	}
}
