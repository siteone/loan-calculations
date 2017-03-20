import moment from 'moment';
import calculate from '../src/index';

const createInstallment = (date, utilization, instalment, charge, extraInstalment, extraCharge) => ({
  date,
  utilization,
  instalment,
  charge,
  extraInstalment,
  extraCharge,
});

test('non-leap year', () => {
  const instalments = [];
  // 05.11.2015 načerpáno 5000 CZK
  instalments.push(createInstallment(new Date(2015, 10, 5), 5000, 0, 0, 0, 0));
  // vygenerujeme splátky => 80 splátek po 100 CZK
  for (let i = 0; i < 80; i++) { // eslint-disable-line no-plusplus
    let instalmentDate = new Date(2015, 11, 16);  // první splátka 16.12.2015
    instalmentDate = moment(instalmentDate).add(i, 'month').toDate(); // k tomu přidám x-tý měsíc
    instalments.push(createInstallment(instalmentDate, 0, 100, 0, 0, 0));
  }
  // zavoláme výpočet RPSN
  const rpsn = calculate(instalments);
  // zkontrolujeme výsledek
  expect(rpsn).toBe(16.21);
});

test('leap year', () => {
  // připravíme splátkový kalendář
  const instalments = [];
  // 25.02.2016 načerpáno 180000 CZK
  instalments.push(createInstallment(new Date(2016, 1, 25), 180000, 0, 0, 0, 0));
  // vygenerujeme splátky => 61 splátek po 4257 CZK
  for (let i = 0; i < 61; i++) { // eslint-disable-line no-plusplus
    let instalmentDate = new Date(2016, 2, 15);  // první splátka 15.03.2016
    instalmentDate = moment(instalmentDate).add(i, 'month').toDate(); // k tomu přidám x-tý měsíc
    instalments.push(createInstallment(instalmentDate, 0, 4257, 0, 0, 0));
  }
  // zavoláme výpočet RPSN
  const rpsn = calculate(instalments);
  // zkontrolujeme výsledek
  expect(rpsn).toBe(16.59);
});
