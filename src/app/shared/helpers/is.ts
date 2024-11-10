const Is = {
  cpf(value: string): boolean {
    // Verifica se o CPF contém apenas números, pontos ou traços
    //if (!/^[\d.-]+$/.test(value)) return false;
    if (!/^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value)) return false;

    const cpf = value.replace(/\D/g, "");

    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    const digito = (base: number): number => {
      const sum = cpf
        .slice(0, base)
        .split("")
        .reduce((acc, value, index) => acc + parseInt(value) * (base + 1 - index), 0);
      return ((sum * 10) % 11) % 10;
    };

    return digito(9) === parseInt(cpf[9]) && digito(10) === parseInt(cpf[10]);
  },
  cnpj(value: string): boolean {
    // if (!/^[\d.-]+$/.test(value)) return false;
    if (!/^\d{14}$|^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(value))
      return false;

    const cnpj = value.replace(/\D/g, "");

    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;

    const digito = (base: number): number => {
      const pesos =
        base === 12
          ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
          : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

      const sum = cnpj
        .slice(0, base)
        .split("")
        .reduce((acc, value, index) => acc + parseInt(value) * pesos[index], 0);
      return sum % 11 < 2 ? 0 : 11 - (sum % 11);
    };

    return (
      digito(12) === parseInt(cnpj[12]) && digito(13) === parseInt(cnpj[13])
    );
  },
};

export default Is;
