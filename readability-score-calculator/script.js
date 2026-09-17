const textEl = document.getElementById("text");
const fleschScoreEl = document.getElementById("fleschScore");
const fleschTagEl = document.getElementById("fleschTag");
const gradeScoreEl = document.getElementById("gradeScore");
const gradeTagEl = document.getElementById("gradeTag");
const statsEl = document.getElementById("stats");

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length === 0) return 0;
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

function fleschTag(score) {
  if (score >= 90) return "Very easy";
  if (score >= 70) return "Easy";
  if (score >= 60) return "Standard";
  if (score >= 50) return "Fairly difficult";
  if (score >= 30) return "Difficult";
  return "Very confusing";
}

function gradeTag(grade) {
  if (grade <= 0) return "—";
  if (grade < 6) return "Elementary";
  if (grade < 9) return "Middle school";
  if (grade < 13) return "High school";
  return "College+";
}

function analyze() {
  const text = textEl.value.trim();
  if (!text) {
    fleschScoreEl.textContent = "0.0";
    gradeScoreEl.textContent = "0.0";
    fleschTagEl.textContent = "—";
    gradeTagEl.textContent = "—";
    statsEl.textContent = "0 words · 0 sentences · 0 syllables";
    return;
  }

  const words = text.match(/[A-Za-z']+/g) || [];
  const sentences = text.split(/[.!?]+(?:\s|$)/).filter((s) => s.trim().length > 0);
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);

  const wordCount = words.length || 1;
  const sentenceCount = sentences.length || 1;

  const flesch = 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllables / wordCount);
  const grade = 0.39 * (wordCount / sentenceCount) + 11.8 * (syllables / wordCount) - 15.59;

  fleschScoreEl.textContent = flesch.toFixed(1);
  fleschTagEl.textContent = fleschTag(flesch);
  gradeScoreEl.textContent = Math.max(0, grade).toFixed(1);
  gradeTagEl.textContent = gradeTag(grade);
  statsEl.textContent = `${wordCount} words · ${sentenceCount} sentences · ${syllables} syllables`;
}

textEl.addEventListener("input", analyze);
textEl.value = "The quick brown fox jumps over the lazy dog. Readability scores estimate how easy a passage is to understand, based on sentence length and syllable counts.";
analyze();
