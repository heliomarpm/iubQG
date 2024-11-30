/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';

import { Analyzer } from '../../libs/analyzer';
import { ExternalFlows } from '../../libs/analyzer/models';
import { CodeModalComponent, CodeModalType } from '../../shared/components/code-modal';
import { TableComponent } from '../../shared/components/table';
import { JsonType } from '../../shared/types';

type dataType = {
	name: string;
	title: string;
	data: Array<{ [key: string]: any }>;
	keys: string[];
	statistics?: {
		duration: number;
		types: Map<string, number>;
	};
	externalFlows: ExternalFlows[];
};

@Component({
	selector: 'app-analyze',
	standalone: true,
	imports: [HttpClientModule, CodeModalComponent, TableComponent, CommonModule],
	templateUrl: './analyze.component.html',
	styleUrl: './analyze.component.scss',
})
export class AnalyzeComponent {
	@ViewChild(CodeModalComponent) codeModalElement!: CodeModalComponent;
	codeModal: CodeModalType = { title: '', data: '' };

	datasets: { [key: string]: dataType } = {};
	selectedTab: string | null = null;
	selectedData!: dataType;

	hideColumns = ['message', 'level'];
	filteredType: string | null = null;

	constructor(private http: HttpClient) {}

	loadData(flowName: string, flowVersion: string) {
		flowName = flowName.trim().length > 0 ? flowName.trim() : 'flow';

		this.http.get<JsonType>(`/assets/${flowName}_${flowVersion.trim()}.json`).subscribe(data => {
			const analyzer = new Analyzer(data);
			const report = analyzer.runAnalysis();

			let keys: string[] = [];
			const validations = report.validationReport.validations || [];

			(keys = validations.length > 0 ? Object.keys(validations[0]) : []), (keys = keys.filter(item => !this.hideColumns.includes(item)));

			const dataset: dataType = {
				name: `${report.name}_${report.version}`,
				title: `Jornada: ${report.name} | Versão: ${report.version} | Situação: ${report.situation} | Blocos: ${report.countActivities}`,
				data: validations,
				keys,
				statistics: analyzer.statisticsResult(),
				externalFlows: analyzer.getExtenalFlows(),
			};

			this.addTab(dataset);
		});
	}

	openModal(title: string, data: unknown) {
		this.codeModal = { title, data };
		this.codeModalElement.openDialog();
	}

	getTabs() {
		return Object.keys(this.datasets);
	}

	addTab(data: dataType) {
		if (!this.datasets[data.name]) {
			this.datasets[data.name] = data;
		}
		this.selectTab(data.name);
	}

	selectTab(key: string) {
		this.selectedTab = key;
		this.selectedData = structuredClone(this.datasets[key]);
	}

	closeTab(key: string) {
		delete this.datasets[key];
		if (this.selectedTab === key) {
			const keys = this.getTabs();
			if (keys.length > 0) {
				this.selectTab(keys[0]);
			}
		}
	}

	filterByType(group: string) {
		// Atualiza o grupo filtrado
		this.filteredType = group !== this.filteredType ? group : null;
		this.applyFilter();
	}

	private applyFilter() {
		if (!this.datasets) {
			return;
		}

		if (this.filteredType) {
			const filterType = this.filteredType.split(',')[0].substring(2).trim();
			const clonedData = structuredClone(this.datasets[this.selectedTab!]?.data ?? []);
			this.selectedData.data = clonedData.filter(item => item['type'] === filterType);
		} else {
			this.selectedData.data = structuredClone(this.datasets[this.selectedTab!]?.data);
		}
	}
}
