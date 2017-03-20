// @flow
import moment from 'moment';

/**
 *  Vypočítá délku období od data načerpání do data splátky/platby v rocích.
 *  Měsíc se počítá jako 1/12 roku, zbylé dny se počítají jako 1/365(366) roku.
 *  @param utilizationDate datum načerpání půjčky
 *  @param instalmentDate datum splátky/platby
 *  @return délka období v rocích
*/
const getYearsFromUtilization = (utilizationDate: Date, instalmentDate: Date): number => {
  const months: number = moment(instalmentDate).diff(utilizationDate, 'months');
  const dateBeforeMonths: Date = moment(instalmentDate).subtract(months, 'months');
  const days: number = Math.abs(moment(utilizationDate).diff(dateBeforeMonths, 'days'));
  const daysPerYear: number = moment(dateBeforeMonths).diff(moment(dateBeforeMonths).subtract(12, 'months'), 'days');
  return (months / 12.0) + ((1.0 * days) / daysPerYear);
};

const round = (number: number, digits: number): number => {
  const k = 10 ** digits; // ** is an exponentiation. Equivalent to Math.pow(10, digits)
  return Math.round(number * k) / k;
};

const diff = (instalments: Array<Object>, rate: number): number => {
  let utilizations: number = 0;
  let instalmentsCost: number = 0;
  let temporary: bool = true;
  let utilDate: ?Date = null;

  instalments.forEach(({ date, utilization, instalment, charge, extraInstalment, extraCharge }) => {
    if (utilDate == null && utilization !== 0) {
      utilDate = date;
      temporary = false;
    }

    if (utilDate == null) utilDate = date;
    const divider: number = (1 + rate) ** getYearsFromUtilization(utilDate, date); // ** is an exponent.

    utilizations += utilization / divider;
    instalmentsCost += (instalment + charge + extraInstalment + extraCharge) / divider;

    if (temporary) utilDate = null;
  });

  return utilizations - instalmentsCost;
};

const calculate = (instalments: Array<Object>): number => {
  let rateLeft: number = 0;
  let rateRight: number = 1;
  let rateIntersection: number;
  let diffLeft: number;
  let diffRight: number;
  const aprAccuracy: number = 1e-6;

  diffLeft = diff(instalments, rateLeft);
  if (diffLeft === 0) return rateLeft;

  while (Math.abs(rateLeft - rateRight) >= aprAccuracy) {
    diffRight = diff(instalments, rateRight);
    if (diffRight - diffLeft === 0) {
      return rateRight * 100;
    }

    rateIntersection = rateRight - ((diffRight * (rateRight - rateLeft)) / (diffRight - diffLeft));

    rateLeft = rateRight;
    rateRight = rateIntersection;
    if (rateRight < 0) {
      rateRight = 0;
    }

    diffLeft = diffRight;
  }

  return round(rateRight * 100, 2);
};

export default calculate;
