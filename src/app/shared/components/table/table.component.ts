/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, input } from '@angular/core';

import { StringfyPipe, TextEllipsisPipe } from '@app/core/pipes';

import utils from '../../../libs/shared/utils';

@Component({
	selector: 'app-table',
	standalone: true,
	imports: [CommonModule, TextEllipsisPipe, StringfyPipe],
	templateUrl: './table.component.html',
	styleUrl: './table.component.scss',
})
export class TableComponent implements OnInit {
	@Output() valueSelected = new EventEmitter<{ key: string; value: unknown }>();
	maxLengthForEllipsed = input<number>(0);
	noRenderData = input<boolean>(false);
	hideColumns = input<string[]>([]);
	caption = input<string>();

	selectedRow: number | null = null; // Armazena o índice da linha selecionada
	sortProperty = '';
	sortOrder = 1;

	keys: string[] = [];

	private _data: Array<{ [key: string]: any }> = [];
	get data(): Array<{ [key: string]: any }> {
		return this._data;
	}

	@Input() set data(data: Array<{ [key: string]: any }>) {
		this._data = data || [];
		this.keys = this._data?.[0] ? Object.keys(this._data[0]) : [];
	}

	// eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
	ngOnInit(): void {
		console.log('OnInit~TableComponent');
		//throw new Error('Method not implemented.');
	}

	sortBy(property: string) {
		this.sortOrder = property === this.sortProperty ? this.sortOrder * -1 : 1;
		this.sortProperty = property;

		this.data.sort(utils.sortByProps(`${this.sortOrder === 1 ? '' : '-'}${property}`));

		// this.data = [
		// 	// eslint-disable-next-line @typescript-eslint/no-explicit-any
		// 	...this.data.sort((a: any, b: any) => {
		// 		let result = 0;
		// 		if (a[property] < b[property]) {
		// 			result = -1;
		// 		}
		// 		if (a[property] > b[property]) {
		// 			result = 1;
		// 		}
		// 		return result * this.sortOrder;
		// 	}),
		// ];
	}

	sortIcon(property: string) {
		if (property === this.sortProperty) {
			return this.sortOrder === 1 ? '🔺' : '🔻';
		}
		return ' ';
	}

	selectRow(index: number): void {
		this.selectedRow = index;
	}

	transfomValue(value: unknown, ellipsis: boolean = false): string {
		const maxLength = this.maxLengthForEllipsed();
		const text = (typeof value === 'object' ? JSON.stringify(value || '') : value || '') as string;
		if (ellipsis && maxLength > 3 && text.length > maxLength) {
			return `${text.substring(0, maxLength - 3)}...`;
		}
		return text;
	}

	isValueLimited(value: unknown): boolean {
		console.log('isValueLimited~TableComponent');
		if (this.maxLengthForEllipsed() <= 3) {
			return false;
		}
		const text = this.transfomValue(value);
		return text.length > this.maxLengthForEllipsed();
	}
}
