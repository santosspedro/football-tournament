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
    let currentTournament = null;
    let matches = [];

    // LocalStorage keys
    const STORAGE_KEYS = {
        PLAYERS: 'fifa_tournament_players',
        TEAMS: 'fifa_tournament_teams',
        TOURNAMENT_TYPE: 'fifa_tournament_type',
        MATCH_DURATION: 'fifa_tournament_duration',
        RULES: 'fifa_tournament_rules',
        CURRENT_TOURNAMENT: 'fifa_current_tournament',
        MATCHES: 'fifa_tournament_matches'
    };

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

    // LocalStorage Functions
    function saveTournamentData() {
        try {
            localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
            localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
            localStorage.setItem(STORAGE_KEYS.TOURNAMENT_TYPE, tournamentType.value);
            localStorage.setItem(STORAGE_KEYS.MATCH_DURATION, matchDuration.value);
            localStorage.setItem(STORAGE_KEYS.RULES, rulesTextarea.value);
            if (currentTournament) {
                localStorage.setItem(STORAGE_KEYS.CURRENT_TOURNAMENT, JSON.stringify(currentTournament));
            }
            if (matches.length > 0) {
                localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
            }
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
        }
    }

    function loadTournamentData() {
        try {
            const savedPlayers = localStorage.getItem(STORAGE_KEYS.PLAYERS);
            const savedTeams = localStorage.getItem(STORAGE_KEYS.TEAMS);
            const savedTournamentType = localStorage.getItem(STORAGE_KEYS.TOURNAMENT_TYPE);
            const savedMatchDuration = localStorage.getItem(STORAGE_KEYS.MATCH_DURATION);
            const savedRules = localStorage.getItem(STORAGE_KEYS.RULES);
            const savedCurrentTournament = localStorage.getItem(STORAGE_KEYS.CURRENT_TOURNAMENT);
            const savedMatches = localStorage.getItem(STORAGE_KEYS.MATCHES);

            if (savedPlayers) {
                players = JSON.parse(savedPlayers);
                renderPlayers();
                updatePlayerCount();
            }

            if (savedTeams) {
                teams = JSON.parse(savedTeams);
                renderTeams();
                updateTeamCount();
            }

            if (savedTournamentType) {
                tournamentType.value = savedTournamentType;
            }

            if (savedMatchDuration) {
                matchDuration.value = savedMatchDuration;
            }

            if (savedRules) {
                rulesTextarea.value = savedRules;
            }

            if (savedCurrentTournament) {
                currentTournament = JSON.parse(savedCurrentTournament);
                displayResults(currentTournament);
            }

            if (savedMatches) {
                matches = JSON.parse(savedMatches);
                if (currentTournament) {
                    displayMatchesWithResults();
                }
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    }

    function clearTournamentData() {
        if (confirm('Tem certeza que deseja limpar todos os dados salvos?')) {
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            
            // Reset all data
            players = [];
            teams = [];
            currentTournament = null;
            matches = [];
            
            // Reset UI
            renderPlayers();
            renderTeams();
            updatePlayerCount();
            updateTeamCount();
            tournamentType.value = 'round-robin';
            matchDuration.value = '5';
            rulesTextarea.value = '';
            sortedTeamsDiv.innerHTML = '<p style="text-align: center; color: #718096; font-style: italic;">Adicione jogadores e times, depois clique em "Sortear Equipes" para ver os resultados!</p>';
            
            alert('Dados limpos com sucesso!');
        }
    }

    // Functions
    function addPlayer() {
        const playerName = playerInput.value.trim();
        if (playerName && !players.includes(playerName)) {
            players.push(playerName);
            renderPlayers();
            playerInput.value = '';
            updatePlayerCount();
            saveTournamentData();
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
            saveTournamentData();
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
        saveTournamentData();
    };

    window.removeTeam = function(index) {
        teams.splice(index, 1);
        renderTeams();
        updateTeamCount();
        saveTournamentData();
    };

    // Global function for updating match results
    window.updateMatchResult = function(matchIndex, homeScore, awayScore) {
        if (matches[matchIndex]) {
            matches[matchIndex].homeScore = parseInt(homeScore) || 0;
            matches[matchIndex].awayScore = parseInt(awayScore) || 0;
            matches[matchIndex].played = true;
            saveTournamentData();
            
            // Update the display
            displayMatchesWithResults();
        }
    };

    // Global function for clearing tournament data
    window.clearData = function() {
        clearTournamentData();
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
            
            currentTournament = sortedResults;
            displayResults(sortedResults);
            generateMatchSchedule(sortedResults);
            
            // Save tournament data
            saveTournamentData();
            
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
            <div style="margin-bottom: 20px;">
                <button onclick="clearData()" style="background: #e53e3e; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; margin-right: 10px;">🗑️ Limpar Dados</button>
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

        // Reset matches array
        matches = [];

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
        
        // Save matches
        saveTournamentData();
    }

    function generateRoundRobinSchedule(teams) {
        let html = '<div style="background: #f0f8ff; padding: 15px; border-radius: 10px; margin-top: 15px;">';
        html += '<strong>Todas as equipes jogam entre si:</strong><br><br>';
        
        let matchNumber = 1;
        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
                const match = {
                    id: matchNumber - 1,
                    homeTeam: teams[i],
                    awayTeam: teams[j],
                    homeScore: 0,
                    awayScore: 0,
                    played: false
                };
                matches.push(match);
                
                html += `
                    <div style="margin-bottom: 12px; padding: 10px; background: white; border-radius: 5px; border: 1px solid #e2e8f0;">
                        <div style="margin-bottom: 5px;"><strong>Partida ${matchNumber}:</strong> ${teams[i]} vs ${teams[j]}</div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <input type="number" id="home-${matchNumber-1}" placeholder="0" min="0" style="width: 50px; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
                            <span>x</span>
                            <input type="number" id="away-${matchNumber-1}" placeholder="0" min="0" style="width: 50px; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
                            <button onclick="updateMatchResult(${matchNumber-1}, document.getElementById('home-${matchNumber-1}').value, document.getElementById('away-${matchNumber-1}').value)" style="background: #38a169; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer;">Salvar</button>
                        </div>
                    </div>
                `;
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
        let matchNumber = 1;
        
        while (currentTeams.length > 1) {
            html += `<strong>Fase ${round}:</strong><br>`;
            const nextRound = [];
            
            for (let i = 0; i < currentTeams.length; i += 2) {
                if (i + 1 < currentTeams.length) {
                    const match = {
                        id: matchNumber - 1,
                        homeTeam: currentTeams[i],
                        awayTeam: currentTeams[i + 1],
                        homeScore: 0,
                        awayScore: 0,
                        played: false,
                        round: round
                    };
                    matches.push(match);
                    
                    html += `
                        <div style="margin-bottom: 12px; padding: 10px; background: white; border-radius: 5px; border: 1px solid #e2e8f0;">
                            <div style="margin-bottom: 5px;">${currentTeams[i]} vs ${currentTeams[i + 1]}</div>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <input type="number" id="home-${matchNumber-1}" placeholder="0" min="0" style="width: 50px; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
                                <span>x</span>
                                <input type="number" id="away-${matchNumber-1}" placeholder="0" min="0" style="width: 50px; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
                                <button onclick="updateMatchResult(${matchNumber-1}, document.getElementById('home-${matchNumber-1}').value, document.getElementById('away-${matchNumber-1}').value)" style="background: #38a169; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer;">Salvar</button>
                            </div>
                        </div>
                    `;
                    nextRound.push(`Vencedor(${currentTeams[i]} vs ${currentTeams[i + 1]})`);
                    matchNumber++;
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
        let matchNumber = 1;
        
        for (let g = 0; g < numGroups; g++) {
            const groupTeams = shuffledTeams.slice(g * groupSize, (g + 1) * groupSize);
            html += `<strong>Grupo ${String.fromCharCode(65 + g)}:</strong> ${groupTeams.join(', ')}<br>`;
            
            // Generate matches within the group
            for (let i = 0; i < groupTeams.length; i++) {
                for (let j = i + 1; j < groupTeams.length; j++) {
                    const match = {
                        id: matchNumber - 1,
                        homeTeam: groupTeams[i],
                        awayTeam: groupTeams[j],
                        homeScore: 0,
                        awayScore: 0,
                        played: false,
                        group: String.fromCharCode(65 + g)
                    };
                    matches.push(match);
                    
                    html += `
                        <div style="margin-bottom: 8px; padding: 8px; background: white; border-radius: 3px; border: 1px solid #e2e8f0;">
                            <div style="margin-bottom: 5px;">${groupTeams[i]} vs ${groupTeams[j]}</div>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <input type="number" id="home-${matchNumber-1}" placeholder="0" min="0" style="width: 50px; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
                                <span>x</span>
                                <input type="number" id="away-${matchNumber-1}" placeholder="0" min="0" style="width: 50px; padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
                                <button onclick="updateMatchResult(${matchNumber-1}, document.getElementById('home-${matchNumber-1}').value, document.getElementById('away-${matchNumber-1}').value)" style="background: #38a169; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer;">Salvar</button>
                            </div>
                        </div>
                    `;
                    matchNumber++;
                }
            }
            html += '<br>';
        }
        
        html += '<em>Após a fase de grupos, os melhores de cada grupo se classificam para o mata-mata.</em>';
        html += '</div>';
        return html;
    }

    function displayMatchesWithResults() {
        if (!currentTournament || matches.length === 0) return;
        
        // Re-generate the schedule with saved results
        generateMatchSchedule(currentTournament);
        
        // Update input fields with saved results
        matches.forEach((match, index) => {
            if (match.played) {
                const homeInput = document.getElementById(`home-${index}`);
                const awayInput = document.getElementById(`away-${index}`);
                if (homeInput) homeInput.value = match.homeScore;
                if (awayInput) awayInput.value = match.awayScore;
            }
        });
    }

    // Save tournament settings when they change
    tournamentType.addEventListener('change', saveTournamentData);
    matchDuration.addEventListener('change', saveTournamentData);
    rulesTextarea.addEventListener('input', saveTournamentData);

    // Load data on page load
    loadTournamentData();

    // Initialize counters
    updatePlayerCount();
    updateTeamCount();
});

