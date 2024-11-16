import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';

import { CodeModalComponent, CodeModalType } from '../../shared/components/code-modal';
import { JsonType } from '../../shared/types';
import { TableComponent } from '../../shared/components/table';
import { FlowService } from '@app/core/services/flow.service';

@Component({
	selector: 'app-table-view',
	standalone: true,
	imports: [CommonModule, CodeModalComponent, TableComponent],
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

	constructor(private flowService: FlowService) {}

	loadData(flowName: string, flowVersion: string) {
		const countTypes = (items: []): { [activityType: string]: number } => {
			return items.reduce(
				(acc, item: { activityType: string }) => {
					acc[item.activityType] = (acc[item.activityType] || 0) + 1;
					return acc;
				},
				{} as { [activityType: string]: number },
			);
		};

		this.flowService.get<JsonType>(flowName, Number(flowVersion)).subscribe(data => {
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

	openModal(title: string, data: unknown) {
		this.codeModal = { title, data };
		this.codeModalElement.openDialog();
	}

	openModalBlocks() {
		this.codeModal = { title: 'Tipos de Blocos', data: this.config.activityTypes };
		this.codeModalElement.openDialog();
	}
}
