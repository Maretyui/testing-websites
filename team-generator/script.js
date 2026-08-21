const namesInput = document.getElementById('namesInput');
const teamCountInput = document.getElementById('teamCountInput');
const generateBtn = document.getElementById('generateBtn');
const errorText = document.getElementById('errorText');
const teamsOutput = document.getElementById('teamsOutput');

function shuffle(list) {
  const result = list.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function parseNames(raw) {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function renderTeams(teams) {
  teamsOutput.innerHTML = '';
  teams.forEach((team, index) => {
    const card = document.createElement('div');
    card.className = 'team-card';

    const heading = document.createElement('h2');
    heading.textContent = `Team ${index + 1} (${team.length})`;
    card.appendChild(heading);

    const list = document.createElement('ul');
    team.forEach((name) => {
      const item = document.createElement('li');
      item.textContent = name;
      list.appendChild(item);
    });
    card.appendChild(list);

    teamsOutput.appendChild(card);
  });
}

generateBtn.addEventListener('click', () => {
  errorText.textContent = '';
  teamsOutput.innerHTML = '';

  const names = parseNames(namesInput.value);
  const teamCount = Math.min(12, Math.max(2, Number(teamCountInput.value) || 2));

  if (names.length < teamCount) {
    errorText.textContent = `Mindestens ${teamCount} Namen nötig, um ${teamCount} Teams zu bilden.`;
    return;
  }

  const shuffled = shuffle(names);
  const teams = Array.from({ length: teamCount }, () => []);
  shuffled.forEach((name, index) => {
    teams[index % teamCount].push(name);
  });

  renderTeams(teams);
});
