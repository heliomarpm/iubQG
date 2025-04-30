import { Component, ElementRef, effect, input, output, viewChild } from "@angular/core";

@Component({
	selector: "app-check-list",
	standalone: true,
	imports: [],
	templateUrl: "./check-list.component.html",
	styleUrl: "./check-list.component.scss",
})
export class CheckListComponent {
	dialogElement = viewChild<ElementRef<HTMLDialogElement>>("dialog");

	title = input<string>("Lista de verificação");
	items = input.required<string[]>();
	uncheckedItems = input<string[]>();
	closeFromOutside = input<boolean>(true);
	applyChanges = output<string[]>();
	cancelChanges = output<void>();

	checkedItems: { label: string; selected: boolean }[] = [];

	constructor() {
		effect(() => {
			this.checkedItems = this.items().map((item: string) => ({
				label: item,
				selected: this.uncheckedItems()?.includes(item) || true,
			}));

			this.uncheckedItems()?.forEach((item: string) => {
				// this.checkedItems.find((i) => i.label === item)?.selected = false;
				this.checkedItems.forEach((i) => {
					if (i.label === item) {
						i.selected = false;
					}
				});
			});
		});
	}

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
		this.dialogElement()!.nativeElement.showModal();
	}

	closeDialog() {
		this.dialogElement()!.nativeElement.close();
	}

	toggleAll(event: Event) {
		const checked = (event.target as HTMLInputElement).checked;
		this.checkedItems.forEach((item) => (item.selected = checked));
	}

	toggleItem(event: Event, item: { label: string; selected: boolean }) {
		item.selected = (event.target as HTMLInputElement).checked;
	}

	applySelection() {
		this.applyChanges.emit(this.checkedItems.filter((i) => i.selected).map((i) => i.label));
		this.closeDialog();
	}

	cancelSelection() {
		this.cancelChanges.emit();
		this.closeDialog();
	}
}
