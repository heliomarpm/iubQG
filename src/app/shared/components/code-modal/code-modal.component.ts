import { JsonPipe } from '@angular/common';
import { Component, ElementRef, ViewChild, input } from '@angular/core';

@Component({
	selector: 'app-code-modal',
	standalone: true,
	imports: [JsonPipe],
	templateUrl: './code-modal.component.html',
	styleUrl: './code-modal.component.scss',
})
export class CodeModalComponent {
	@ViewChild('dialog') diffDialog!: ElementRef<HTMLDialogElement>;

	title = input<string>();
	jsonData = input.required<unknown>();

	copySuccess: boolean = false;

	openDialog() {
		this.diffDialog.nativeElement.showModal();
	}

	closeDialog() {
		this.diffDialog.nativeElement.close();
	}

	formatJson(data: unknown): string {
    const jsonString = JSON.stringify(data, null, 2);
    return jsonString.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/("[\w]+")(?=\s*:)/g, '<span class="json-key">$1</span>')
      .replace(/:\s(".*?")/g, ': <span class="json-string">$1</span>')
      .replace(/:\s(\d+\.?\d*)/g, ': <span class="json-number">$1</span>')
      .replace(/:\s(true|false|null)/g, ': <span class="json-boolean">$1</span>');
  }

	copyToClipboard(content: unknown) {
		const copy = JSON.stringify(content, null, 2); // Formata o JSON com indentação

		navigator.clipboard.writeText(copy)
			.then(() => {
				this.copySuccess = true;
				setTimeout(() => (this.copySuccess = false), 2000); // Mensagem de sucesso temporária
			})
			.catch((error) => {
				console.error('Error copying to clipboard:', error);
			});
	}
}
