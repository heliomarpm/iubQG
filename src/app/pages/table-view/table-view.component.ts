import { CommonModule, JsonPipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';

import { CodeModalComponent, CodeModalType } from '../../shared/components/code-modal';
import { JsonType } from '../../shared/types';
import { TableComponent } from '../../shared/components/table';

@Component({
	selector: 'app-table-view',
	standalone: true,
	imports: [JsonPipe, CommonModule, CodeModalComponent, HttpClientModule, TableComponent],
	templateUrl: './table-view.component.html',
	styleUrl: './table-view.component.scss',
})
export class TableViewComponent {
	@ViewChild(CodeModalComponent) codeModalElement!: CodeModalComponent;
	codeModal: CodeModalType = { title: '', data: '' };

	config: {
		flowName: string;
		flowVersion: number;
		keys: string[];
		activityTypes: { [activityType: string]: number };
		activityCount: number;
	} = { flowName: '', flowVersion: 0, keys: [], activityTypes: {}, activityCount: 0 };

	data: Array<JsonType> = [];
	selectedRow: number | null = null; // Armazena o índice da linha selecionada
	sortProperty = '';
	sortOrder = 1;

	constructor(private http: HttpClient) {}

	loadData() {
		const countTypes = (items: []): { [activityType: string]: number } => {
			return items.reduce(
				(acc, item: { activityType: string }) => {
					acc[item.activityType] = (acc[item.activityType] || 0) + 1;
					return acc;
				},
				{} as { [activityType: string]: number },
			);
		};

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.http.get<any>('/assets/flow.json').subscribe(data => {
			this.data = data.configuracao_atividade;

			this.config = {
				flowName: data.definicao_atividade.flowName,
				flowVersion: data.definicao_atividade.flowVersionNumber,
				activityCount: this.data.length,
				activityTypes: countTypes(this.data as []),
				keys: this.data.length > 0 ? Object.keys(this.data[0]) : [],
			};
		});
	}

	selectRow(index: number): void {
		this.selectedRow = index;
	}

	transfomValue(value: unknown, ellipsis: boolean = false): string {
		const text = (typeof value === 'object' ? JSON.stringify(value || '') : value || '') as string;
		if (ellipsis && text.length > 100) {
			return `${text.substring(0, 97)}...`;
		}
		return text;
	}

	isBigValue(value: unknown): boolean {
		const text = this.transfomValue(value, false);
		return text.length > 100;
	}

	sortBy(property: string) {
		this.sortOrder = property === this.sortProperty ? this.sortOrder * -1 : 1;
		this.sortProperty = property;
		this.data =  [
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			...this.data.sort((a: any, b: any) => {
				let result = 0;
				if (a[property] < b[property]) {
					result = -1;
				}
				if (a[property] > b[property]) {
					result = 1;
				}
				return result * this.sortOrder;
			}),
		];
	}

	sortIcon(property: string) {
		if (property === this.sortProperty) {
			return this.sortOrder === 1 ? '🔺' : '🔻';
		}
		return ' ';
	}

	openModal(title: string, data: unknown) {
		this.codeModal = { title, data };
		this.codeModalElement.openDialog();
	}

	openModalBlocks() {
		this.codeModal = { title: 'Tipos de Blocos', data: this.config.activityTypes };
		this.codeModalElement.openDialog();
	}
}
