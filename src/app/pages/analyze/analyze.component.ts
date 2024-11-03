/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, ElementRef, ViewChild, viewChild } from '@angular/core';

import { Analyzer } from '../../libs/analyzer';
import { FlowReport } from '../../libs/analyzer/models';
import { CodeModalComponent, CodeModalType } from '../../shared/components/code-modal';
import { TableComponent } from '../../shared/components/table';
import { JsonType } from '../../shared/types';

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

	outputElement = viewChild<ElementRef<HTMLPreElement>>('output');
	report?: FlowReport;

	data: {
		title: string;
		data: Array<{ [key: string]: any }>;
	} = { title: '', data: [] };
	keys: string[] = [];
	statistics?: {
		duration: number;
		types: Map<string, number>;
	};

	ignoreColumns = ['message', 'level'];

	constructor(private http: HttpClient) {}

	loadData() {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.http.get<JsonType>('/assets/flow.json').subscribe(data => {
			const analyzer = new Analyzer(data);
			this.report = analyzer.runAnalysis();
			this.statistics = analyzer.statisticsResult();

			console.log(this.statistics);

			this.data = {
				title: `Jornada: ${this.report.name} | Versão: ${this.report.version} | Situação: ${this.report.situation} | Blocos: ${this.report.countActivities}`,
				data: this.report.validationReport.validations || [],
			};

			(this.keys = this.data.data.length > 0 ? Object.keys(this.data.data[0]) : []),
				// this.keys.splice(this.keys.indexOf('message'), 1);
				(this.keys = this.keys.filter(item => !this.ignoreColumns.includes(item)));

			// this.printReport(this.report);
		});
	}

	openModal(title: string, data: unknown) {
		this.codeModal = { title, data };
		this.codeModalElement.openDialog();
	}
}
