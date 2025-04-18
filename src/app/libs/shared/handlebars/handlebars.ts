import Handlebars from "handlebars";

// Função auxiliar para converter valores em números
const toNumber = (value: unknown): number => {
	if (typeof value === "number") return value;
	if (typeof value === "string" && !isNaN(parseFloat(value))) return parseFloat(value);
	throw new Error(`O valor '${value}' não pode ser convertido para número.`);
};

// Função auxiliar para formatar datas sem Moment.js
const formatDate = (date: string | Date, format: string): string => {
	const d = new Date(date);
	return format
		.replace("yyyy", d.getFullYear().toString())
		.replace("MM", (d.getMonth() + 1).toString().padStart(2, "0"))
		.replace("dd", d.getDate().toString().padStart(2, "0"))
		.replace("HH", d.getHours().toString().padStart(2, "0"))
		.replace("mm", d.getMinutes().toString().padStart(2, "0"))
		.replace("ss", d.getSeconds().toString().padStart(2, "0"));
};

function isFunction(value: unknown) {
	return typeof value === "function";
}

export function normalizeTemplate(template: string): string {
	return template
		.replace(/[\u200B\u00A0\u2002\u2003\u2009\u202F\s]+/g, " ") // Normaliza espaços invisíveis
		.replace(/({{2,3})\s*#\s*(\w+)/g, "$1#$2") // Remove espaços entre # das chaves de abertura "{{ # "
		.replace(/({{2,3})\s*\/\s*(\w+)\s*/g, "$1/$2") // Remove espaços entre / das chaves de abertura "{{ / "
		.replace(/{{\s*/g, "{{") // Remove espaços antes chaves de abertura "{{"
		.replace(/\s*}}/g, "}}") // Remove espaços antes chaves de encerramento "}}"
		.replace(/\{\{\{/g, "{{") // Normaliza {{{ para {{
		.replace(/\}\}\}/g, "}}") // Normaliza }}} para }}
		.replace(/\\"/g, "'");
}

// export function validateTemplateStacks2(template: string): void {
// 	const stack: string[] = [];
// 	const regex = /{{\s*#(\w+)[^}]*}}|{{\s*\/(\w+)\s*}}/g;

// 	let match: RegExpExecArray | null;
// 	while ((match = regex.exec(template))) {
// 		const open = match[1];
// 		const close = match[2];

// 		if (open) {
// 			stack.push(open);
// 		} else if (close) {
// 			const last = stack.pop();
// 			if (last !== close) {
// 				throw new Error(`Bloco de fechamento inválido: esperado {{/${last}}}, mas encontrou {{/${close}}}`);
// 			}
// 		}
// 	}

// 	if (stack.length > 0) {
// 		throw new Error(`Template incompleto: faltando fechamento para {{#${stack.pop()}}}`);
// 	}
// }

// export function validateTemplateStacks2(template: string): void {
// 	// const regex = /({{{|{{)\s*#\s*(\w+)[^}]*?(}}}|}})|({{{|{{)\s*\/\s*(\w+)\s*(}}}|}})/g;
// 	const regex = /({{{|{{)\s*(#|\/)\s*(\w+)[^}]*?(}}}|}})/g;

// 	const stack: { block: string; openLen: number; match: string }[] = [];

// 	// Utilitário para determinar o comprimento real de fechamento
// 	const openEndLength = (close: string): number => {
// 		return close === "}}}" ? 3 : 2;
// 	};

// 	let match: RegExpExecArray | null;

// 	while ((match = regex.exec(template))) {
// 		const [
// 			fullMatch,
// 			openStart, // "{{" ou "{{{"
// 			openName, // Nome do bloco (ex: if, each)
// 			openEnd, // "}}" ou "}}}"
// 			closeStart, // "{{" ou "{{{"
// 			closeName, // Nome do fechamento
// 			closeEnd, // "}}" ou "}}}"
// 		] = match;

// 		if (openName) {
// 			// Bloco de abertura
// 			stack.push({
// 				block: openName,
// 				openLen: openStart.length,
// 				match: fullMatch,
// 			});
// 		} else if (closeName) {
// 			// Bloco de fechamento
// 			const last = stack.pop();
// 			if (!last) {
// 				throw new Error(`Fechamento inesperado: ${fullMatch}`);
// 			}
// 			if (last.block !== closeName) {
// 				throw new Error(`Fechamento inválido: esperava {{/${last.block}}}, recebeu ${fullMatch}`);
// 			}
// 			if (last.openLen !== closeStart.length || openEndLength(closeEnd) !== last.openLen) {
// 				throw new Error(`Nível de chaves incompatível entre ${last.match} e ${fullMatch}`);
// 			}
// 		}
// 	}

// 	if (stack.length > 0) {
// 		const unclosed = stack.pop();
// 		throw new Error(`Bloco {{#${unclosed?.block}}} não foi fechado corretamente`);
// 	}

// 	// Verifica se existem chaves desequilibradas (ex: {{campo}}})
// 	const rawChaveRegex = /{{{?[^{}]*}}}?}?/g;
// 	let rawMatch: RegExpExecArray | null;
// 	while ((rawMatch = rawChaveRegex.exec(template))) {
// 		const raw = rawMatch[0];
// 		const openCount = (raw.match(/{{/g) || []).length;
// 		const closeCount = (raw.match(/}}/g) || []).length;
// 		if (openCount !== closeCount) {
// 			throw new Error(`Expressão malformada: ${raw}`);
// 		}
// 	}
// }

export function validateTemplateBlocks(template: string): void {
	//const regex = /({{{|{{)\s*(#|\/)\s*(\w+)[^}]*?(}}}|}})/g;
	// const regex = /({{{?|{{)\s*(#|\/)?\s*([\w.[\]]+)\s*[^{}]*?(}}}?}?)/g;
	const regex = /({{{?)\s*(#|\/)?\s*([\w.[\]]+)\s*[^{}]*?(}}}?}?)/g;
	const stack: { block: string; openLen: number; match: string }[] = [];

	let match: RegExpExecArray | null;

	while ((match = regex.exec(template))) {
		const [fullMatch, openStart, type, blockName, closeEnd] = match;

		if (openStart.length !== closeEnd.length) {
			throw new Error(`Expressão malformada: ${fullMatch}`);
		}

		if (type === "#") {
			// Abertura
			stack.push({
				block: blockName,
				openLen: openStart.length,
				match: fullMatch,
			});
		} else if (type === "/") {
			// Fechamento
			const last = stack.pop();
			if (!last) {
				throw new Error(`Fechamento inesperado: ${fullMatch}`);
			}
			if (last.block !== blockName) {
				throw new Error(`Fechamento inválido: esperava {{/${last.block}}}, recebeu ${fullMatch}`);
			}
			if (last.openLen !== openStart.length || closeEnd.length !== last.openLen) {
				throw new Error(`Nível de chaves incompatível entre ${last.match} e ${fullMatch}`);
			}
		}
	}

	if (stack.length > 0) {
		const unclosed = stack.pop();
		throw new Error(`Bloco {{#${unclosed?.block}}} não foi fechado`);
	}
}

// Helpers genéricos
const helpers: Record<string, Handlebars.HelperDelegate> = {
	eq: (a, b) => a === b,
	gt: (a, b) => a > b,
	lt: (a, b) => a < b,
	lte: (a, b) => a <= b,
	gte: (a, b) => a >= b,
	isFalsey: (val) => !val,
	isTruthy: (val) => !!val,
	neither: (a, b) => !a && !b,
	ifCond: (conditional, options) => {
		// if (isFunction(conditional)) {
		//   conditional = conditional.call(this);
		// }
		return conditional ? options.fn(this) : options.inverse(this);
	},
	ifEven: (num) => toNumber(num) % 2 === 0,
	ifOdd: (num) => toNumber(num) % 2 !== 0,
	ifNth: (val, n) => toNumber(val) % toNumber(n) === 0,
	isnt: (a, b) => a !== b,
	not: (val) => !val,
	contains: (arr, val) => (Array.isArray(arr) ? arr.includes(val) : false),
	and: (...args) => args.slice(0, -1).every(Boolean),
	or: (...args) => args.slice(0, -1).some(Boolean),
	formatDate: (date, format) => formatDate(date, format),
	dateTimeNow: (format = "yyyy-MM-dd HH:mm:ss") => formatDate(new Date(), format),
	trim: (str) => {
		if (isFunction(str)) {
			str = str.call(this);
		}
		if (typeof str !== "string") return str || "";
		else return str.trim();
	},
	trimStart: (str) => {
		if (isFunction(str)) {
			str = str.call(this);
		}
		if (typeof str !== "string") return str || "";
		else return str.trimStart();
	},
	trimEnd: (str) => {
		if (isFunction(str)) {
			str = str.call(this);
		}
		if (typeof str !== "string") return str || "";
		else return str.trimEnd();
	},
	replace: (str, search, replacement) => str.replace(new RegExp(search, "g"), replacement),
	substring: (str, start, end) => str.substring(start, end),
	lastCharacters: (str, n) => str.slice(-toNumber(n)),
	append: (input, str) => `${input}${str}`,
	prepend: (input, str) => `${str}${input}`,
	remove: (input, str) => input.split(str).join(""),
	lower: (str) => {
		if (isFunction(str)) {
			str = str.call(this);
		}
		if (typeof str !== "string") return str || "";
		else return str.toLowerCase();
	},
	upper: (str) => {
		if (isFunction(str)) {
			str = str.call(this);
		}
		if (typeof str !== "string") return str || "";
		else return str.toUpperCase();
	},
	capitalize: (str) => {
		if (isFunction(str)) {
			str = str.call(this);
		}
		if (typeof str !== "string") return str || "";
		else return str?.charAt(0).toUpperCase() + str?.slice(1).toLowerCase();
	},
	capitalizeAll: (input) => input.replace(/\b\w/g, (char: string) => char.toUpperCase()),
	dashcase: (input) => input.replace(/[ _]/g, "-"),
	toNumber: (input) => toNumber(input),
	formatNumber: (locale, value, options) => "1.234,56",
	repeatChar: (char, count) => char.repeat(toNumber(count)),
	length: (input) => input.length,
	isDefined: (...args) => args.slice(0, -1).every((arg) => arg !== undefined),
	maskIt: (input, start, end, mask) => {
		return input.slice(0, start) + mask.repeat(end - start) + input.slice(end);
	},
	newGuid: () => "00000000-0000-0000-0000-000000000000",
	getEnvironment: () => {
		return "dev";
	},
	add: (a, b) => toNumber(a) + toNumber(b),
	subtract: (a, b) => toNumber(a) - toNumber(b),
	multiply: (a, b) => toNumber(a) * toNumber(b),
	divide: (a, b) => {
		const divisor = toNumber(b);
		if (divisor === 0) throw new Error("Divisão por zero não é permitida.");
		return toNumber(a) / divisor;
	},
	valueIsNotEmpty: (value) => {
		if (value === undefined || value === null || value === "") {
			throw new Error("HandlebarsException: O valor passado está vazio ou não existe.");
		}
		return value;
	},
};

// Registrar os helpers no Handlebars
Object.entries(helpers).forEach(([name, fn]) => Handlebars.registerHelper(name, fn));

export default Handlebars;
