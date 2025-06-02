import { NgClass } from "@angular/common";
import { Component, ElementRef, input, output, viewChild } from "@angular/core";

@Component({
	selector: "app-autocomplete",
	standalone: true,
	imports: [NgClass],
	templateUrl: "./autocomplete.component.html",
	styleUrl: "./autocomplete.component.scss",
})
export class AutocompleteComponent {
	// initialValue = input<string>("digite para pesquisar");
	data = input<string[]>([""]);
	placeholder = input<string>("digite para pesquisar");
	valueChanged = output<string>();

	searchWrapper = viewChild.required<ElementRef<HTMLDivElement>>("searchWrapper");
	inputBox = viewChild.required<ElementRef<HTMLInputElement>>("search");
	suggBox = viewChild.required<ElementRef<HTMLDivElement>>("suggBox");
	// icon = viewChild<ElementRef<HTMLDivElement>>("icon");
	// linkTag = viewChild<ElementRef<HTMLAnchorElement>>("linkTag");
	// webLink: string = "";

	suggestions: string[] = [];
	private initialValue: string = "";

	constructor() {}

	get value(): string {
		return this.inputBox()!.nativeElement.value;
	}

	handleFocus(): void {
		this.initialValue = this.value;
	}

	handleKeyUp(event: KeyboardEvent, value: string) {
		if (event.key === "Escape") {
			this.hideSuggestions();
		} else {
			this.searchItem(value);
		}
	}

	// Método para esconder as sugestões
	handleBlur(): void {
		if (this.value !== this.initialValue) {
			this.valueChanged.emit(this.value);
		}
		this.hideSuggestions();
	}

	searchItem(value: string) {
		console.log(value, this.suggestions.length, this.data().length);

		// const searchWrapper = this.searchWrapper()!.nativeElement;
		// const suggBox = this.suggBox()!.nativeElement;

		if (!value) {
			console.log("value is empty", this.data());
			this.suggestions = [];
			// suggBox.style.display = "none";
			// searchWrapper.classList.remove("active"); //hide autocomplete box
			return;
		}

		// const icon = this.icon()!.nativeElement;
		// const linkTag = this.linkTag()!.nativeElement;

		// icon.onclick = () => {
		// 	this.webLink = `https://www.google.com/search?q=${value}`;
		// 	linkTag.setAttribute("href", this.webLink);
		// 	linkTag.click();
		// }

		this.suggestions = structuredClone(this.data()!);

		this.suggestions = this.suggestions.filter((data: string) => {
			return !data ? "" : data.toLocaleLowerCase().includes(value.toLocaleLowerCase());
		});

		if (this.suggestions.length == 0) {
			this.suggestions = [value];
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	select(element: any) {
		const selectData = element.textContent;

		this.inputBox()!.nativeElement.value = selectData || "";

		// const icon = this.icon()!.nativeElement;
		// const linkTag = this.linkTag()!.nativeElement;

		// icon.onclick = () => {
		// 	this.webLink = `https://www.google.com/search?q=${selectData}`;
		// 	linkTag.setAttribute("href", this.webLink);
		// 	linkTag.click();
		// }
		console.log("selectData", selectData);
		this.suggestions = [];
		// this.searchWrapper().nativeElement.classList.remove("active");
	}

	showSuggestions(list: string[]) {
		let listData;

		if (!list.length) {
			const userValue = this.inputBox()!.nativeElement.value;
			listData = `<li>${userValue}</li>`;
		} else {
			listData = list.join("");
		}
		this.suggBox()!.nativeElement.innerHTML = listData;
	}

	private hideSuggestions() {
		this.suggestions = [];
	}
}
