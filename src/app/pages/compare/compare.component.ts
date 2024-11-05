import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';

import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';

import Comparator from '../../libs/comparator/comparator';
import { CodeModalComponent, CodeModalType } from '../../shared/components/code-modal';
import { ErrorType } from '../../shared/types';
import { Comparison } from './compare.model';

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
	codeModal: CodeModalType = { title: '', data: '' };

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

	constructor(
		private http: HttpClient,
		private toastr: ToastrService,
	) {}

	onCompare() {
		const oldFlow$ = this.http.get('/assets/quitacao.json');
		const newFlow$ = this.http.get('/assets/2via_372.json');

		forkJoin([oldFlow$, newFlow$]).subscribe({
			next: ([oldData, newData]) => {
				try {
					const compare = new Comparator(oldData, newData);
					this.diff = compare.runComparison();
				} catch (err) {					
					if (err instanceof Error) {
						this.toastr.error(err.message, 'Comparar versões');
					} else {
						this.toastr.error('Erro ao comparar versões', 'Comparar versões');
					}
				}
			},
			error: error => console.error('An error occurred:', error),
		});

		// this.http.get<Comparison>('/assets/diff.json').subscribe(data => {
		// 	this.diff = data;
		// });
	}

	openDiffModal(title: string, data: unknown) {
		this.codeModal = { title, data };
		this.codeModalElement.openDialog();
	}

	scriptIUBot() {
		const data = `script iubot`;
		this.openDiffModal('Script IUBot', data);
	}

	jsonResultDiff() {
		this.openDiffModal('Resultado Comparação', this.diff);
	}
}
