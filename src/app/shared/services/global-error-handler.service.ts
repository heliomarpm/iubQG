import { ToastrService } from 'ngx-toastr';

import { ErrorHandler, Injectable, Injector, NgZone } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class GlobalErrorHandlerService implements ErrorHandler {
	constructor(
		private injector: Injector,
		private ngZone: NgZone,
	) {}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	handleError(error: any): void {
		this.ngZone.run(() => {
			const toastr = this.injector.get(ToastrService);

			console.error('An error occurred:', error);
			toastr.error(error?.message || 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.', 'Erro inesperado!');
			//throw error (Keep this line uncommented in development  in order to see the error in the console)
		});
	}
}
