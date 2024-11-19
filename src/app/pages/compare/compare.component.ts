import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';

import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, signal, ViewChild } from '@angular/core';

import Comparator from '../../libs/comparator/comparator';
import { CodeModalComponent, CodeModalType } from '../../shared/components/code-modal';
import { Block, Comparison } from './compare.model';
import { FlowService } from '@app/core/services/flow.service';
import { JsonType } from '@app/shared/types';

@Component({
	selector: 'app-compare',
	standalone: true,
	imports: [HttpClientModule, CodeModalComponent],
	templateUrl: './compare.component.html',
	styleUrl: './compare.component.scss',
})
export class CompareComponent {
	@ViewChild(CodeModalComponent) codeModalElement!: CodeModalComponent;

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

	icons = {
		flow: 'flowsheet',
		check: 'check',
		error: 'error',
	};

	icoFlow = signal<string>("flowsheet");

	constructor(
		protected http: HttpClient,
		private flowService: FlowService,
		private toastr: ToastrService
	) {}

	onCompare(flowName: string, oldVersion: string, newVersion: string) {
		const nOldVersion = Math.min(Number(oldVersion), Number(newVersion));
		const nNewVersion = Math.max(Number(oldVersion), Number(newVersion));

		const oldFlow$ = this.flowService.get<JsonType>(flowName, nOldVersion);
		const newFlow$ = this.flowService.get<JsonType>(flowName, nNewVersion);

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
			// error: error => this.toastr.error(error.message, 'An error occurred:'),
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
		const blocks = (blocks: Array<Block>) => {
			return JSON.stringify(blocks.map(item => item.activityName));
		};

		this.http.get('/assets/diff-change-color.js', { responseType: 'text' }).subscribe(template => {
			const script = template
				.replace('{{flowName}}', this.diff.flowName)
				.replace('{{oldVersion}}', this.diff.oldVersion)
				.replace('{{newVersion}}', this.diff.newVersion)
				.replace('{{deletedBlocks}}', blocks(this.diff.blocks.deleted))
				.replace('{{recreatedBlocks}}', blocks(this.diff.blocks.recreated))
				.replace('{{recreatedUpdatedBlocks}}', blocks(this.diff.blocks.recreatedUpdated))
				.replace('{{updatedBlocks}}', blocks(this.diff.blocks.updated))
				.replace('{{addedBlocks}}', blocks(this.diff.blocks.added));

			navigator.clipboard
				.writeText(script)
				.then(() => {
					this.icoFlow.set(this.icons.check);
					this.toastr.success('Abra o IUBot e cole o script no console', 'Código copiado');
				})
				.catch(error => {
					console.error('Error copying to clipboard:', error);
					this.icoFlow.set(this.icons.error);
					this.toastr.error('Erro ao copiar para área de transferência', 'Error ao copiar');
				})
				.finally(() => setTimeout(() => (this.icoFlow.set(this.icons.flow)), 2000));

			// this.openDiffModal('Script IUBot', script);
		});
	}

	jsonResultDiff() {
		this.openDiffModal('Resultado Comparação', this.diff);
	}
}
