import add from './utils/add'
import { minus } from './utils/minus'
const { complexCalc } = require('./lib/complex')

const sum = add(1, 2);
const division = minus(2, 1);

console.log(sum);
console.log(division);
console.log('2的3次方', complexCalc(2, 3));