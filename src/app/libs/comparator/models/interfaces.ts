import { DiffType } from "./types";

interface Block {
	activityId: string;
	activityName: string;
	activityType: string;
}

export interface BlockMap extends Block {
	[key: string]: any;
}

export interface BlockDiff extends Block {
	diff: DiffType[];
}

export interface Comparison {
	flowName: string;
	newVersion: string;
	oldVersion: string;
	blocks: {
		deleted: Block[];
		recreated: BlockDiff[];
		recreatedUpdated: BlockDiff[];
		updated: BlockDiff[];
		added: Block[];
	};
}
