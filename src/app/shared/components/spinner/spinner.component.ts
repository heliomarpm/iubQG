import { Component } from "@angular/core";

import { LoaderService } from "@app/core/services/loader.service";

@Component({
	selector: "app-spinner",
	standalone: true,
	imports: [],
	templateUrl: "./spinner.component.html",
	styleUrl: "./spinner.component.scss",
})
export class SpinnerComponent {
	constructor(public loaderService: LoaderService) {}
}
