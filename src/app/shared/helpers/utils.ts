const utils = {
	extractNumbers: (value: string) => {
		return value.replace(/[^0-9]/g, '');
	},
	gerarCPF(numValido = true) {
		const calcularDigito = (cpf: string | string[]) => {
			let soma = 0;
			let peso = cpf.length + 1;
			for (let i = 0; i < cpf.length; i++) {
				soma += parseInt(cpf[i]) * peso;
				peso--;
			}
			const resto = soma % 11;
			return resto < 2 ? '0' : (11 - resto).toString();
		};
		let cpf = '';
		for (let i = 0; i < 9; i++) {
			cpf += Math.floor(Math.random() * 10).toString();
		}
		const primeiroDigito = calcularDigito(cpf);
		const segundoDigito = calcularDigito(cpf + primeiroDigito);

		if (numValido) {
			cpf = `${cpf}${primeiroDigito}${segundoDigito}`;
		} else {
			cpf = `${cpf}${primeiroDigito}${parseInt(segundoDigito) + 1}`;
		}

		return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
	},

	gerarCNPJ(numValido = true) {
		const calcPrimeiroDigito = (cnpj: string | string[]) => {
			const pesos = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
			let soma = 0;
			for (let i = 0; i < 12; i++) {
				soma += parseInt(cnpj[i]) * pesos[i];
			}
			const resto = soma % 11;
			return resto < 2 ? '0' : (11 - resto).toString();
		};

		const calcSegundoDigito = (cnpj: string | string[]) => {
			const pesos = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
			let soma = 0;
			for (let i = 0; i < 13; i++) {
				soma += parseInt(cnpj[i]) * pesos[i];
			}
			const resto = soma % 11;
			return resto < 2 ? '0' : (11 - resto).toString();
		};

		let cnpj = '';
		for (let i = 0; i < 12; i++) {
			cnpj += Math.floor(Math.random() * 10).toString();
		}
		const primeiroDigito = calcPrimeiroDigito(cnpj);
		const segundoDigito = calcSegundoDigito(cnpj + primeiroDigito);

		if (numValido) {
			cnpj = `${cnpj}${primeiroDigito}${segundoDigito}`;
		} else {
			cnpj = `${cnpj}${primeiroDigito}${parseInt(segundoDigito) + 1}`;
		}

		return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
	},
};

export default utils;
