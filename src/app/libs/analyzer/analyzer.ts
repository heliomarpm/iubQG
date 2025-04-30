import { JsonType } from "../shared/types";
import utils from "../shared/utils";
import { ValidationFactory } from "./factories/validationFactory";
import { ExternalFlows, FlowReport, Validation, ValidationReport } from "./models";

export default class Analyzer {
	private jsonFlow: JsonType;
	private flow: FlowReport;

	private statistic?: {
		duration: number;
		types: Map<string, { count: number; level: string }>;
	};

	constructor(jsonFlow: JsonType) {
		if (!jsonFlow) {
			throw new Error("Flow not found!");
		}

		delete jsonFlow.desenho_estatico;
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

	get report() {
		return this.flow;
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

			this.flow.validationReport = { duration: totalDuration, validations };
			this.flow.validationReport.validations?.sort(utils.sortByProps(["level", "type", "blockName"]));

			return this.flow;
		} catch (error) {
			console.error(`Fluxo invalido: ${error}`);
			throw new Error(`Flow invalido: ${error}`);
		}
	}

	public statisticsResult() {
		if (!this.statistic) {
			const types = new Map<string, { count: number; level: string }>();

			const icons: Record<string, string> = {
				SUCCESS: "✅",
				WARNING: "⚠️ ",
				ERROR: "❌",
				INFO: "💡",
			};

			const report = this.flow.validationReport;

			report.validations?.forEach((validate: Validation) => {
				const icon = icons[validate.level] || "";
				const key = `${icon} ${validate.type}`;
				//types.set(key, (types.get(key)! || 0) + 1);

				const current = types.get(key) || { count: 0, level: validate.level };

				current.count++;
				types.set(key, current);
			});

			this.statistic = {
				duration: report.duration,
				types,
			};
		}

		return this.statistic;
	}

	public printReport() {
		const result = this.flow.validationReport;
		// const validations = reports.flatMap((report: ValidationReport) => report.validations);
		// const durations = reports.map((report: ValidationReport) => report.duration);
		// const totalDuration = durations.reduce((a: number, b: number) => a + b, 0); // Soma os tempos de execução

		const types = new Map<string, number>();

		const icons: Record<string, string> = {
			SUCCESS: "✅",
			WARNING: "⚠️ ",
			ERROR: "❌",
			INFO: "💡",
		};

		console.log("\n");
		console.table([{ jornada: this.flow.name, versao: this.flow.version, situacao: this.flow.situation, blocos: this.flow.countActivities }]);

		let lastType = "";
		result.validations?.forEach((validate: Validation) => {
			const icon = icons[validate.level] || "";
			const type = `${validate.type} ${icon}`;
			types.set(type, (types.get(type)! || 0) + 1);

			if (type !== lastType) {
				lastType = type;
				console.log("\n");
			}

			console.log(validate.type, icons[validate.level], " |", validate.message);
		});

		console.log(`\nTempo total de execução: ${result.duration.toFixed(2)} ms`);

		types.forEach((count, type) => {
			console.log(String(count).padStart(3, " "), ":", type);
		});

		if (result.validations?.length === 0) {
			console.log(`\n>>> SUCESSO ${types.get("SUCCESS")}  | Nenhuma inconsistência encontrado. <<<`);
		}
	}

	public getExtenalFlows() {
		// const gtfs = blocks.filter((block: JsonType) => block.activityType === 'GoToFlow');
		//TODO: buscar nome das jornadas pelo id
		const flowName = this.jsonFlow.definicao_atividade || "";
		const blocks = this.jsonFlow.configuracao_atividade || [];

		const externalInputs: ExternalFlows[] = [];
		const blockExternalInputs = new Set<string>();

		blocks.forEach((block: JsonType) => {
			block.inputDataLoc?.forEach((input: string) => {
				const [inputFlowName] = input.split("|");

				if (inputFlowName !== flowName) {
					blockExternalInputs.add(inputFlowName);
				}
			});
		});

		Array.from(blockExternalInputs).forEach((input: string) => {
			externalInputs.push({
				flowId: "",
				flowName: input,
			});
		});

		return externalInputs;
	}
}
