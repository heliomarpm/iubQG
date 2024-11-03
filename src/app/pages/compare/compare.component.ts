import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';

import { Comparison } from './compare.model';
import { CodeModalComponent, CodeModalType } from '../../shared/components/code-modal';

@Component({
	selector: 'app-compare',
	standalone: true,
	imports: [HttpClientModule, CodeModalComponent],
	templateUrl: './compare.component.html',
	styleUrl: './compare.component.scss',
})
export class CompareComponent {
	@ViewChild(CodeModalComponent) codeModalElement!: CodeModalComponent;

	// selectedDiff: {activityName: string, diff: DiffType|null} = {activityName: '', diff: null};
	// codeModal: {title: string, data: unknown} = {title: '', data: ''};
	codeModal: CodeModalType = {title: '', data: ''};

	diff: Comparison = {
		flowName: '',
		newVersion: '',
		oldVersion: '',
		blocks: {
			deleted: [],
			recreated: [],
			recreatedUpdated: [],
			updated: [],
			added: [],
		},
	};

	constructor(private http: HttpClient) {}

	onCompare() {
		this.http.get<Comparison>('/assets/diff.json').subscribe(data => {
			this.diff = data;
		});
	}

	openDiffModal(title: string, data: unknown) {
		this.codeModal = {title, data};
		this.codeModalElement.openDialog();
	}

	scriptIUBot() {
		const data = `script iubot`;
		this.openDiffModal("Script IUBot", data);
	}

	jsonResultDiff() {		
		this.openDiffModal("Resultado Comparação", this.diff);
	}
}
