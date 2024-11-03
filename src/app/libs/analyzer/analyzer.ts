import { JsonType } from '../shared/types';
import utils from '../shared/utils';
import { ValidationFactory } from './factories/validationFactory';
import { FlowReport, Validation, ValidationReport } from './models';

export default class Analyzer {
	private jsonFlow: JsonType;
	private flow: FlowReport;

	private statistic?: {
		duration: number;
		types: Map<string, number>;
	};

	constructor(jsonFlow: JsonType) {
		if (!jsonFlow) {
			throw new Error('Flow not found!');
		}

		delete jsonFlow.desenho_estatico?.definicao_atividade;
		const defFlow = jsonFlow.definicao_atividade;

		this.flow = {
			name: defFlow.flowName,
			version: defFlow.flowVersionNumber,
			situation: defFlow.flowSituationNameDef,
			countActivities: (defFlow.activityList || []).length,
			validationReport: { duration: 0, validations: [] },
		};

		this.jsonFlow = utils.updateActivityConfigurations(jsonFlow);
	}

	public runAnalysis(): FlowReport {
		try {
			const blocks = this.jsonFlow.configuracao_atividade || [];
			// const validationFactory = new ValidationFactory(this.journey.definicao_atividade.activityList as JsonObject[]);
			const validationFactory = new ValidationFactory(blocks as JsonType[]);

			const reports = blocks.map((block: JsonType) => validationFactory.createValidations(block));
			const validations = reports.flatMap((report: ValidationReport) => report.validations);
			const durations = reports.map((report: ValidationReport) => report.duration);
			const totalDuration = durations.reduce((a: number, b: number) => a + b, 0);

			console.log("validations", validations);
			this.flow.validationReport = { duration: totalDuration, validations };
			this.flow.validationReport.validations?.sort(utils.dynamicSort(['level', 'type', 'blockName']));

			return this.flow;
		} catch (error) {
			console.error(`Fluxo invalido: ${error}`);
			throw new Error(`Flow invalido: ${error}`);
		}
	}

	public report() {
		return this.flow;
	}

	public statisticsResult() {
		if (!this.statistic) {
			const typeCount = new Map<string, number>();

			const icons: Record<string, string> = {
				SUCCESS: '✅',
				WARNING: '⚠️ ',
				ERROR: '❌',
				INFO: '💡',
			};

			const report = this.flow.validationReport;

			report.validations?.forEach((validate: Validation) => {
				const icon = icons[validate.level] || '';
				const type = `${icon} ${validate.type}`;
				typeCount.set(type, (typeCount.get(type)! || 0) + 1);
			});

			this.statistic = {
				duration: report.duration,
				types: typeCount,
			};
		}

		return this.statistic;
	}

	public printReport() {
		const result = this.flow.validationReport;
		// const validations = reports.flatMap((report: ValidationReport) => report.validations);
		// const durations = reports.map((report: ValidationReport) => report.duration);
		// const totalDuration = durations.reduce((a: number, b: number) => a + b, 0); // Soma os tempos de execução

		const typeCount = new Map<string, number>();

		const icons: Record<string, string> = {
			SUCCESS: '✅',
			WARNING: '⚠️ ',
			ERROR: '❌',
			INFO: '💡',
		};

		console.log('\n');
		console.table([
			{ jornada: this.flow.name, versao: this.flow.version, situacao: this.flow.situation, blocos: this.flow.countActivities },
		]);

		let lastType = '';
		result.validations
			// .toSorted((a, b) => a.type.localeCompare(b.type))
			// .toSorted(utils.dynamicSort(['level', 'type', 'message']))
			?.forEach((validate: Validation) => {
				const icon = icons[validate.level] || '';
				const type = `${validate.type} ${icon}`;
				typeCount.set(type, (typeCount.get(type)! || 0) + 1);

				if (type !== lastType) {
					lastType = type;
					console.log('\n');
				}

				console.log(validate.type, icons[validate.level], ' |', validate.message);
			});

		console.log(`\nTempo total de execução: ${result.duration.toFixed(2)} ms`);

		typeCount.forEach((count, type) => {
			console.log(utils.padStart(count, 3, ' '), ':', type);
		});

		if (result.validations?.length === 0) {
			console.log(`\n>>> SUCESSO ${typeCount.get('SUCCESS')}  | Nenhuma inconsistência encontrado. <<<`);
		}
	}
}
