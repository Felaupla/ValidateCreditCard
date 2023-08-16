const banks = require("./bankCodes")
/**
 * Validates Argentine bank account numbers using the CBU format.
 * Based on Toba, from https://repositorio.siu.edu.ar/
 */
 function isValid(cbu) {
  if (!/[0-9]{22}/.test(cbu)) return false;

  const arr = cbu.split('').map(Number);
  if (arr[7] !== getDigitoVerificador(arr, 0, 6)) return false;
  if (arr[21] !== getDigitoVerificador(arr, 8, 20)) return false;

  return true;
}

function getDigitoVerificador(numero, pos_inicial, pos_final) {
  const ponderador = [3, 1, 7, 9];
  let suma = 0;
  let j = 0;
  for (let i = pos_final; i >= pos_inicial; i--) {
    suma = suma + numero[i] * ponderador[j % 4];
    j++;
  }
  return (10 - suma % 10) % 10;
}

function getBankId(cbu) {
  return cbu.substring(0, 3);
}

function getBankName(cbu_or_id, banks) {
  const id = getBankId(cbu_or_id);
  if (!banks[id]) return 'Inexistent Bank Id';
  return banks[id];
}

module.exports = {
  isValid,
  getDigitoVerificador,
  getBankId,
  getBankName,
};