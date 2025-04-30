import { throwError } from "rxjs";

import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
	providedIn: "root",
})
export class HttpErrorHandlerService {
	handleError(error: HttpErrorResponse) {
		// let errorMessage: string;

		// if (error.error instanceof ErrorEvent) {
		// 	errorMessage = `Erro: ${error.error.message}`;
		// } else {
		// 	errorMessage = `Erro do servidor: ${error.status}\nMensagem: ${error.message}`;
		// }

		console.error("HttpErrorHandlerService~handleError:", error);
		return throwError(() => error);
	}

	// handleError(error: HttpErrorResponse) {
	// 	return this.ngZone.run(() => {
	// 		const toastr = this.injector.get(ToastrService);

	// 		let errorMessage: string;

	// 		if (error.error instanceof ErrorEvent) {
	// 			errorMessage = `Erro: ${error.error.message}`;
	// 		} else {
	// 			errorMessage = `Erro do servidor: ${error.status}\nMensagem: ${error.message}`;
	// 		}
	// 		toastr.error(errorMessage, 'Erro inesperado!');

	// 		console.error(error);
	// 		return throwError(() => error);
	// 	});
	// }
}
