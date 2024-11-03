import { JsonPipe } from '@angular/common';
import { Component, ElementRef, input, viewChild } from '@angular/core';

@Component({
	selector: 'app-code-modal',
	standalone: true,
	imports: [JsonPipe],
	templateUrl: './code-modal.component.html',
	styleUrl: './code-modal.component.scss',
})
export class CodeModalComponent {
	dialogElement = viewChild<ElementRef<HTMLDialogElement>>('dialog');

	title = input<string>('Conteúdo');
	data = input.required<string | unknown>();
	closeFromOutside = input<boolean>(true);

	copySuccess: boolean = false;

	onCloseFromOutside(event: MouseEvent): void {
		if (!this.closeFromOutside()) {
			return;
		}

		const dialog = this.dialogElement()!.nativeElement;

		const rect = dialog.getBoundingClientRect();
		if (event.clientY < rect.top || event.clientY > rect.bottom || event.clientX < rect.left || event.clientX > rect.right) {
			dialog.close();
		}
	}

	openDialog() {
		// this.diffDialog.nativeElement.classList.add('open');
		this.dialogElement()!.nativeElement.showModal();
	}

	closeDialog() {
		// this.diffDialog.nativeElement.classList.remove('open');

		// setTimeout(() => {
		this.dialogElement()!.nativeElement.close();
		// }, 300);
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
