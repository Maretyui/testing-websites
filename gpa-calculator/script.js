const GRADE_POINTS = {
  "A": 4.0, "A-": 3.7,
  "B+": 3.3, "B": 3.0, "B-": 2.7,
  "C+": 2.3, "C": 2.0, "C-": 1.7,
  "D+": 1.3, "D": 1.0, "D-": 0.7,
  "F": 0.0,
};

const rowsEl = document.getElementById("rows");
const gpaValueEl = document.getElementById("gpaValue");
const creditTotalEl = document.getElementById("creditTotal");
const addRowBtn = document.getElementById("addRow");

function gradeOptions(selected) {
  return Object.keys(GRADE_POINTS)
    .map((g) => `<option value="${g}" ${g === selected ? "selected" : ""}>${g}</option>`)
    .join("");
}

function addRow(name = "", credits = 3, grade = "A") {
  const row = document.createElement("div");
  row.className = "row";
  row.innerHTML = `
    <input type="text" class="course-name" placeholder="Course name" value="${name}">
    <input type="number" class="course-credits" min="0" step="0.5" value="${credits}">
    <select class="course-grade">${gradeOptions(grade)}</select>
    <button type="button" class="remove" aria-label="Remove course">&times;</button>
  `;
  rowsEl.appendChild(row);
  row.querySelector(".remove").addEventListener("click", () => {
    row.remove();
    calculate();
  });
  row.querySelectorAll("input, select").forEach((el) => {
    el.addEventListener("input", calculate);
  });
}

function calculate() {
  let totalPoints = 0;
  let totalCredits = 0;
  rowsEl.querySelectorAll(".row").forEach((row) => {
    const credits = parseFloat(row.querySelector(".course-credits").value) || 0;
    const grade = row.querySelector(".course-grade").value;
    const points = GRADE_POINTS[grade] ?? 0;
    totalPoints += credits * points;
    totalCredits += credits;
  });
  const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
  gpaValueEl.textContent = gpa.toFixed(2);
  creditTotalEl.textContent = `${totalCredits} total credit${totalCredits === 1 ? "" : "s"}`;
}

addRowBtn.addEventListener("click", () => {
  addRow();
  calculate();
});

addRow("Course 1", 3, "A");
addRow("Course 2", 4, "B+");
calculate();
