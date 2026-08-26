const principalInput = document.getElementById("principalInput");
const rateInput = document.getElementById("rateInput");
const yearsInput = document.getElementById("yearsInput");
const monthlyPaymentEl = document.getElementById("monthlyPayment");
const totalInterestEl = document.getElementById("totalInterest");
const totalPaidEl = document.getElementById("totalPaid");
const scheduleBody = document.getElementById("scheduleBody");

function formatEuro(value) {
  return value.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function calculate() {
  const principal = Math.max(0, parseFloat(principalInput.value) || 0);
  const annualRate = Math.max(0, parseFloat(rateInput.value) || 0);
  const years = Math.max(1, parseInt(yearsInput.value, 10) || 1);

  const monthlyRate = annualRate / 100 / 12;
  const numPayments = years * 12;

  // Standard annuity formula; falls back to a plain even split when the rate
  // is 0 so a division by zero (rate^0 - 1 = 0) never happens.
  const monthlyPayment = monthlyRate === 0
    ? principal / numPayments
    : (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -numPayments));

  const totalPaid = monthlyPayment * numPayments;
  const totalInterest = totalPaid - principal;

  monthlyPaymentEl.textContent = formatEuro(monthlyPayment);
  totalInterestEl.textContent = formatEuro(totalInterest);
  totalPaidEl.textContent = formatEuro(totalPaid);

  scheduleBody.innerHTML = "";
  let balance = principal;
  const monthsToShow = Math.min(12, numPayments);
  for (let month = 1; month <= monthsToShow; month++) {
    const interestPortion = balance * monthlyRate;
    const principalPortion = monthlyPayment - interestPortion;
    balance = Math.max(0, balance - principalPortion);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${month}</td>
      <td>${formatEuro(interestPortion)}</td>
      <td>${formatEuro(principalPortion)}</td>
      <td>${formatEuro(balance)}</td>
    `;
    scheduleBody.appendChild(row);
  }
}

[principalInput, rateInput, yearsInput].forEach((input) => {
  input.addEventListener("input", calculate);
});

calculate();
