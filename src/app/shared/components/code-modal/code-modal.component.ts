import { JsonPipe } from '@angular/common';
import { Component, ElementRef, OnInit, input, viewChild } from '@angular/core';

@Component({
	selector: 'app-code-modal',
	standalone: true,
	imports: [JsonPipe],
	templateUrl: './code-modal.component.html',
	styleUrl: './code-modal.component.scss',
})
export class CodeModalComponent {
	elDialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');

	title = input<string>('Conteúdo');
	data = input.required<string | unknown>();
	closeFromOutside = input<boolean>(false);

	copySuccess: boolean = false;

	onCloseFromOutside(event: MouseEvent): void {
		if (!this.closeFromOutside()) {
			return;
		}

		const dialog = this.elDialog()!.nativeElement;

		const rect = dialog.getBoundingClientRect();
		if (event.clientY < rect.top || event.clientY > rect.bottom || event.clientX < rect.left || event.clientX > rect.right) {
			dialog.close();
		}
	}

	openDialog() {
		// this.diffDialog.nativeElement.classList.add('open');
		this.elDialog()!.nativeElement.showModal();
	}

	closeDialog() {
		// this.diffDialog.nativeElement.classList.remove('open');

		// setTimeout(() => {
		this.elDialog()!.nativeElement.close();
		// }, 300);
	}

	formatJson(data: unknown): string {
		const jsonString = JSON.stringify(data, null, 2);
		return jsonString
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/("[\w]+")(?=\s*:)/g, '<span class="json-key">$1</span>')
			.replace(/:\s(".*?")/g, ': <span class="json-string">$1</span>')
			.replace(/:\s(\d+\.?\d*)/g, ': <span class="json-number">$1</span>')
			.replace(/:\s(true|false|null)/g, ': <span class="json-boolean">$1</span>');
	}

	copyToClipboard(content: unknown) {
		const copy = JSON.stringify(content, null, 2); // Formata o JSON com indentação

		navigator.clipboard
			.writeText(copy)
			.then(() => {
				this.copySuccess = true;
				setTimeout(() => (this.copySuccess = false), 2000); // Mensagem de sucesso temporária
			})
			.catch(error => {
				console.error('Error copying to clipboard:', error);
			});
	}
}
