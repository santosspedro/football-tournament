document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const playerInput = document.getElementById('player-name');
    const addPlayerBtn = document.getElementById('add-player');
    const playerList = document.getElementById('player-list');
    const playerCountSpan = document.getElementById('player-count');
    
    const teamInput = document.getElementById('team-name');
    const addTeamBtn = document.getElementById('add-team');
    const teamList = document.getElementById('team-list');
    const teamCountSpan = document.getElementById('team-count');
    
    const tournamentType = document.getElementById('tournament-type');
    const matchDuration = document.getElementById('match-duration');
    const rulesTextarea = document.getElementById('rules');
    const generateTeamsBtn = document.getElementById('generate-teams');
    const sortedTeamsDiv = document.getElementById('sorted-teams');

    // Data Arrays
    let players = [];
    let teams = [];

    // Event Listeners
    addPlayerBtn.addEventListener('click', addPlayer);
    addTeamBtn.addEventListener('click', addTeam);
    generateTeamsBtn.addEventListener('click', generateTournament);
    
    // Allow Enter key to add players/teams
    playerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addPlayer();
    });
    
    teamInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTeam();
    });

    // Functions
    function addPlayer() {
        const playerName = playerInput.value.trim();
        if (playerName && !players.includes(playerName)) {
            players.push(playerName);
            renderPlayers();
            playerInput.value = '';
            updatePlayerCount();
        } else if (players.includes(playerName)) {
            alert('Este jogador já foi adicionado!');
        }
    }

    function addTeam() {
        const teamName = teamInput.value.trim();
        if (teamName && !teams.includes(teamName)) {
            teams.push(teamName);
            renderTeams();
            teamInput.value = '';
            updateTeamCount();
        } else if (teams.includes(teamName)) {
            alert('Este time já foi adicionado!');
        }
    }

    function renderPlayers() {
        playerList.innerHTML = '';
        players.forEach((player, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${player}</span>
                <button class="remove-btn" onclick="removePlayer(${index})">Remover</button>
            `;
            playerList.appendChild(li);
        });
    }

    function renderTeams() {
        teamList.innerHTML = '';
        teams.forEach((team, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${team}</span>
                <button class="remove-btn" onclick="removeTeam(${index})">Remover</button>
            `;
            teamList.appendChild(li);
        });
    }

    function updatePlayerCount() {
        playerCountSpan.textContent = players.length;
    }

    function updateTeamCount() {
        teamCountSpan.textContent = teams.length;
    }

    // Global functions for remove buttons
    window.removePlayer = function(index) {
        players.splice(index, 1);
        renderPlayers();
        updatePlayerCount();
    };

    window.removeTeam = function(index) {
        teams.splice(index, 1);
        renderTeams();
        updateTeamCount();
    };

    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    function generateTournament() {
        if (players.length === 0) {
            alert('Por favor, adicione pelo menos um jogador!');
            return;
        }

        if (teams.length === 0) {
            alert('Por favor, adicione pelo menos um time!');
            return;
        }

        if (players.length < teams.length) {
            alert('O número de jogadores deve ser maior ou igual ao número de times!');
            return;
        }

        // Add loading state
        generateTeamsBtn.classList.add('loading');
        generateTeamsBtn.textContent = 'Sorteando...';

        setTimeout(() => {
            const shuffledPlayers = shuffleArray(players);
            const sortedResults = distributePlayersToTeams(shuffledPlayers, teams);
            
            displayResults(sortedResults);
            generateMatchSchedule(sortedResults);
            
            // Remove loading state
            generateTeamsBtn.classList.remove('loading');
            generateTeamsBtn.textContent = '🎲 Sortear Equipes';
        }, 1000);
    }

    function distributePlayersToTeams(shuffledPlayers, teams) {
        const results = {};
        teams.forEach(team => {
            results[team] = [];
        });

        // Distribute players evenly
        shuffledPlayers.forEach((player, index) => {
            const teamIndex = index % teams.length;
            const teamName = teams[teamIndex];
            results[teamName].push(player);
        });

        return results;
    }

    function displayResults(results) {
        const type = tournamentType.value;
        const duration = matchDuration.value;
        const rules = rulesTextarea.value.trim();

        let html = `
            <h3>🎉 Equipes Sorteadas!</h3>
            <div style="margin-bottom: 20px;">
                <strong>Tipo de Torneio:</strong> ${getTournamentTypeName(type)}<br>
                <strong>Duração das Partidas:</strong> ${duration === 'custom' ? 'Personalizado' : duration + ' minutos'}<br>
                ${rules ? `<strong>Regras Especiais:</strong> ${rules}<br>` : ''}
            </div>
        `;

        const ul = document.createElement('ul');
        for (const team in results) {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${team}:</strong> ${results[team].join(', ')}`;
            ul.appendChild(li);
        }

        sortedTeamsDiv.innerHTML = html;
        sortedTeamsDiv.appendChild(ul);
    }

    function getTournamentTypeName(type) {
        switch(type) {
            case 'round-robin': return 'Pontos Corridos (Todos contra todos)';
            case 'knockout': return 'Mata-mata (Eliminação direta)';
            case 'groups': return 'Fase de Grupos + Mata-mata';
            default: return type;
        }
    }

    function generateMatchSchedule(results) {
        const type = tournamentType.value;
        const teamNames = Object.keys(results);
        
        if (teamNames.length < 2) {
            return;
        }

        let scheduleHtml = '<div style="margin-top: 30px;"><h4>📅 Cronograma de Partidas</h4>';

        if (type === 'round-robin') {
            scheduleHtml += generateRoundRobinSchedule(teamNames);
        } else if (type === 'knockout') {
            scheduleHtml += generateKnockoutSchedule(teamNames);
        } else if (type === 'groups') {
            scheduleHtml += generateGroupsSchedule(teamNames);
        }

        scheduleHtml += '</div>';
        sortedTeamsDiv.innerHTML += scheduleHtml;
    }

    function generateRoundRobinSchedule(teams) {
        let html = '<div style="background: #f0f8ff; padding: 15px; border-radius: 10px; margin-top: 15px;">';
        html += '<strong>Todas as equipes jogam entre si:</strong><br><br>';
        
        let matchNumber = 1;
        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
                html += `<div style="margin-bottom: 8px;">Partida ${matchNumber}: <strong>${teams[i]}</strong> vs <strong>${teams[j]}</strong></div>`;
                matchNumber++;
            }
        }
        
        html += `<br><strong>Total de partidas: ${matchNumber - 1}</strong>`;
        html += '</div>';
        return html;
    }

    function generateKnockoutSchedule(teams) {
        let html = '<div style="background: #fff5f5; padding: 15px; border-radius: 10px; margin-top: 15px;">';
        html += '<strong>Sistema de eliminação direta:</strong><br><br>';
        
        const shuffledTeams = shuffleArray(teams);
        let round = 1;
        let currentTeams = [...shuffledTeams];
        
        while (currentTeams.length > 1) {
            html += `<strong>Fase ${round}:</strong><br>`;
            const nextRound = [];
            
            for (let i = 0; i < currentTeams.length; i += 2) {
                if (i + 1 < currentTeams.length) {
                    html += `${currentTeams[i]} vs ${currentTeams[i + 1]}<br>`;
                    nextRound.push(`Vencedor(${currentTeams[i]} vs ${currentTeams[i + 1]})`);
                } else {
                    html += `${currentTeams[i]} (classificado automaticamente)<br>`;
                    nextRound.push(currentTeams[i]);
                }
            }
            
            html += '<br>';
            currentTeams = nextRound;
            round++;
        }
        
        html += '</div>';
        return html;
    }

    function generateGroupsSchedule(teams) {
        let html = '<div style="background: #f0fff4; padding: 15px; border-radius: 10px; margin-top: 15px;">';
        html += '<strong>Fase de Grupos + Mata-mata:</strong><br><br>';
        
        const groupSize = Math.min(4, Math.ceil(teams.length / 2));
        const numGroups = Math.ceil(teams.length / groupSize);
        const shuffledTeams = shuffleArray(teams);
        
        for (let g = 0; g < numGroups; g++) {
            const groupTeams = shuffledTeams.slice(g * groupSize, (g + 1) * groupSize);
            html += `<strong>Grupo ${String.fromCharCode(65 + g)}:</strong> ${groupTeams.join(', ')}<br>`;
        }
        
        html += '<br><em>Após a fase de grupos, os melhores de cada grupo se classificam para o mata-mata.</em>';
        html += '</div>';
        return html;
    }

    // Initialize counters
    updatePlayerCount();
    updateTeamCount();
});

