import { DiffType } from './types';

interface Block {
	activityId: string;
	activityName: string;
	activityType: string;
}

export interface BlockMap extends Block {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: any;
}

export interface BlockContent extends Block {
	content: unknown;
}
export interface BlockDiff extends Block {
	diff: DiffType[];
}

export interface Comparison {
	flowName: string;
	oldVersion: string;
	newVersion: string;
	blocks: {
		deleted: BlockContent[];
		recreated: BlockDiff[];
		recreatedUpdated: BlockDiff[];
		updated: BlockDiff[];
		added: BlockContent[];
	};
}
