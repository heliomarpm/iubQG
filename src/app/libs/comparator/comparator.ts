import { JsonType } from "../shared/types";
import utils from "../shared/utils";
import { BlockMap, Comparison, DiffType } from "./models";

export default class Comparator {
	private oldFlow: JsonType;
	private newFlow: JsonType;

	constructor(oldFlow: JsonType, newFlow: JsonType) {
		if (!oldFlow || !newFlow) {
			throw new Error("Fluxo não encontrado!");
		}

		delete oldFlow.desenho_estatico;
		delete newFlow.desenho_estatico;

		if (oldFlow.definicao_atividade.flowId !== newFlow.definicao_atividade.flowId) {
			throw new Error("Os fluxos devem ter o mesmo Id");
		}

		if (oldFlow.definicao_atividade.flowVersionNumber === newFlow.definicao_atividade.flowVersionNumber) {
			throw new Error("Os fluxos devem ter versões diferentes");
		}

		this.oldFlow = utils.updateActivityConfigurations(oldFlow);
		this.newFlow = utils.updateActivityConfigurations(newFlow);
	}

	public runComparison(): Comparison {
    const results: Comparison = {
        flowName: this.newFlow.definicao_atividade.flowName,
        newVersion: this.newFlow.definicao_atividade.flowVersionNumber,
        oldVersion: this.oldFlow.definicao_atividade.flowVersionNumber,
        blocks: {
            deleted: [],
            recreated: [],
            recreatedUpdated: [],
            updated: [],
            added: [],
        },
    };

    const oldBlockMap = new Map<string, BlockMap>(this.oldFlow.configuracao_atividade.map((block: JsonType) => [block.activityId, block]));
    const newBlockMap = new Map<string, BlockMap>(this.newFlow.configuracao_atividade.map((block: JsonType) => [block.activityId, block]));

    const recreatedIds = new Set<string>(); // Armazena os activityIds de blocos recriados

    // Processar exclusões e recriações na lista de configuração
    oldBlockMap.forEach((oldBlock, activityId) => {
        delete oldBlock.version;

        if (!newBlockMap.has(activityId)) {
            const recreatedBlock = Array.from(newBlockMap.values()).find(
                (newBlock) => newBlock.activityName === oldBlock.activityName && newBlock.activityType === oldBlock.activityType && newBlock.activityId !== activityId
            );

            if (recreatedBlock) {
                const changes = this.findDifferences(oldBlock, recreatedBlock);

                if (changes) {
                    results.blocks.recreatedUpdated.push({
                        activityId: recreatedBlock.activityId,
                        activityName: recreatedBlock.activityName,
                        activityType: recreatedBlock.activityType,
                        diff: changes,
                    });
                } else {
                    results.blocks.recreated.push({
                        activityId: recreatedBlock.activityId,
                        activityName: recreatedBlock.activityName,
                        activityType: recreatedBlock.activityType,
                        diff: [
                            {
                                propertyName: "activityId",
                                new: recreatedBlock.activityId,
                                old: oldBlock.activityId,
                            },
                        ],
                    });
                }
                recreatedIds.add(recreatedBlock.activityId); // Marcar como recriado
            } else {
                results.blocks.deleted.push({
                    activityId: oldBlock.activityId,
                    activityName: oldBlock.activityName,
                    activityType: oldBlock.activityType,
                });
            }
        } else {
            const newBlock = newBlockMap.get(activityId)!;
            const changes = this.findDifferences(oldBlock, newBlock);
            if (changes) {
                results.blocks.updated.push({
                    activityId: newBlock.activityId,
                    activityName: newBlock.activityName,
                    activityType: newBlock.activityType,
                    diff: changes,
                });
            }
        }
    });

    // lista de adiciondos ignorando os recriados
    newBlockMap.forEach((newBlock, activityId) => {
        if (!oldBlockMap.has(activityId) && !recreatedIds.has(activityId)) {
            results.blocks.added.push({
                activityId: newBlock.activityId,
                activityName: newBlock.activityName,
                activityType: newBlock.activityType,
            });
        }
    });

    return results;
}


	private findDifferences(oldBlock: BlockMap, newBlock: BlockMap, parentKey = ""): DiffType[] | null {
		const changes: DiffType[] = [];

		Object.keys(oldBlock).forEach((key) => {
			if (key === "activityId") {
				return;
			}
			const oldValue = oldBlock[key];
			const newValue = newBlock[key];
			const currentKey = parentKey ? `${parentKey}.${key}` : key;

			if (!oldValue && !newValue) {
				return;
			}

			if (Array.isArray(oldValue) && Array.isArray(newValue)) {
				if (!utils.isEqual(oldValue, newValue, true)) {
					changes.push({
						propertyName: currentKey,
						old: oldValue,
						new: newValue,
					});
				}
			} else if (typeof oldValue === "object" && typeof newValue === "object") {
				const nestedChanges = this.findDifferences(oldValue, newValue, currentKey);
				if (nestedChanges) changes.push(...nestedChanges);
			} else if (!utils.isEqual(oldValue, newValue, true)) {
				changes.push({
					propertyName: currentKey,
					old: oldValue,
					new: newValue,
				});
			}
		});

		return changes.length > 0 ? changes : null;
	}
}
