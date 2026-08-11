const personForm = document.getElementById("personForm");
const personName = document.getElementById("personName");
const personList = document.getElementById("personList");

const expenseForm = document.getElementById("expenseForm");
const expensePayer = document.getElementById("expensePayer");
const expenseDesc = document.getElementById("expenseDesc");
const expenseAmount = document.getElementById("expenseAmount");
const expenseList = document.getElementById("expenseList");

const settleList = document.getElementById("settleList");
const settleEmpty = document.getElementById("settleEmpty");
const resetBtn = document.getElementById("resetBtn");

let people = [];
let expenses = [];

function formatEuro(value) {
  return value.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}

function renderPeople() {
  personList.innerHTML = "";
  people.forEach((name) => {
    const li = document.createElement("li");
    li.textContent = name + " ";
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "×";
    removeBtn.setAttribute("aria-label", `${name} entfernen`);
    removeBtn.addEventListener("click", () => removePerson(name));
    li.appendChild(removeBtn);
    personList.appendChild(li);
  });

  expensePayer.innerHTML = "";
  people.forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    expensePayer.appendChild(opt);
  });
}

function removePerson(name) {
  people = people.filter((p) => p !== name);
  expenses = expenses.filter((e) => e.payer !== name);
  renderPeople();
  renderExpenses();
  renderSettlement();
}

function renderExpenses() {
  expenseList.innerHTML = "";
  expenses.forEach((exp, i) => {
    const li = document.createElement("li");
    const label = document.createElement("span");
    label.textContent = `${exp.desc} — ${exp.payer}`;
    const right = document.createElement("span");
    const amountSpan = document.createElement("span");
    amountSpan.className = "amount";
    amountSpan.textContent = formatEuro(exp.amount);
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "×";
    removeBtn.setAttribute("aria-label", "Ausgabe entfernen");
    removeBtn.addEventListener("click", () => {
      expenses.splice(i, 1);
      renderExpenses();
      renderSettlement();
    });
    right.appendChild(amountSpan);
    right.appendChild(removeBtn);
    li.appendChild(label);
    li.appendChild(right);
    expenseList.appendChild(li);
  });
}

function renderSettlement() {
  settleList.innerHTML = "";

  if (people.length < 2 || expenses.length === 0) {
    settleEmpty.style.display = "block";
    return;
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const fairShare = total / people.length;

  const balances = people.map((name) => {
    const paid = expenses
      .filter((e) => e.payer === name)
      .reduce((sum, e) => sum + e.amount, 0);
    return { name, balance: Math.round((paid - fairShare) * 100) / 100 };
  });

  const debtors = balances.filter((b) => b.balance < -0.005).sort((a, b) => a.balance - b.balance);
  const creditors = balances.filter((b) => b.balance > 0.005).sort((a, b) => b.balance - a.balance);

  const transactions = [];
  let di = 0, ci = 0;
  while (di < debtors.length && ci < creditors.length) {
    const debtor = debtors[di];
    const creditor = creditors[ci];
    const amount = Math.min(-debtor.balance, creditor.balance);

    if (amount > 0.005) {
      transactions.push({ from: debtor.name, to: creditor.name, amount });
    }

    debtor.balance += amount;
    creditor.balance -= amount;

    if (Math.abs(debtor.balance) < 0.005) di++;
    if (Math.abs(creditor.balance) < 0.005) ci++;
  }

  if (transactions.length === 0) {
    settleEmpty.textContent = "Alles ausgeglichen — niemand muss etwas zahlen.";
    settleEmpty.style.display = "block";
    return;
  }

  settleEmpty.style.display = "none";
  transactions.forEach((t) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${t.from}</strong> zahlt <strong>${formatEuro(t.amount)}</strong> an <strong>${t.to}</strong>`;
    settleList.appendChild(li);
  });
}

personForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = personName.value.trim();
  if (!name || people.includes(name)) return;
  people.push(name);
  personName.value = "";
  renderPeople();
  renderSettlement();
});

expenseForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const payer = expensePayer.value;
  const desc = expenseDesc.value.trim();
  const amount = parseFloat(expenseAmount.value);
  if (!payer || !desc || !amount || amount <= 0) return;

  expenses.push({ payer, desc, amount });
  expenseDesc.value = "";
  expenseAmount.value = "";
  renderExpenses();
  renderSettlement();
});

resetBtn.addEventListener("click", () => {
  people = [];
  expenses = [];
  renderPeople();
  renderExpenses();
  renderSettlement();
});

renderPeople();
renderExpenses();
renderSettlement();
