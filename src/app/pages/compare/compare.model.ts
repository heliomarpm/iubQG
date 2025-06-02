import { BlockContent } from '@app/libs/comparator';

export type DiffType = {
	propertyName: string;
	new: unknown;
	old: unknown;
};

export interface Block {
	activityId: string;
	activityName: string;
	activityType: string;
}

export interface BlockMap extends Block {
	[key: string]: unknown;
}

export interface BlockDiff extends Block {
	diff: DiffType[];
}

export interface Comparison {
	flowName: string;
	newVersion: string;
	oldVersion: string;
	blocks: {
		deleted: BlockContent[];
		recreated: BlockDiff[];
		recreatedUpdated: BlockDiff[];
		updated: BlockDiff[];
		added: BlockContent[];
	};
}
