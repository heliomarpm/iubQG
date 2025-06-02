/* eslint-disable @typescript-eslint/no-explicit-any */
import { ToastrService } from 'ngx-toastr';

import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';

import { FlowService } from '@app/core/services';
import { AutocompleteComponent } from '@app/shared/components';

import { Analyzer } from '../../libs/analyzer';
import { ExternalFlows } from '../../libs/analyzer/models';
import { CodeModalComponent, CodeModalType } from '../../shared/components/code-modal';
import { TableComponent } from '../../shared/components/table';
import { FlowDefinition, JsonType } from '../../shared/types';

type dataType = {
	name: string;
	title: string;
	data: Array<{ [key: string]: any }>;
	keys: string[];
	statistics?: {
		duration: number;
		types: Map<string, { count: number; level: string }>;
	};
	externalFlows: ExternalFlows[];
};

@Component({
	selector: 'app-analyze',
	standalone: true,
	imports: [HttpClientModule, CodeModalComponent, TableComponent, CommonModule, AutocompleteComponent],
	templateUrl: './analyze.component.html',
	styleUrl: './analyze.component.scss',
})
export class AnalyzeComponent implements OnInit {
	@ViewChild(CodeModalComponent) codeModalElement!: CodeModalComponent;
	codeModal: CodeModalType = { title: '', data: '' };

	datasets: { [key: string]: dataType } = {};
	selectedTab: string | null = null;
	selectedData!: dataType;

	hideColumns = ['message', 'level'];
	filteredGroup: { group: string; type: string; level: string } | null = null;

	flowsData: FlowDefinition[] = [];
	searchData: string[] = [];

	constructor(
		protected http: HttpClient,
		private flowService: FlowService,
		private toastr: ToastrService
	) {}

	async ngOnInit() {
		this.flowsData = await this.flowService.loadFlows();
		this.searchData = this.flowsData.map((flow) => flow.flowName);
	}

	analyze(flowName: string, flowVersion: string) {
		// const flow = this.flowsData.find(flow => flow.flowName === flowName);

		// if (!flow) {
		// 	this.toastr.error('Flow not found');
		// 	return;
		// }

		// if (Number(flowVersion) === 0) {
		// 	flowVersion = flow.versions.hom.publish.toString() || '0';
		// }

		// flowName = flowName.trim().length > 0 ? flowName.trim() : 'flow';

		this.http.get<JsonType>(`/assets/${flowName}_${flowVersion.trim()}.json`).subscribe((data) => {
			// this.flowService.extractFlow<JsonType>(flow.flowId, Number(flowVersion)).subscribe(data => {
			const analyzer = new Analyzer(data);
			const report = analyzer.runAnalysis();

			let keys: string[] = [];
			const validations = report.validationReport.validations || [];

			(keys = validations.length > 0 ? Object.keys(validations[0]) : []), (keys = keys.filter((item) => !this.hideColumns.includes(item)));

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

	filterByType(item: [string, { count: number; level: string }]) {
		// Atualiza o grupo filtrado
		console.log('item', item);

		const group = item[0];
		const type = group.split(',')[0].substring(2).trim();
		const level = item[1].level;

		this.filteredGroup = group !== this.filteredGroup?.group ? { group, type, level } : null;
		this.applyFilter();
	}

	private applyFilter() {
		if (!this.datasets) {
			return;
		}

		if (this.filteredGroup) {
			const { type, level } = this.filteredGroup;
			const clonedData = structuredClone(this.datasets[this.selectedTab!]?.data ?? []);
			this.selectedData.data = clonedData.filter((item) => item['type'] === type && item['level'] === level);
		} else {
			this.selectedData.data = structuredClone(this.datasets[this.selectedTab!]?.data);
		}
	}
}
