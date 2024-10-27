import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';

import { CodeModalComponent } from '../../shared/components/code-modal/code-modal.component';
import { BlockDiff, Comparison, DiffType } from './compare.model';

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
}
