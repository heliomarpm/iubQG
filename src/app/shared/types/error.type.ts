export interface ErrorType extends Error {
	name: string;
	message: string;
	stack?: string;
}