import { NgClass } from '@angular/common';
import { Component, ElementRef, input, viewChild } from '@angular/core';

@Component({
	selector: 'app-autocomplete',
	standalone: true,
	imports: [NgClass],
	templateUrl: './autocomplete.component.html',
	styleUrl: './autocomplete.component.scss'
})
export class AutocompleteComponent {
	data = input<string[]>(['']);
	placeholder = input<string>('digite para pesquisar');

	searchWrapper = viewChild.required<ElementRef<HTMLDivElement>>("searchWrapper");
	inputBox = viewChild.required<ElementRef<HTMLInputElement>>("search");
	suggBox = viewChild.required<ElementRef<HTMLDivElement>>("suggBox");
	// icon = viewChild<ElementRef<HTMLDivElement>>("icon");
	// linkTag = viewChild<ElementRef<HTMLAnchorElement>>("linkTag");
	// webLink: string = "";

	suggestions: string[] = [];

	constructor() { }

	get value(): string {
		return this.inputBox()!.nativeElement.value;
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


		// emptyData = emptyData.map((item: string) => {
		// 	item = `<li>${item}</li>`;
		// 	return item;
		// });

		// searchWrapper.classList.add("active"); //show autocomplete box
//show autocomplete box
		// this.showSuggestions(emptyData);
		// const allList = suggBox.querySelectorAll("li");
		// for (let i = 0; i < allList.length; i++) {
		// 	allList[i].setAttribute("onclick", "select(this)");
		// }
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
			listData = list.join('');
		}
		this.suggBox()!.nativeElement.innerHTML = listData;
	}


}
