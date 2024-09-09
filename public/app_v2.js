const tg = window.Telegram.WebApp;

document.addEventListener('DOMContentLoaded', () => {
    let gains = 0;
    let energy = 1000;
    let level = 1;
    let gainsPerRep = 1;
    let gainsPerDay = 0;
    let boostMultiplier = 1;

    const gainsDisplay = document.getElementById('gains-display');
    const energyBar = document.getElementById('energy-bar');
    const energyStatus = document.getElementById('energy-status');
    const levelDisplay = document.getElementById('level-display');
    const gainsPerRepDisplay = document.querySelector('.status-item:nth-child(1) .status-value');
    const statusDisplay = document.querySelector('.status-item:nth-child(2) .status-value');
    const gainsPerDayDisplay = document.querySelector('.status-item:nth-child(3) .status-value');
    const pumpMeContainer = document.getElementById('pump-me-container');
    const character = document.getElementById('character');

    function updateLevel() {
        const currentLevel = fitnessLevels.find(l => gains >= l.minGains && gains <= l.maxGains);
        if (currentLevel && currentLevel.level !== level) {
            level = currentLevel.level;
            gainsPerRep = currentLevel.gainsPerRep;
            gainsPerDay = currentLevel.gainsPerDay;
            console.log(`Leveled up to ${currentLevel.name}!`);
        }
    }

    function updateUI() {
        gainsDisplay.textContent = gains.toLocaleString();
        energyBar.style.width = `${(energy / 1000) * 100}%`;
        energyStatus.textContent = energy >= 200 ? 'Rested' : 'Tired';
        const currentLevel = fitnessLevels[level - 1];
        levelDisplay.textContent = `${currentLevel.name} (Level ${level}/10)`;
        gainsPerRepDisplay.innerHTML = `<img src="/images/bicep-icon-yellow.png" alt="Gains Icon" class="gains-icon"> +${gainsPerRep * boostMultiplier}`;
        gainsPerDayDisplay.innerHTML = `<img src="/images/bicep-icon-yellow.png" alt="Gains Icon" class="gains-icon"> +${gainsPerDay * boostMultiplier}`;
    }

    function saveUserData() {
        const userId = tg.initDataUnsafe?.user?.id;
        const username = tg.initDataUnsafe?.user?.username || 'Anonymous';
        fetch('/api/saveUserData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, username, gains, level }),
        })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => console.log('User data saved:', data))
        .catch(error => console.error('Error saving user data:', error));
    }

    function loadUserData() {
      const userId = tg.initDataUnsafe?.user?.id;
      if (userId) {
        fetch(`/api/getUserData?userId=${userId}`)
          .then(response => response.json())
          .then(data => {
            gains = data.gains || 0;
            level = data.level || 1;
            updateUI();
          })
          .catch(error => console.error('Error loading user data:', error));
      }
    }

    function pump(e) {
        e.preventDefault();
        e.stopPropagation();
        if (energy > 0) {
            gains += gainsPerRep * boostMultiplier;
            energy = Math.max(0, energy - 1);
            updateLevel();
            updateUI();
            saveUserData();

            character.style.transform = 'scale(1.1)';
            setTimeout(() => {
                character.style.transform = 'scale(1)';
            }, 100);
        }
    }

    function updateLeaderboard() {
      fetch('/api/leaderboard')
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('Leaderboard data:', data);
          const leaderboardBody = document.getElementById('leaderboard-body');
          if (leaderboardBody) {
            leaderboardBody.innerHTML = '';
            rank=0;
            data.forEach((user) => {
              rank=rank+1;
              const row = document.createElement('tr');
              row.innerHTML = `
                <td>${rank}</td>
                <td>${user.username}</td>
                <td>${user.gains.toLocaleString()}</td>
              `;
              leaderboardBody.appendChild(row);
            });
          } else {
            console.error('Leaderboard body element not found');
          }
        })
        .catch(error => {
          console.error('Error updating leaderboard:', error);
          const leaderboardBody = document.getElementById('leaderboard-body');
          if (leaderboardBody) {
            leaderboardBody.innerHTML = '<tr><td colspan="3">Error loading leaderboard. Please try again later.</td></tr>';
          }
        });
    }
      
// Call updateLeaderboard when the Top Pumpers page is shown
document.getElementById('top-pumpers-btn').addEventListener('click', updateLeaderboard);

// Update leaderboard every 30 seconds if on the Top Pumpers page
setInterval(() => {
  if (document.getElementById('top-pumpers-page').style.display !== 'none') {
    updateLeaderboard();
  }
}, 30000);

    function preventDefaultBehavior(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    // Prevent selection and default behaviors
    document.body.addEventListener('touchstart', preventDefaultBehavior, { passive: false });
    document.body.addEventListener('touchmove', preventDefaultBehavior, { passive: false });
    document.body.addEventListener('touchend', preventDefaultBehavior, { passive: false });
    document.body.addEventListener('contextmenu', preventDefaultBehavior);
    document.body.addEventListener('selectstart', preventDefaultBehavior);
    document.body.addEventListener('dragstart', preventDefaultBehavior);

    // Make character and PUMP ME clickable
    [pumpMeContainer, character].forEach(element => {
        if (element) {
            element.addEventListener('touchstart', pump, { passive: false });
            element.addEventListener('mousedown', pump);
        }
    });

    // Navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');

    navButtons.forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Stop event from bubbling up
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            pages.forEach(page => page.style.display = 'none');
            pages[index].style.display = 'flex';
            if (btn.id === 'top-pumpers-btn') {
                updateLeaderboard();
            }
        });
    });

    // Remove preventDefault from nav buttons
    document.querySelector('nav').addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
    document.querySelector('nav').addEventListener('touchmove', (e) => e.stopPropagation(), { passive: true });
    document.querySelector('nav').addEventListener('touchend', (e) => e.stopPropagation(), { passive: true });

    // Energy regeneration
    setInterval(() => {
        if (energy < 1000) {
            energy = Math.min(1000, energy + 1);
            updateUI();
        }
    }, 1000);

    // Gains per day
    setInterval(() => {
        gains += gainsPerDay * boostMultiplier / (24 * 60 * 60);
        updateLevel();
        updateUI();
    }, 1000);

    // Load user data on startup
    loadUserData();

    // Initial UI update
    updateUI();

    tg.ready();
    tg.expand();
});