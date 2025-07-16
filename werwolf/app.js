
let players = [];
let gameConfig = {};
let gameState = {
    isGameActive: false,
    currentNight: 0,
    currentPlayerConfigIndex: 0,
    currentNightRoleIndex: 0,
    currentPhase: 'setup', // 'setup', 'night', 'day-revenge', 'day-voting'
    specialAbilitiesDisabled: false,
    pendingDaybreakActions: [], // { type: 'Jäger'/'Ritter', victimId: 'player-id' }
};
let narratorState = {
    selectedPlayers: [],
    actionType: null,
    markedForDeathIds: [],
    lastProtected: null,
    votes: {},
};
let lastGameState = null;

const MIN_PLAYERS = 4;
const MAX_PLAYERS = 99; // Effectively unlimited
const DEFAULT_PLAYER_COUNT = 6;
const DEFAULT_NIGHT_ORDER_NIGHT1 = ['Amor', 'Beschützer', 'Seherin', 'Schwester', 'Bruder', 'Werwolf', 'α-Werwolf', 'Hexe'];
const DEFAULT_NIGHT_ORDER_OTHERS = ['Beschützer', 'Seherin', 'Werwolf', 'α-Werwolf', 'Hexe'];

let defaultGameRoles = [
    { name: 'Werwolf', wakesUp: true, description: 'Fressen jede Nacht einen Dorfbewohner.', maxCount: 10 },
    { name: 'α-Werwolf', wakesUp: true, description: 'Gehört zu den Werwölfen, wacht aber nach ihnen nochmal alleine auf, um eine zweite Person zu töten.', maxCount: 1 },
    { name: 'Dorfbewohner', wakesUp: false, description: 'Versuchen, die Werwölfe zu enttarnen.', maxCount: 99 },
    { name: 'Seherin', wakesUp: true, description: 'Kann jede Nacht die Rolle eines Spielers erfahren.', maxCount: 1 },
    { name: 'Hexe', wakesUp: true, description: 'Besitzt eine konfigurierbare Anzahl an Heil- und Gifttränken.', maxCount: 1, healPotions: 1, killPotions: 1 },
    { name: 'Amor', wakesUp: true, description: 'Verliebt in der ersten Nacht zwei Spieler.', maxCount: 1 },
    { name: 'Beschützer', wakesUp: true, description: 'Schützt jede Nacht eine Person.', maxCount: 1 },
    { name: 'Bruder', wakesUp: true, description: 'Erkennt eure Brüder in der ersten Nacht.', maxCount: 1 },
    { name: 'Schwester', wakesUp: true, description: 'Erkennt eure Schwestern in der ersten Nacht.', maxCount: 1 },
    { name: 'Alter Mann', wakesUp: false, description: 'Überlebt den ersten Werwolf-Angriff. Stirbt er durchs Dorf, verlieren alle ihre Fähigkeiten für eine Nacht.', maxCount: 1, lives: 2 },
    { name: 'Dorfdepp', wakesUp: false, description: 'Kann nicht vom Dorf rausgewählt werden. Wird er gewählt, outet er sich und bleibt im Spiel.', maxCount: 99 },
    { name: 'Hybrid', wakesUp: false, description: 'Startet als Dorfbewohner. Wird er von Werwölfen angegriffen, wird er selbst zum Werwolf.', maxCount: 1 },
    { name: 'Ritter mit der rostigen Klinge', wakesUp: false, description: 'Stirbt er, nimmt er den Werwolf links neben sich mit in den Tod.', maxCount: 99 },
    { name: 'Jäger', wakesUp: false, description: 'Stirbt er, kann er eine beliebige Person mit in den Tod reißen.', maxCount: 1, uses: 1 },
];

const D = document;
const get = (id) => D.getElementById(id);
let UIElements;

function initializeDOMElements() {
    UIElements = {
        splashScreen: get('splashScreen'), splashStartBtn: get('splashStartBtn'),
        startMenu: get('startMenu'), narratorView: get('narratorView'), playerInputAndRoleReveal: get('playerInputAndRoleReveal'),
        playerCountDisplay: get('playerCountDisplay'), decreasePlayerCount: get('decreasePlayerCount'), increasePlayerCount: get('increasePlayerCount'),
        playerCountError: get('playerCountError'), roleCountMismatchError: get('roleCountMismatchError'), defaultRoles: get('defaultRoles'),
        startGameBtn: get('startGameBtn'), advancedSettingsBtn: get('advancedSettingsBtn'), currentPhaseTitle: get('currentPhaseTitle'),
        nameInputSection: get('nameInputSection'), currentPlayerNameInput: get('currentPlayerNameInput'), currentPlayerNameError: get('currentPlayerNameError'),
        submitCurrentPlayerNameBtn: get('submitCurrentPlayerNameBtn'), roleRevealSection: get('roleRevealSection'), revealedRolePlayerName: get('revealedRolePlayerName'),
        revealedRoleName: get('revealedRoleName'), revealedRoleDescription: get('revealedRoleDescription'), roleSeenBtn: get('roleSeenBtn'),
        showRolesSummaryBtn: get('showRolesSummaryBtn'), narratorText: get('narratorText'), gameLog: get('gameLog'), gameLogWrapper: get('gameLogWrapper'),
        playerStatus: get('playerStatus'), startNightBtn: get('startNightBtn'), startDayBtn: get('startDayBtn'), nextStepBtn: get('nextStepBtn'),
        narratorActionPanel: get('narratorActionPanel'), currentNarratorAction: get('currentNarratorAction'), actionPrompt: get('action-prompt'), narratorPlayerSelection: get('narratorPlayerSelection'),
        confirmNarratorActionBtn: get('confirmNarratorActionBtn'), cancelNarratorActionBtn: get('cancelNarratorActionBtn'),
        rolesSummaryModal: get('rolesSummaryModal'), closeSummaryModalBtn: get('closeSummaryModalBtn'), assignedRolesList: get('assignedRolesList'),
        roleInfoModal: get('roleInfoModal'), infoRoleName: get('infoRoleName'), infoRoleDescription: get('infoRoleDescription'), closeInfoModalBtn: get('closeInfoModalBtn'),
        playerZoomModal: get('playerZoomModal'), playerZoomContent: get('playerZoomContent'),
        advancedSettingsModal: get('advancedSettingsModal'),
        closeAdvancedSettingsModalBtn: get('closeAdvancedSettingsModalBtn'), advancedSettingsPanel: get('advancedSettingsPanel'),
        nightWakeUpOrderList: get('nightWakeUpOrderList'),
        healPotionCount: get('healPotionCount'), killPotionCount: get('killPotionCount'),
        decreaseHealPotions: get('decreaseHealPotions'), increaseHealPotions: get('increaseHealPotions'),
        decreaseKillPotions: get('decreaseKillPotions'), increaseKillPotions: get('increaseKillPotions'),
        hunterUsesCount: get('hunterUsesCount'), decreaseHunterUses: get('decreaseHunterUses'), increaseHunterUses: get('increaseHunterUses'),
        editOrderBtn: get('editOrderBtn'), saveOrderBtn: get('saveOrderBtn'),
        resetOrderBtn: get('resetOrderBtn'),
        adminMenuBtn: get('adminMenuBtn'), adminPanelModal: get('adminPanelModal'),
        closeAdminPanelBtn: get('closeAdminPanelBtn'), adminPlayerList: get('adminPlayerList'),
        dayPhaseControls: get('dayPhaseControls'), executeVoteBtn: get('executeVoteBtn'),
        handleTieBtn: get('handleTieBtn'), forceNightBtn: get('forceNightBtn'),
        gameOverModal: get('gameOverModal'), winningTeamText: get('winningTeamText'),
        newRoundBtn: get('newRoundBtn'),
        reviewLastGameBtn: get('reviewLastGameBtn'),
        narratorControls: get('narratorControls'),
        backToMenuBtn: get('backToMenuBtn'),
        hideConsoleToggleInput: get('hideConsoleToggleInput'),
    };
}
const UIManager = {
    updatePlayerCountDisplay() { UIElements.playerCountDisplay.textContent = gameConfig.playerCount || DEFAULT_PLAYER_COUNT; },

    updateConfigErrors() {
        const playerCount = gameConfig.playerCount || 0;
        const totalRoles = gameConfig.selectedRoles?.reduce((sum, r) => sum + r.count, 0) || 0;
        const playerCountError = playerCount < MIN_PLAYERS;
        const roleCountError = playerCount !== totalRoles;
        UIElements.playerCountError.classList.toggle('hidden', !playerCountError);
        UIElements.roleCountMismatchError.classList.toggle('hidden', !roleCountError || playerCount === 0);
    },

    updateStartButtonState() {
        const playerCount = gameConfig.playerCount || 0;
        const totalRoles = gameConfig.selectedRoles?.reduce((sum, r) => sum + r.count, 0) || 0;
        const hasWerwolf = gameConfig.selectedRoles?.some(r => r.name.includes('Werwolf') && r.count > 0);
        const canStart = playerCount >= MIN_PLAYERS && playerCount <= MAX_PLAYERS && playerCount === totalRoles && hasWerwolf;
        UIElements.startGameBtn.disabled = !canStart;
        UIElements.startGameBtn.classList.toggle('opacity-50', !canStart);
        UIElements.startGameBtn.classList.toggle('cursor-not-allowed', !canStart);
    },

    renderDefaultRoles() {
        UIElements.defaultRoles.innerHTML = defaultGameRoles.map(role => this.createRoleHTML(role)).join('');
        this.addRoleEventListeners(UIElements.defaultRoles);
    },

    createRoleHTML(role) {
        const count = gameConfig.selectedRoles?.find(r => r.name === role.name)?.count || 0;
        const idAttr = `data-role-name="${role.name}"`;
        const countId = `role-count-${role.name.replace(/\s/g, '')}`;
        return `
                <div class="relative flex items-center bg-gray-900/50 p-2 rounded-lg shadow-sm">
                    <button class="info-icon mr-2 text-indigo-400 hover:text-indigo-200" ${idAttr} aria-label="Info zu ${role.name}"><svg class="h-5 w-5 pointer-events-none" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg></button>
                    <label for="${countId}" class="flex-grow text-gray-200">${role.name}</label>
                    <div class="flex items-center">
                        <button class="role-count-btn bg-gray-600 hover:bg-gray-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold" ${idAttr} data-action="decrease">-</button>
                        <span id="${countId}" class="w-10 text-center mx-1">${count}</span>
                        <button class="role-count-btn bg-gray-600 hover:bg-gray-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold" ${idAttr} data-action="increase">+</button>
                    </div>
                </div>`;
    },

    addRoleEventListeners(container) {
        container.querySelectorAll('.role-count-btn').forEach(btn => btn.addEventListener('click', GameLogic.handleRoleCountChange.bind(GameLogic)));
        container.querySelectorAll('.info-icon').forEach(btn => btn.addEventListener('click', this.showRoleInfoModal.bind(this)));
    },

    showRoleInfoModal(event) {
        const roleName = event.currentTarget.dataset.roleName;
        const role = defaultGameRoles.find(r => r.name === roleName);
        if (role) {
            UIElements.infoRoleName.textContent = role.name;
            UIElements.infoRoleDescription.textContent = role.description;
            this.toggleModal(UIElements.roleInfoModal, true);
        }
    },

    toggleModal(modalElement, show) {
        if (modalElement.id === 'advancedSettingsModal') {
            if (show) {
                modalElement.classList.remove('hidden');
                setTimeout(() => {
                    UIElements.advancedSettingsPanel.classList.remove('modal-hidden');
                }, 10);
            } else {
                UIElements.advancedSettingsPanel.classList.add('modal-hidden');
                setTimeout(() => {
                    modalElement.classList.add('hidden');
                }, 400);
            }
        } else {
            modalElement.classList.toggle('hidden', !show);
        }
    },

    renderPlayerStatus(playerList = players, isReview = false) {
        const currentPlayers = playerList;
        const witch = currentPlayers.find(p => p.role.name === 'Hexe');
        UIElements.playerStatus.innerHTML = currentPlayers.sort((a, b) => a.name.localeCompare(b.name)).map(player => {
            const isDead = !player.isAlive;
            let borderColor = 'border-gray-700/50';
            let extraClasses = '';

            if (isDead) {
                borderColor = 'border-red-700';
                extraClasses = 'opacity-50 bg-red-900/30 cursor-not-allowed';
            } else if (!isReview && narratorState.markedForDeathIds.includes(player.id)) {
                borderColor = 'border-orange-500';
            } else if (player.isProtected) {
                borderColor = 'border-blue-500';
            } else {
                borderColor = 'border-green-500/50';
            }

            const voteCount = narratorState.votes[player.id] || 0;
            const isVoting = !isReview && gameState.currentPhase === 'day-voting' && player.isAlive;

            return `
                    <div id="player-card-${player.id}" class="player-card bg-gray-900/50 p-3 rounded-lg text-center relative group border-2 ${borderColor} ${extraClasses} transition-all duration-300">
                        <div class="cursor-pointer" data-action="show-details" data-player-id="${player.id}">
                            <p class="font-semibold text-lg pointer-events-none">${player.name}</p>
                            <p class="text-sm text-gray-400 pointer-events-none">${player.role.name}</p>
                            ${player.isLoved ? '<p class="text-xs text-pink-400 font-semibold pointer-events-none">Verliebt</p>' : ''}
                            ${player.isProtected ? '<p class="text-xs text-blue-400 font-semibold pointer-events-none">Beschützt</p>' : ''}
                            ${player.role.name === 'Hexe' && player.isAlive && witch ? `<p class="text-xs text-gray-300 mt-1 pointer-events-none">❤️${witch.role.healPotions} ☠️${witch.role.killPotions}</p>` : ''}
                        </div>
                        ${isVoting ? `
                        <div class="absolute inset-x-0 bottom-2 flex justify-center items-center gap-2 day-vote-controls">
                            <button data-vote-action="minus" data-player-id="${player.id}" class="bg-red-600 hover:bg-red-700 rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">-</button>
                            <span class="text-xl font-bold w-8 text-center">${voteCount}</span>
                            <button data-vote-action="plus" data-player-id="${player.id}" class="bg-green-600 hover:bg-green-700 rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">+</button>
                        </div>` : ''}
                    </div>`
        }).join('');
    },

    showPlayerZoomModal(player) {
        const witch = players.find(p => p.role.name === 'Hexe');
        UIElements.playerZoomContent.innerHTML = `
                   <button id="closeZoomBtn" class="absolute top-3 right-4 text-gray-400 hover:text-gray-200 text-4xl font-bold">&times;</button>
                   <p id="zoom-modal-title" class="font-extrabold text-5xl mb-3">${player.name}</p>
                   <p class="text-3xl text-indigo-300 mb-6">${player.role.name}</p>
                   <div class="space-y-3 text-left text-lg">
                       <p><span class="font-semibold">Status:</span> ${player.isAlive ? 'Lebt' : 'Tot'}</p>
                       ${player.isLoved ? '<p><span class="font-semibold">Status:</span> <span class="text-pink-400">Verliebt</span></p>' : ''}
                       ${player.isProtected ? '<p><span class="font-semibold">Status:</span> <span class="text-blue-400">Beschützt</span></p>' : ''}
                       ${player.role.name === 'Hexe' && witch ? `<p><span class="font-semibold">Tränke:</span> Heiltrank (${witch.role.healPotions}), Gifttrank (${witch.role.killPotions})</p>` : ''}
                   </div>
               `;
        this.toggleModal(UIElements.playerZoomModal, true);
        get('closeZoomBtn').addEventListener('click', () => this.toggleModal(UIElements.playerZoomModal, false), { once: true });
    },

    showSeerRevealModal(player, callback) {
        UIElements.playerZoomContent.innerHTML = `
                   <button id="closeZoomBtn" class="absolute top-3 right-4 text-gray-400 hover:text-gray-200 text-4xl font-bold">&times;</button>
                   <p id="zoom-modal-title" class="font-extrabold text-5xl mb-3">${player.name}</p>
                   <p class="text-3xl text-indigo-300 mb-4">${player.role.name}</p>
                   <p class="text-xl text-gray-300 mt-4">Das ist die Rolle von ${player.name}.</p>
                `;
        this.toggleModal(UIElements.playerZoomModal, true);
        get('closeZoomBtn').addEventListener('click', () => {
            this.toggleModal(UIElements.playerZoomModal, false);
            if (callback) callback();
        }, { once: true });
    },

    renderNightWakeUpOrderList(isEditing = false) {
        if (!gameConfig.nightWakeUpOrder || gameConfig.nightWakeUpOrder.length === 0) {
            GameLogic.resetNightOrder();
        }

        UIElements.nightWakeUpOrderList.innerHTML = gameConfig.nightWakeUpOrder.map((roleName, index) => `
                    <div class="order-item" data-index="${index}">
                        <span class="flex items-center">
                            <span class="mr-4 text-gray-500">${index + 1}.</span>
                            <span>${roleName}</span>
                        </span>
                        <div class="order-controls flex gap-2" ${!isEditing ? 'style="display:none;"' : ''}>
                             <button data-action="up" aria-label="Nach oben verschieben" ${index === 0 ? 'disabled' : ''}>
                                <svg class="w-5 h-5 pointer-events-none" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd"></path></svg>
                            </button>
                             <button data-action="down" aria-label="Nach unten verschieben" ${index === gameConfig.nightWakeUpOrder.length - 1 ? 'disabled' : ''}>
                                <svg class="w-5 h-5 pointer-events-none" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                            </button>
                        </div>
                    </div>
                `).join('');
    }
};

const GameLogic = {
    initialize() {
        players = [];
        gameConfig = { playerCount: DEFAULT_PLAYER_COUNT, selectedRoles: [], nightWakeUpOrder: [...DEFAULT_NIGHT_ORDER_NIGHT1] };
        gameState = {
            isGameActive: false, currentNight: 0, currentPlayerConfigIndex: 0,
            currentNightRoleIndex: 0, currentPhase: 'setup', specialAbilitiesDisabled: false, pendingDaybreakActions: [],
        };
        narratorState = {
            selectedPlayers: [], actionType: null, markedForDeathIds: [], lastProtected: null, votes: {},
        };
        UIManager.updatePlayerCountDisplay();
        UIManager.renderDefaultRoles();
        UIManager.updateStartButtonState();
        UIElements.gameLog.innerHTML = '';
        UIElements.narratorText.innerHTML = 'Willkommen, Erzähler!';
    },

    changePlayerCount(amount) {
        const currentCount = gameConfig.playerCount || DEFAULT_PLAYER_COUNT;
        const newCount = Math.max(MIN_PLAYERS, currentCount + amount);
        if (newCount !== gameConfig.playerCount) {
            gameConfig.playerCount = newCount;
            UIManager.updatePlayerCountDisplay();
            UIManager.updateConfigErrors();
            UIManager.updateStartButtonState();
        }
    },

    handleRoleCountChange(event) {
        const button = event.currentTarget;
        const { roleName, action } = button.dataset;
        const role = defaultGameRoles.find(r => r.name === roleName);
        if (!role) return;

        if (!gameConfig.selectedRoles) gameConfig.selectedRoles = [];
        let roleConfig = gameConfig.selectedRoles.find(r => r.name === role.name);
        let currentCount = roleConfig?.count || 0;

        if (action === 'increase') {
            if (currentCount < role.maxCount) currentCount++;
        } else {
            if (currentCount > 0) currentCount--;
        }

        if (roleConfig) {
            roleConfig.count = currentCount;
        } else if (currentCount > 0) {
            gameConfig.selectedRoles.push({ name: role.name, count: currentCount });
        }

        gameConfig.selectedRoles = gameConfig.selectedRoles.filter(r => r.count > 0);

        UIManager.renderNightWakeUpOrderList();
        const countId = `role-count-${role.name.replace(/\s/g, '')}`;
        get(countId).textContent = currentCount;

        UIManager.updateConfigErrors();
        UIManager.updateStartButtonState();
    },

    changeHunterUses(amount) {
        const hunterRole = defaultGameRoles.find(r => r.name === 'Jäger');
        hunterRole.uses = Math.max(0, (hunterRole.uses || 1) + amount);
        UIElements.hunterUsesCount.textContent = hunterRole.uses;
    },

    changePotionCount(type, amount) {
        const witchRole = defaultGameRoles.find(r => r.name === 'Hexe');
        if (type === 'heal') {
            witchRole.healPotions = Math.max(0, witchRole.healPotions + amount);
            UIElements.healPotionCount.textContent = witchRole.healPotions;
        } else if (type === 'kill') {
            witchRole.killPotions = Math.max(0, witchRole.killPotions + amount);
            UIElements.killPotionCount.textContent = witchRole.killPotions;
        }
    },

    startGame() {
        UIElements.startMenu.classList.add('hidden');
        UIElements.playerInputAndRoleReveal.classList.remove('hidden');
        gameState.isGameActive = true;
        gameState.currentPlayerConfigIndex = 0;
        this.assignRoles();
        this.proceedToNextPlayer();
    },

    assignRoles() {
        const hunterUses = parseInt(UIElements.hunterUsesCount.textContent) || 0;

        let rolesToAssign = gameConfig.selectedRoles.flatMap(rc => {
            const fullRole = { ...defaultGameRoles.find(dr => dr.name === rc.name) };
            if (fullRole.name === 'Jäger') fullRole.uses = hunterUses;
            if (fullRole.name === 'Alter Mann') fullRole.lives = 2;
            return Array(rc.count).fill(fullRole);
        });

        for (let i = rolesToAssign.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[rolesToAssign[i], rolesToAssign[j]] = [rolesToAssign[j], rolesToAssign[i]]; }
        players = rolesToAssign.map((role, i) => ({
            id: `player-${i}`, name: '', role: { ...role },
            isAlive: true, isProtected: false, isLoved: false, partnerId: null,
        }));
    },

    proceedToNextPlayer() {
        if (gameState.currentPlayerConfigIndex < gameConfig.playerCount) {
            UIElements.roleRevealSection.classList.add('hidden');
            UIElements.nameInputSection.classList.remove('hidden');
            UIElements.currentPhaseTitle.textContent = `Spieler ${gameState.currentPlayerConfigIndex + 1}: Name eingeben`;
            UIElements.currentPlayerNameInput.value = '';
            UIElements.currentPlayerNameInput.focus();
        } else {
            UIElements.playerInputAndRoleReveal.classList.add('hidden');
            UIElements.narratorView.classList.remove('hidden');
            UIManager.renderPlayerStatus();
        }
    },

    submitPlayerName() {
        const name = UIElements.currentPlayerNameInput.value.trim();
        const nameExists = players.some(p => p.name.toLowerCase() === name.toLowerCase());
        UIElements.currentPlayerNameError.classList.toggle('hidden', !!name && !nameExists);
        UIElements.currentPlayerNameError.textContent = !name ? 'Bitte gib einen Namen ein.' : (nameExists ? 'Dieser Name wird bereits verwendet.' : '');

        if (!!name && !nameExists) {
            players[gameState.currentPlayerConfigIndex].name = name;
            this.showCurrentPlayerRole();
        }
    },

    showCurrentPlayerRole() {
        const player = players[gameState.currentPlayerConfigIndex];
        UIElements.nameInputSection.classList.add('hidden');
        UIElements.roleRevealSection.classList.remove('hidden');
        UIElements.currentPhaseTitle.textContent = 'Deine Rolle';
        UIElements.revealedRolePlayerName.textContent = `${player.name}, deine Rolle ist:`;
        UIElements.revealedRoleName.textContent = player.role.name;
        UIElements.revealedRoleDescription.textContent = player.role.description;
        gameState.currentPlayerConfigIndex++;
    },

    startNight() {
        if (gameState.specialAbilitiesDisabled) {
            const msg = "Die Fähigkeiten der Dorfbewohner sind diese Nacht blockiert!";
            this.logToGame(msg, "text-yellow-400");
            UIElements.narratorText.innerHTML = `<strong class="text-yellow-400">${msg}</strong>`;
        }
        gameState.currentPhase = 'night';
        gameState.currentNight++;
        gameState.currentNightRoleIndex = 0;
        narratorState.markedForDeathIds = [];
        players.forEach(p => p.isProtected = false);
        UIElements.startNightBtn.classList.add('hidden');
        UIElements.dayPhaseControls.classList.add('hidden');
        this.logToGame(`Nacht ${gameState.currentNight} beginnt.`, 'text-gray-400');
        UIElements.narratorText.innerHTML = "Alle Spieler schlafen ein.";
        UIManager.renderPlayerStatus();
        this.processNightStep();
    },

    processNightStep() {
        const nightOrder = gameState.currentNight === 1 ? gameConfig.nightWakeUpOrder : DEFAULT_NIGHT_ORDER_OTHERS.filter(r => gameConfig.nightWakeUpOrder.includes(r));
        const activeRolesInOrder = nightOrder.filter(roleName => players.some(p => p.role.name === roleName && p.isAlive));

        if (gameState.currentNightRoleIndex >= activeRolesInOrder.length) {
            this.endNight();
            return;
        }

        const roleName = activeRolesInOrder[gameState.currentNightRoleIndex];
        if (gameState.specialAbilitiesDisabled && roleName !== 'Werwolf' && roleName !== 'α-Werwolf') {
            this.advanceToNextRole();
            return;
        }

        UIElements.narratorText.innerHTML = `<strong class="text-white">${roleName}</strong>, wache auf.`;
        this.logToGame(`${roleName} wacht auf.`, 'text-gray-400');
        this.setupRoleAction(roleName);
    },

    setupRoleAction(roleName) {
        UIElements.narratorActionPanel.classList.remove('hidden');
        narratorState.selectedPlayers = [];
        narratorState.currentActionRole = roleName;

        const rolePlayers = players.filter(p => p.role.name === roleName && p.isAlive);
        const rolePlayerNames = rolePlayers.map(p => p.name).join(' und ');

        UIElements.currentNarratorAction.innerHTML = `${roleName}, <strong class="text-white">${rolePlayerNames}</strong>`;

        const simpleRoles = ['Bruder', 'Schwester'];
        if (gameState.currentNight === 1 && simpleRoles.includes(roleName)) {
            UIElements.actionPrompt.textContent = 'Erkennt euch und schlaft wieder ein.';
            UIElements.narratorPlayerSelection.innerHTML = '';
            UIElements.nextStepBtn.classList.remove('hidden');
            UIElements.cancelNarratorActionBtn.classList.add('hidden');
            UIElements.confirmNarratorActionBtn.classList.add('hidden');
            return;
        }

        let prompt = "";
        let requiredSelections = 0;
        let showCancel = false;
        let selectablePlayers = players.filter(p => p.isAlive);

        switch (roleName) {
            case "Amor": prompt = "Wählt 2 Personen zum Verlieben aus."; requiredSelections = 2; break;
            case "Beschützer": prompt = "Suche dir einen Spieler aus, den du für diese Runde beschützen willst."; requiredSelections = 1; showCancel = true; break;
            case "Seherin": prompt = "Wessen Karte möchtest du sehen?"; requiredSelections = 1; break;
            case "Werwolf":
            case "α-Werwolf":
                prompt = "Wählt ein Opfer aus."; requiredSelections = 1;
                selectablePlayers = selectablePlayers.filter(p => !p.role.name.includes('Werwolf'));
                break;
            case "Hexe": this.setupWitchAction(); return;
            default: setTimeout(() => this.advanceToNextRole(), 1500); return;
        }
        UIElements.actionPrompt.textContent = prompt;

        if (roleName === 'Seherin' || roleName === 'Beschützer') {
            selectablePlayers = selectablePlayers.filter(p => !rolePlayers.some(rp => rp.id === p.id));
        }

        UIElements.narratorPlayerSelection.innerHTML = selectablePlayers.map(p =>
            `<button class="bg-gray-600 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors" data-player-id="${p.id}">${p.name}</button>`
        ).join('');

        UIElements.narratorPlayerSelection.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                const player = players.find(p => p.id === btn.dataset.playerId);
                if (roleName === 'Seherin') {
                    this.logToGame(`Seherin schaut sich die Karte von ${player.name} an.`, 'text-purple-400');
                    UIManager.showSeerRevealModal(player, () => this.advanceToNextRole());
                    return;
                }
                this.togglePlayerSelection(player, requiredSelections);
            });
        });

        if (roleName !== 'Seherin') {
            UIElements.confirmNarratorActionBtn.disabled = true;
            UIElements.confirmNarratorActionBtn.classList.remove('hidden');
            if (showCancel) UIElements.cancelNarratorActionBtn.classList.remove('hidden');
        }
    },

    setupWitchAction() {
        const witch = players.find(p => p.role.name === 'Hexe' && p.isAlive);
        UIElements.actionPrompt.textContent = 'Möchtest du einen Trank benutzen?';
        UIElements.narratorPlayerSelection.innerHTML = `
                    <div class="flex justify-center gap-4">
                        <button id="healBtn" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50" ${witch.role.healPotions > 0 && narratorState.markedForDeathIds.length > 0 ? '' : 'disabled'}>Heilen</button>
                        <button id="killBtn" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50" ${witch.role.killPotions > 0 ? '' : 'disabled'}>Töten</button>
                    </div>
                `;

        if (witch.role.healPotions > 0 && narratorState.markedForDeathIds.length > 0) {
            get('healBtn').onclick = () => this.showWitchHealSelection();
        }
        if (witch.role.killPotions > 0) {
            get('killBtn').onclick = () => this.showWitchKillSelection();
        }

        UIElements.cancelNarratorActionBtn.textContent = "Zug beenden";
        UIElements.cancelNarratorActionBtn.classList.remove('hidden');
    },

    showWitchHealSelection() {
        UIElements.actionPrompt.textContent = 'Wen möchtest du heilen?';
        const selectable = players.filter(p => narratorState.markedForDeathIds.includes(p.id));
        UIElements.narratorPlayerSelection.innerHTML = selectable.map(p =>
            `<button class="bg-gray-600 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" data-player-id="${p.id}">${p.name}</button>`
        ).join('');
        UIElements.narratorPlayerSelection.querySelectorAll('button').forEach(btn => {
            btn.onclick = () => {
                const target = players.find(p => p.id === btn.dataset.playerId);
                this.confirmWitchAction('heal', target);
            };
        });
    },

    showWitchKillSelection() {
        UIElements.actionPrompt.textContent = 'Wen möchtest du töten?';
        const witch = players.find(p => p.role.name === 'Hexe');
        const selectable = players.filter(p => p.isAlive && p.id !== witch.id);
        UIElements.narratorPlayerSelection.innerHTML = selectable.map(p =>
            `<button class="bg-gray-600 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" data-player-id="${p.id}">${p.name}</button>`
        ).join('');
        UIElements.narratorPlayerSelection.querySelectorAll('button').forEach(btn => {
            btn.onclick = () => {
                const target = players.find(p => p.id === btn.dataset.playerId);
                this.confirmWitchAction('kill', target);
            };
        });
        UIElements.cancelNarratorActionBtn.textContent = "Zurück";
        UIElements.cancelNarratorActionBtn.onclick = () => this.setupWitchAction();
    },

    confirmWitchAction(type, target) {
        const witch = players.find(p => p.role.name === 'Hexe');
        if (type === 'heal') {
            witch.role.healPotions--;
            this.logToGame(`Die Hexe hat ${target.name} gerettet!`, 'text-green-400');
            UIElements.narratorText.innerHTML = `Die Hexe hat <strong class="text-green-400">${target.name}</strong> gerettet!`;
            narratorState.markedForDeathIds = narratorState.markedForDeathIds.filter(id => id !== target.id);
        } else {
            witch.role.killPotions--;
            this.killPlayer(target, 'von der Hexe getötet');
        }
        UIManager.renderPlayerStatus();
        this.setupWitchAction();
    },

    togglePlayerSelection(player, requiredCount) {
        const btn = UIElements.narratorPlayerSelection.querySelector(`[data-player-id="${player.id}"]`);
        const index = narratorState.selectedPlayers.findIndex(p => p.id === player.id);

        if (index > -1) {
            narratorState.selectedPlayers.splice(index, 1);
            btn.classList.remove('bg-indigo-500');
        } else {
            if (narratorState.selectedPlayers.length < requiredCount) {
                narratorState.selectedPlayers.push(player);
                btn.classList.add('bg-indigo-500');
            } else if (requiredCount === 1) {
                const oldSelection = narratorState.selectedPlayers[0];
                const oldBtn = UIElements.narratorPlayerSelection.querySelector(`[data-player-id="${oldSelection.id}"]`);
                if (oldBtn) oldBtn.classList.remove('bg-indigo-500');
                narratorState.selectedPlayers = [player];
                btn.classList.add('bg-indigo-500');
            }
        }

        UIElements.confirmNarratorActionBtn.disabled = (narratorState.selectedPlayers.length !== requiredCount);
    },

    confirmRoleAction() {
        const roleName = narratorState.currentActionRole;
        const targets = narratorState.selectedPlayers;
        this.logToGame(`${roleName} wählt ${targets.map(t => t.name).join(', ')}.`, 'text-purple-400');

        switch (roleName) {
            case 'Amor':
                targets[0].isLoved = true; targets[1].isLoved = true;
                targets[0].partnerId = targets[1].id; targets[1].partnerId = targets[0].id;
                this.logToGame(`${targets[0].name} und ${targets[1].name} sind jetzt verliebt.`, 'text-pink-400');
                UIElements.narratorText.innerHTML = `<strong class="text-pink-400">${targets[0].name} und ${targets[1].name}</strong> sind jetzt verliebt.`;
                break;
            case 'Beschützer':
                targets[0].isProtected = true;
                this.logToGame(`${targets[0].name} wurde diese Nacht beschützt.`, 'text-blue-400');
                UIElements.narratorText.innerHTML = `<strong class="text-blue-400">${targets[0].name}</strong> wurde beschützt.`;
                break;
            case 'Werwolf':
            case 'α-Werwolf':
                const target = targets[0];
                if (target.isProtected) {
                    this.logToGame(`Die ${roleName} haben versucht, ${target.name} zu fressen, doch er/sie wurde beschützt!`, 'text-green-400');
                    UIElements.narratorText.innerHTML = `Die Werwölfe griffen <strong class="text-orange-400">${target.name}</strong> an, aber er/sie wurde beschützt!`;
                } else {
                    narratorState.markedForDeathIds.push(target.id);
                    this.logToGame(`Die ${roleName} haben sich für ${target.name} entschieden.`, 'text-orange-400');
                    UIElements.narratorText.innerHTML = `<strong class="text-orange-400">${target.name}</strong> wurde als Opfer gewählt.`;
                }
                break;
        }

        UIManager.renderPlayerStatus();
        this.advanceToNextRole();
    },

    killPlayer(playerToKill, cause) {
        if (!playerToKill || !playerToKill.isAlive) return;

        playerToKill.isAlive = false;
        this.logToGame(`${playerToKill.name} ist gestorben (${cause}).`, 'text-red-500');
        UIElements.narratorText.innerHTML = `<strong class="text-red-500">${playerToKill.name}</strong> ist gestorben!`;

        if (playerToKill.isLoved && playerToKill.partnerId) {
            const partner = players.find(p => p.id === playerToKill.partnerId);
            if (partner && partner.isAlive) { this.killPlayer(partner, 'Liebeskummer'); }
        }

        if (playerToKill.role.name === 'Jäger' && playerToKill.role.uses > 0) {
            gameState.pendingDaybreakActions.push({ type: 'Jäger', victimId: playerToKill.id });
        }
        if (playerToKill.role.name === 'Ritter mit der rostigen Klinge') {
            gameState.pendingDaybreakActions.push({ type: 'Ritter', victimId: playerToKill.id });
        }

        UIManager.renderPlayerStatus();
    },

    advanceToNextRole() {
        gameState.currentNightRoleIndex++;
        UIElements.narratorActionPanel.classList.add('hidden');
        UIElements.nextStepBtn.classList.add('hidden');
        UIElements.cancelNarratorActionBtn.classList.add('hidden');
        UIElements.confirmNarratorActionBtn.classList.add('hidden');
        this.processNightStep();
    },

    resetNightOrder() {
        gameConfig.nightWakeUpOrder = [...DEFAULT_NIGHT_ORDER_NIGHT1];
    },

    reorderNightWakeUp(index, direction) {
        const order = gameConfig.nightWakeUpOrder;
        if (direction === 'up' && index > 0) {
            [order[index], order[index - 1]] = [order[index - 1], order[index]];
        } else if (direction === 'down' && index < order.length - 1) {
            [order[index], order[index + 1]] = [order[index + 1], order[index]];
        }
        UIManager.renderNightWakeUpOrderList(true);
    },

    endNight() {
        let deathAnnouncements = [];
        const uniqueVictimIds = [...new Set(narratorState.markedForDeathIds)];

        if (uniqueVictimIds.length > 0) {
            uniqueVictimIds.forEach(victimId => {
                const victim = players.find(p => p.id === victimId);
                if (!victim) return;

                if (victim.role.name === 'Alter Mann') {
                    victim.role.lives--;
                    if (victim.role.lives > 0) {
                        this.logToGame(`${victim.name} (Alter Mann) wurde angegriffen, hat aber noch ${victim.role.lives} Leben.`, 'text-green-400');
                        deathAnnouncements.push(`<strong class="text-green-400">${victim.name}</strong> wurde angegriffen, hat aber überlebt!`);
                        return;
                    }
                }

                if (victim.role.name === 'Hybrid') {
                    victim.role.name = 'Werwolf';
                    this.logToGame(`${victim.name} wurde angegriffen und ist jetzt ein Werwolf!`, 'text-purple-400');
                    deathAnnouncements.push(`<strong class="text-purple-400">${victim.name}</strong> wurde verwandelt!`);
                    UIManager.renderPlayerStatus();
                    return;
                }

                this.killPlayer(victim, 'von den Werwölfen gefressen');
                deathAnnouncements.push(`<strong class="text-red-500">${victim.name}</strong> wurde gefressen.`);
            });
        } else {
            deathAnnouncements.push("Niemand wurde diese Nacht gefressen.")
        }

        UIElements.narratorText.innerHTML = deathAnnouncements.join('<br>');

        if (this.checkForWin()) return;

        gameState.specialAbilitiesDisabled = false;
        this.processDaybreakActions();
    },

    processDaybreakActions() {
        if (this.checkForWin()) return;

        if (gameState.pendingDaybreakActions.length > 0) {
            const action = gameState.pendingDaybreakActions.shift();
            this.setupRevengeAction(action.type, action.victimId);
        } else {
            UIElements.startDayBtn.classList.remove('hidden');
        }
    },

    setupRevengeAction(type, victimId) {
        gameState.currentPhase = 'day-revenge';
        UIElements.narratorActionPanel.classList.remove('hidden');
        UIElements.confirmNarratorActionBtn.classList.add('hidden');
        UIElements.cancelNarratorActionBtn.classList.add('hidden');
        const victim = players.find(p => p.id === victimId);
        let prompt = '';
        let selectablePlayers = [];

        if (type === 'Jäger') {
            UIElements.currentNarratorAction.textContent = `Rache des Jägers (${victim.name})`;
            prompt = 'Wähle einen Spieler, den du mit in den Tod reißen willst.';
            selectablePlayers = players.filter(p => p.isAlive);
        } else if (type === 'Ritter') {
            UIElements.currentNarratorAction.textContent = `Rache des Ritters (${victim.name})`;
            prompt = 'Wähle den Werwolf zur Linken des Ritters.';
            selectablePlayers = players.filter(p => p.isAlive && p.role.name.includes('Werwolf'));
        }

        if (selectablePlayers.length === 0) {
            this.logToGame(`Keine gültigen Ziele für die Rache von ${victim.name}.`, 'text-gray-400');
            UIElements.narratorActionPanel.classList.add('hidden');
            this.processDaybreakActions();
            return;
        }

        UIElements.actionPrompt.textContent = prompt;
        UIElements.narratorPlayerSelection.innerHTML = selectablePlayers.map(p =>
            `<button class="bg-gray-600 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" data-player-id="${p.id}">${p.name}</button>`
        ).join('');

        UIElements.narratorPlayerSelection.querySelectorAll('button').forEach(btn => {
            btn.onclick = () => {
                const target = players.find(p => p.id === btn.dataset.playerId);
                this.killPlayer(target, `Rache von ${victim.name}`);
                if (type === 'Jäger') victim.role.uses--;
                UIElements.narratorActionPanel.classList.add('hidden');
                this.processDaybreakActions();
            };
        });
    },

    startDay() {
        UIElements.startDayBtn.classList.add('hidden');
        UIElements.dayPhaseControls.classList.remove('hidden');
        gameState.currentPhase = 'day-voting';
        narratorState.votes = {};
        players.filter(p => p.isAlive).forEach(p => { narratorState.votes[p.id] = 0; });
        const msg = "Das Dorf stimmt ab, wer gelyncht werden soll.";
        UIElements.narratorText.innerHTML = `<strong class="text-yellow-300">${msg}</strong>`;
        this.logToGame(msg, "text-yellow-300");
        UIManager.renderPlayerStatus();
    },

    adjustVote(playerId, amount) {
        if (gameState.currentPhase !== 'day-voting' || !players.find(p => p.id === playerId)?.isAlive) return;
        const currentVotes = narratorState.votes[playerId] || 0;
        narratorState.votes[playerId] = Math.max(0, currentVotes + amount);
        UIManager.renderPlayerStatus();
    },

    executeVote() {
        const votes = narratorState.votes;
        const maxVotes = Math.max(...Object.values(votes));
        if (maxVotes === 0) {
            const msg = "Keine Stimmen wurden abgegeben.";
            this.logToGame(msg, "text-gray-400");
            UIElements.narratorText.innerHTML = msg;
            return;
        }
        const mostVotedPlayers = Object.keys(votes).filter(id => votes[id] === maxVotes);

        if (mostVotedPlayers.length === 1) {
            const playerToKill = players.find(p => p.id === mostVotedPlayers[0]);

            if (playerToKill.role.name === 'Dorfdepp') {
                const msg = `${playerToKill.name} ist der Dorfdepp und kann nicht gelyncht werden!`;
                this.logToGame(msg, "text-green-400");
                UIElements.narratorText.innerHTML = `<strong class="text-green-400">${msg}</strong>`;
                this.forceNight();
                return;
            }

            if (playerToKill.role.name === 'Alter Mann') {
                gameState.specialAbilitiesDisabled = true;
                const msg = `${playerToKill.name} (Alter Mann) wurde gelyncht! Die Fähigkeiten der Dorfbewohner sind in der nächsten Nacht blockiert.`;
                this.logToGame(msg, "text-yellow-500");
                UIElements.narratorText.innerHTML = `<strong class="text-yellow-500">${msg}</strong>`;
            }

            this.logToGame(`${playerToKill.name} wurde mit ${maxVotes} Stimmen vom Dorf gelyncht.`, "text-red-500");
            this.killPlayer(playerToKill, 'vom Dorf gelyncht');

            if (this.checkForWin()) return;
            this.processDaybreakActions();

        } else {
            const playerNames = mostVotedPlayers.map(id => players.find(p => p.id === id).name).join(', ');
            const msg = `Gleichstand zwischen: ${playerNames}. Eine Neuwahl ist erforderlich.`;
            this.logToGame(msg, "text-yellow-400");
            UIElements.narratorText.innerHTML = `<strong class="text-yellow-400">${msg}</strong>`;
        }
    },

    handleTie() {
        const msg = "Neuwahl wurde ausgerufen. Alle Stimmen zurückgesetzt.";
        this.logToGame(msg, "text-yellow-400");
        UIElements.narratorText.innerHTML = `<strong class="text-yellow-400">${msg}</strong>`;
        players.filter(p => p.isAlive).forEach(p => { narratorState.votes[p.id] = 0; });
        UIManager.renderPlayerStatus();
    },

    forceNight() {
        if (this.checkForWin()) return;

        gameState.currentPhase = 'night-start';
        UIElements.dayPhaseControls.classList.add('hidden');
        UIElements.startNightBtn.classList.remove('hidden');
        UIElements.narratorText.innerHTML = "Die Abstimmung ist beendet. Bereit für die Nacht.";
        UIManager.renderPlayerStatus();
    },

    logToGame(message, colorClass = 'text-gray-400') {
        const time = new Date().toLocaleTimeString('de-DE');
        UIElements.gameLog.innerHTML += `<p class="${colorClass}">[${time}] ${message}</p>`;
        UIElements.gameLog.scrollTop = UIElements.gameLog.scrollHeight;
    },

    checkForWin() {
        if (!gameState.isGameActive) return true;

        const livingPlayers = players.filter(p => p.isAlive);
        if (livingPlayers.length === 0) return false;

        const livingWerewolves = livingPlayers.filter(p => p.role.name.includes('Werwolf'));
        const livingVillagers = livingPlayers.filter(p => !p.role.name.includes('Werwolf'));

        if (livingWerewolves.length === 0) {
            this.endGame('Die Dorfbewohner');
            return true;
        }

        if (livingWerewolves.length >= livingVillagers.length) {
            this.endGame('Die Werwölfe');
            return true;
        }

        return false;
    },

    endGame(winningTeam) {
        gameState.isGameActive = false;
        lastGameState = {
            players: JSON.parse(JSON.stringify(players)),
            gameLogHTML: UIElements.gameLog.innerHTML,
        };
        UIElements.winningTeamText.textContent = `${winningTeam} haben gewonnen!`;
        UIManager.toggleModal(UIElements.gameOverModal, true);
    },

    startNewRound() {
        UIManager.toggleModal(UIElements.gameOverModal, false);
        UIElements.narratorView.classList.add('hidden');
        UIElements.dayPhaseControls.classList.add('hidden');
        UIElements.startNightBtn.classList.remove('hidden');
        UIElements.backToMenuBtn.classList.add('hidden');
        UIElements.startMenu.classList.remove('hidden');
        this.initialize();
    },

    reviewLastGame() {
        if (!lastGameState) return;
        UIManager.toggleModal(UIElements.gameOverModal, false);
        UIElements.startMenu.classList.add('hidden');
        UIElements.narratorView.classList.remove('hidden');

        UIElements.startNightBtn.classList.add('hidden');
        UIElements.startDayBtn.classList.add('hidden');
        UIElements.dayPhaseControls.classList.add('hidden');
        UIElements.backToMenuBtn.classList.remove('hidden');

        UIElements.narratorText.innerHTML = "Rückblick auf das letzte Spiel";
        UIElements.gameLog.innerHTML = lastGameState.gameLogHTML;
        UIManager.renderPlayerStatus(lastGameState.players, true);
    },
};
let gameInProgress = false;
let confirmationEnabled = true;

function setGameInProgress(inProgress) {
    gameInProgress = inProgress;
}

function enablePageCloseConfirmation(enable = true) {
    confirmationEnabled = enable;
}

function shouldShowConfirmation() {
    return confirmationEnabled && gameInProgress;
}

// Handle beforeunload event for page close/reload confirmation
window.addEventListener('beforeunload', (e) => {
    if (shouldShowConfirmation()) {
        // Modern browsers use a generic message, but setting returnValue is still required
        e.preventDefault();
        e.returnValue = 'Ein Spiel ist im Gange. Sind Sie sicher, dass Sie die Seite verlassen möchten?';
        return e.returnValue;
    }
});

// Handle page visibility changes (useful for mobile browsers)
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && shouldShowConfirmation()) {
        // Store current game state in case of unexpected closure
        try {
            localStorage.setItem('werewolf_emergency_save', JSON.stringify({
                players: players || [],
                gamePhase: window.gamePhase || 'setup',
                currentRoleIndex: window.currentRoleIndex || 0,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.warn('Could not save emergency game state:', error);
        }
    }
});
function setupAllEventListeners() {
    UIElements.splashStartBtn.addEventListener('click', () => {
        UIElements.splashScreen.classList.add('hidden');
        UIElements.startMenu.classList.remove('hidden');
    });

    UIElements.decreasePlayerCount.addEventListener('click', () => GameLogic.changePlayerCount(-1));
    UIElements.increasePlayerCount.addEventListener('click', () => GameLogic.changePlayerCount(1));
    UIElements.startGameBtn.addEventListener('click', () => GameLogic.startGame());
    UIElements.advancedSettingsBtn.addEventListener('click', () => {
        UIManager.renderNightWakeUpOrderList();
        UIManager.toggleModal(UIElements.advancedSettingsModal, true);
    });
    UIElements.closeAdvancedSettingsModalBtn.addEventListener('click', () => UIManager.toggleModal(UIElements.advancedSettingsModal, false));
    UIElements.submitCurrentPlayerNameBtn.addEventListener('click', () => GameLogic.submitPlayerName());
    UIElements.roleSeenBtn.addEventListener('click', () => GameLogic.proceedToNextPlayer());

    UIElements.playerStatus.addEventListener('click', (e) => {
        const voteBtn = e.target.closest('button[data-vote-action]');
        if (voteBtn) {
            const { voteAction, playerId } = voteBtn.dataset;
            const amount = voteAction === 'plus' ? 1 : -1;
            GameLogic.adjustVote(playerId, amount);
            return;
        }

        const detailsBtn = e.target.closest('[data-action="show-details"]');
        if (detailsBtn) {
            const player = players.find(p => p.id === detailsBtn.dataset.playerId) || lastGameState?.players.find(p => p.id === detailsBtn.dataset.playerId);
            if (player) UIManager.showPlayerZoomModal(player);
        }
    });

    UIElements.closeInfoModalBtn.addEventListener('click', () => UIManager.toggleModal(UIElements.roleInfoModal, false));
    UIElements.closeSummaryModalBtn.addEventListener('click', () => UIManager.toggleModal(UIElements.rolesSummaryModal, false));

    UIElements.editOrderBtn.addEventListener('click', () => {
        UIElements.editOrderBtn.classList.add('hidden');
        UIElements.saveOrderBtn.classList.remove('hidden');
        UIManager.renderNightWakeUpOrderList(true);
    });

    UIElements.saveOrderBtn.addEventListener('click', () => {
        UIElements.saveOrderBtn.classList.add('hidden');
        UIElements.editOrderBtn.classList.remove('hidden');
        UIManager.renderNightWakeUpOrderList(false);
    });

    UIElements.resetOrderBtn.addEventListener('click', () => {
        GameLogic.resetNightOrder();
        const isEditing = !UIElements.saveOrderBtn.classList.contains('hidden');
        UIManager.renderNightWakeUpOrderList(isEditing);
    });

    UIElements.nightWakeUpOrderList.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-action]');
        if (!button) return;
        const item = button.closest('.order-item');
        if (!item) return;

        const isEditing = !UIElements.saveOrderBtn.classList.contains('hidden');
        if (!isEditing) return;

        const index = parseInt(item.dataset.index, 10);
        const action = button.dataset.action;

        GameLogic.reorderNightWakeUp(index, action);
    });

    UIElements.startNightBtn.addEventListener('click', () => GameLogic.startNight());
    UIElements.nextStepBtn.addEventListener('click', () => GameLogic.advanceToNextRole());
    UIElements.confirmNarratorActionBtn.addEventListener('click', () => GameLogic.confirmRoleAction());
    UIElements.cancelNarratorActionBtn.addEventListener('click', () => {
        if (UIElements.cancelNarratorActionBtn.textContent === "Zurück") {
            GameLogic.setupWitchAction();
        } else {
            GameLogic.advanceToNextRole()
        }
    });

    UIElements.decreaseHealPotions.addEventListener('click', () => GameLogic.changePotionCount('heal', -1));
    UIElements.increaseHealPotions.addEventListener('click', () => GameLogic.changePotionCount('heal', 1));
    UIElements.decreaseKillPotions.addEventListener('click', () => GameLogic.changePotionCount('kill', -1));
    UIElements.increaseKillPotions.addEventListener('click', () => GameLogic.changePotionCount('kill', 1));
    UIElements.decreaseHunterUses.addEventListener('click', () => GameLogic.changeHunterUses(-1));
    UIElements.increaseHunterUses.addEventListener('click', () => GameLogic.changeHunterUses(1));

    UIElements.startDayBtn.addEventListener('click', () => GameLogic.startDay());
    UIElements.executeVoteBtn.addEventListener('click', () => GameLogic.executeVote());
    UIElements.handleTieBtn.addEventListener('click', () => GameLogic.handleTie());
    UIElements.forceNightBtn.addEventListener('click', () => GameLogic.forceNight());
    UIElements.newRoundBtn.addEventListener('click', () => GameLogic.startNewRound());
    UIElements.reviewLastGameBtn.addEventListener('click', () => GameLogic.reviewLastGame());
    UIElements.backToMenuBtn.addEventListener('click', () => GameLogic.startNewRound());
    UIElements.hideConsoleToggleInput.addEventListener('change', (e) => {
        UIElements.gameLogWrapper.classList.toggle('hidden', !e.target.checked);
    });
}

window.onload = () => {
    initializeDOMElements();
    GameLogic.initialize();
    setupAllEventListeners();

    // Check for emergency save on page load
    try {
        const emergencySave = localStorage.getItem('werewolf_emergency_save');
        if (emergencySave) {
            const saveData = JSON.parse(emergencySave);
            const timeDiff = Date.now() - saveData.timestamp;

            // Only offer to restore if save is less than 1 hour old
            if (timeDiff < 3600000 && saveData.players && saveData.players.length > 0) {
                const restore = confirm('Es wurde ein unterbrochenes Spiel gefunden. Möchten Sie es wiederherstellen?');
                if (restore) {
                    // Restore game state logic would go here
                    console.log('Restoring emergency save:', saveData);
                    setGameInProgress(true);
                }
            }

            // Clear the emergency save
            localStorage.removeItem('werewolf_emergency_save');
        }
    } catch (error) {
        console.warn('Could not check for emergency save:', error);
    }
};