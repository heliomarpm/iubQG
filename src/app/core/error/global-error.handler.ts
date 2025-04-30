import { ToastrService } from "ngx-toastr";

import { HttpErrorResponse } from "@angular/common/http";
import { ErrorHandler, Injectable, Injector, NgZone } from "@angular/core";

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
	constructor(
		private injector: Injector,
		private ngZone: NgZone
	) {}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	handleError(error: any): void {
		if (!error) return;

		this.ngZone.run(() => {
			const toastr = this.injector.get(ToastrService);

			if (error instanceof HttpErrorResponse) {
				toastr.error(error.message, `Erro HTTP ${error.status}`);
			} else {
				toastr.error(error?.message ?? error ?? "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.", "Erro inesperado!");
			}

			// console.error('Global Error Intercepted:', error);
			// toastr.error(error?.message || 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.', 'Erro inesperado!');
		});
	}
}
