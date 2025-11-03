// utils/computeEmissions.js
function toNum(n) {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
}

function computeEmissions(input) {
  const fuelFactor = toNum(input.fuelFactor);
  const fuelVol = toNum(input.fuelVol);
  const gridFactor = toNum(input.gridFactor);
  const kwh = toNum(input.kwh);
  const mileage = toNum(input.mileage);
  const waste = toNum(input.waste);
  const employees = Math.max(0, toNum(input.employees));

  // kg CO2e
  const fuelKg = fuelFactor * fuelVol;
  const elecKg = gridFactor * kwh;
  const transKg = mileage * 0.192;
  const wasteKg = waste * 0.456;

  const scope1Kg = fuelKg + transKg;
  const scope2Kg = elecKg;
  const scope3Kg = wasteKg;

  const scope1Tonnes = scope1Kg / 1000;
  const scope2Tonnes = scope2Kg / 1000;
  const scope3Tonnes = scope3Kg / 1000;
  const totalTonnes = scope1Tonnes + scope2Tonnes + scope3Tonnes;

  const perEmployeeTonnes =
    employees > 0 ? totalTonnes / employees : 0;

  return {
    fuelKg,
    elecKg,
    transKg,
    wasteKg,
    scope1Tonnes,
    scope2Tonnes,
    scope3Tonnes,
    totalTonnes,
    perEmployeeTonnes,
  };
}

module.exports = { computeEmissions };
