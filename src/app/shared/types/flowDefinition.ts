export interface FlowDefinition {
	flowId: string;
	flowName: string;
	versions: {
		hom: {
			pilot: number;
			publish: number;
		};
		prod: {
			pilot: number;
			publish: number;
		};
	};
	updatedAt: string;
}
