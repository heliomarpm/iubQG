export interface Validation {
	type: string;
	level: string;
	blockType: string;
	blockName: string;
	issue: string;
	note: string;
	message?: string;
}

export interface ValidationReport {
	duration: number;
	validations: Validation[];
}

export interface FlowReport {
	name: string;
	version: string;
	situation: string;
	countActivities: number;
	validationReport: ValidationReport;
}

export interface ExternalFlows {
	flowId: string;
	flowName: string;
}
