const principalInput = document.getElementById("principal");
const rateInput = document.getElementById("rate");
const yearsInput = document.getElementById("years");
const contributionInput = document.getElementById("contribution");
const frequencySelect = document.getElementById("frequency");

const finalAmountEl = document.getElementById("finalAmount");
const totalDepositedEl = document.getElementById("totalDeposited");
const totalInterestEl = document.getElementById("totalInterest");

const eur = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

function calculate() {
  const principal = Math.max(0, parseFloat(principalInput.value) || 0);
  const annualRate = Math.max(0, parseFloat(rateInput.value) || 0) / 100;
  const years = Math.max(0, parseInt(yearsInput.value, 10) || 0);
  const monthlyContribution = Math.max(0, parseFloat(contributionInput.value) || 0);
  const periodsPerYear = parseInt(frequencySelect.value, 10);

  const totalPeriods = years * periodsPerYear;
  const ratePerPeriod = annualRate / periodsPerYear;

  // Compound the starting principal for the full term...
  let amount = principal * Math.pow(1 + ratePerPeriod, totalPeriods);

  // ...then add the contribution stream, converted to the same period cadence
  // and compounded per remaining period (future value of an ordinary annuity).
  if (monthlyContribution > 0 && totalPeriods > 0) {
    const contributionPerPeriod = (monthlyContribution * 12) / periodsPerYear;
    const growthFactor = ratePerPeriod === 0
      ? totalPeriods
      : (Math.pow(1 + ratePerPeriod, totalPeriods) - 1) / ratePerPeriod;
    amount += contributionPerPeriod * growthFactor;
  }

  const totalDeposited = principal + monthlyContribution * 12 * years;
  const totalInterest = amount - totalDeposited;

  finalAmountEl.textContent = eur.format(amount);
  totalDepositedEl.textContent = eur.format(totalDeposited);
  totalInterestEl.textContent = eur.format(Math.max(0, totalInterest));
}

[principalInput, rateInput, yearsInput, contributionInput, frequencySelect].forEach((el) => {
  el.addEventListener("input", calculate);
  el.addEventListener("change", calculate);
});

calculate();
