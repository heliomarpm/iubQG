import { ErrorHandler, Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class GlobalErrorHandlerService implements ErrorHandler {
	handleError(error: unknown): void {
		console.error('An error occurred:', error);
		//throw error (Keep this line uncommented in development  in order to see the error in the console)
	}
}
