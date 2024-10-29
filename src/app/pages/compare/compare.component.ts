import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';

import { CodeModalComponent } from '../../shared/components/code-modal/code-modal.component';
import { Comparison, DiffType } from './compare.model';

@Component({
	selector: 'app-compare',
	standalone: true,
	imports: [HttpClientModule, CodeModalComponent],
	templateUrl: './compare.component.html',
	styleUrl: './compare.component.scss',
})
export class CompareComponent {
	@ViewChild(CodeModalComponent) diffModal!: CodeModalComponent;

	diffProp!: DiffType;
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

	openDiffModal(diff: DiffType) {
		// console.log(diff);
		this.diffProp = diff;
		this.diffModal.openDialog();
	}

	copyJSIUBot() {
		const tempTextarea = document.createElement('textarea');
		navigator.clipboard.writeText(tempTextarea.value)
			.then(() => {
				// this.copySuccess = true;
				// setTimeout(() => (this.copySuccess = false), 2000); // Mensagem de sucesso temporária
			})
			.catch((error) => {
				console.error('Error copying to clipboard:', error);
			});
	}

	private copyToClipboard(content: string) {
		navigator.clipboard.writeText(content)
			.then(() => {
				// this.copySuccess = true;
				// setTimeout(() => (this.copySuccess = false), 2000); // Mensagem de sucesso temporária
			})
			.catch((error) => {
				console.error('Error copying to clipboard:', error);
			});		
	}
}
