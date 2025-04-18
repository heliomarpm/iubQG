import { JsonType } from '../shared/types';
import utils from '../shared/utils';
import { BlockMap, Comparison, DiffType } from './models';

export default class Comparator {
	private oldFlow: JsonType;
	private newFlow: JsonType;

	constructor(oldFlow: JsonType, newFlow: JsonType) {
		if (!oldFlow || !newFlow) {
			throw new Error('Fluxo não encontrado!');
		}

		delete oldFlow.desenho_estatico;
		delete newFlow.desenho_estatico;

		if (oldFlow.definicao_atividade.flowId !== newFlow.definicao_atividade.flowId) {
			throw new Error('Os fluxos devem ter o mesmo Id');
		}

		if (oldFlow.definicao_atividade.flowVersionNumber === newFlow.definicao_atividade.flowVersionNumber) {
			throw new Error('Os fluxos devem ter versões diferentes');
		}

		const oldVersion: number = oldFlow.definicao_atividade.flowVersionNumber;
		const newVersion: number = newFlow.definicao_atividade.flowVersionNumber;

		this.oldFlow = utils.updateActivityConfigurations(oldVersion < newVersion ? oldFlow : newFlow);
		this.newFlow = utils.updateActivityConfigurations(oldVersion > newVersion ? oldFlow : newFlow);
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
		const ignoreKeys = ['activityId', 'version', 'statusFlowDef'];

		// Processar exclusões e recriações na lista de configuração
		oldBlockMap.forEach((oldBlock, activityId) => {
			delete oldBlock.version;

			if (!newBlockMap.has(activityId)) {
				const recreatedBlock = Array.from(newBlockMap.values()).find(
					newBlock =>
						newBlock.activityName === oldBlock.activityName &&
						newBlock.activityType === oldBlock.activityType &&
						newBlock.activityId !== activityId,
				);

				if (recreatedBlock) {
					delete recreatedBlock.version;
					const changes = this.findDifferences(oldBlock, recreatedBlock, ignoreKeys);

					if (changes) {
						results.blocks.recreatedUpdated.push({
							activityId: recreatedBlock.activityId,
							activityName: recreatedBlock.activityName,
							activityType: recreatedBlock.activityType,
							diff: [
								{
									propertyName: 'activityId',
									old: oldBlock.activityId,
									new: recreatedBlock.activityId,
								},
								...changes
							],
						});
					} else {
						results.blocks.recreated.push({
							activityId: recreatedBlock.activityId,
							activityName: recreatedBlock.activityName,
							activityType: recreatedBlock.activityType,
							diff: [
								{
									propertyName: 'activityId',
									old: oldBlock.activityId,
									new: recreatedBlock.activityId,
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
						content: oldBlock,
					});
				}
			} else {
				const newBlock = newBlockMap.get(activityId)!;
				delete newBlock.version;

				const changes = this.findDifferences(oldBlock, newBlock, ignoreKeys);
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
					content: newBlock,
				});
			}
		});

		return results;
	}

	private findDifferences(oldBlock: BlockMap, newBlock: BlockMap, ignoreKeys: string[] = [], parentKey = ''): DiffType[] | null {
		const changes: DiffType[] = [];
		const allKeys = new Set([...Object.keys(oldBlock), ...Object.keys(newBlock)]); // Combinar todas as chaves

		allKeys.forEach((key) => {
			const oldValue = oldBlock[key];
			const newValue = newBlock[key];
			const currentKey = parentKey ? `${parentKey}.${key}` : key;

			// Ignorar chaves especificadas
			if (ignoreKeys.includes(currentKey)) {
				return;
			}
			if (!oldValue && !newValue) {
				return;
			}

			if (Array.isArray(oldValue) && Array.isArray(newValue)) {
				if (!utils.isEquals(oldValue, newValue, true)) {
					changes.push({
						propertyName: currentKey,
						old: oldValue,
						new: newValue,
					});
				}
			} else if (oldValue && typeof oldValue === 'object' && newValue && typeof newValue === 'object') {
				const nestedChanges = this.findDifferences(oldValue, newValue, ignoreKeys, currentKey);
				if (nestedChanges) changes.push(...nestedChanges);
			}
			else if (oldValue === undefined) {
				// só existe na nova versão
				changes.push({
					propertyName: currentKey,
					old: undefined,
					new: newValue,
				});
			}
			else if (newValue === undefined) {
				// só existe na versão antiga
				changes.push({
					propertyName: currentKey,
					old: oldValue,
					new: undefined,
				});
			}
			else if (!utils.isEquals(oldValue, newValue, true)) {
				// Valores diferentes
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
