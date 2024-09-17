const tg = window.Telegram.WebApp;

let gains = 0;
let energy = 1000;
let level = 1;
let gainsPerRep = 1;
let gainsPerDay = 0;
let boostMultiplier = 1;

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
    const gainsDisplay = document.getElementById('gains-display');
    const energyBar = document.getElementById('energy-bar');
    const energyStatus = document.getElementById('energy-status');
    const levelDisplay = document.getElementById('level-display');
    const gainsPerRepDisplay = document.querySelector('.status-item:nth-child(1) .status-value');
    const gainsPerDayDisplay = document.querySelector('.status-item:nth-child(3) .status-value');

    if (gainsDisplay) gainsDisplay.textContent = gains.toLocaleString();
    if (energyBar) energyBar.style.width = `${(energy / 1000) * 100}%`;
    if (energyStatus) energyStatus.textContent = energy >= 200 ? 'Rested' : 'Tired';
    if (levelDisplay) {
        const currentLevel = fitnessLevels[level - 1];
        levelDisplay.textContent = `${currentLevel.name} (Level ${level}/10)`;
    }
    if (gainsPerRepDisplay) gainsPerRepDisplay.innerHTML = `<img src="/public/images/bicep-icon-yellow.png" alt="Gains Icon" class="gains-icon"> +${gainsPerRep * boostMultiplier}`;
    if (gainsPerDayDisplay) gainsPerDayDisplay.innerHTML = `<img src="/public/images/bicep-icon-yellow.png" alt="Gains Icon" class="gains-icon"> +${gainsPerDay * boostMultiplier}`;
}

function saveUserData() {
    const userId = tg.initDataUnsafe?.user?.id;
    const username = tg.initDataUnsafe?.user?.username || 'Anonymous';
    fetch('/api/saveUserData', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, username, gains, level }),
    })
    .then(response => response.json())
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

        const character = document.getElementById('character');
        if (character) {
            character.style.transform = 'scale(1.1)';
            setTimeout(() => { character.style.transform = 'scale(1)'; }, 100);
        }
    }
}

function updateLeaderboard() {
    fetch('/api/leaderboard')
    .then(response => response.json())
    .then(data => {
        const leaderboardBody = document.getElementById('leaderboard-body');
        if (leaderboardBody) {
            leaderboardBody.innerHTML = '';
            data.forEach((user, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${user.username}</td>
                    <td>${user.gains.toLocaleString()}</td>
                `;
                leaderboardBody.appendChild(row);
            });
        }
    })
    .catch(error => console.error('Error updating leaderboard:', error));
}

function displayBoosts(category) {
    if (boostItems) {
        boostItems.innerHTML = '';
        window.boosts[category].forEach(boost => {
            const boostElement = document.createElement('div');
            boostElement.className = 'boost-item';
            boostElement.innerHTML = `
                <div class="boost-icon">${boost.icon}</div>
                <div class="boost-name">${boost.name}</div>
                <div class="boost-description">${boost.description}</div>
                <div class="boost-price">
                    <img src="/public/images/flex-icon.png" alt="Flex Icon" class="flex-icon">
                    <span>${boost.price}</span>
                </div>
            `;
            boostItems.appendChild(boostElement);
            
            // Add click event listener to the boost price
            const priceElement = boostElement.querySelector('.boost-price');
            priceElement.addEventListener('click', function() {
                // Here you can add the logic for what happens when the price is clicked
                console.log(`Boost "${boost.name}" price clicked!`);
                // For example, you might want to purchase the boost here
            });
        });
    }
}

function setupBoostsCategoryButtons() {
    console.log("Setting up boost category buttons");
    const categoryButtons = document.querySelectorAll('#boosts-page .category-btn');
    console.log("Found", categoryButtons.length, "category buttons");
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Category button clicked:", button.dataset.category);
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            displayBoosts(button.dataset.category);
        });
    });
}

function initializeBoostsPage() {
    console.log("Initializing Boosts page");
    const defaultCategory = 'nutrition';
    const categoryButtons = document.querySelectorAll('#boosts-page .category-btn');
    categoryButtons.forEach(btn => btn.classList.remove('active'));
    const defaultButton = document.querySelector(`#boosts-page .category-btn[data-category="${defaultCategory}"]`);
    if (defaultButton) {
        defaultButton.classList.add('active');
    }
    displayBoosts(defaultCategory);
    setupBoostsCategoryButtons();
}

function updateProfilePage() {
  const attributes = [
      { name: "Strength", value: 60 },
      { name: "Endurance", value: 45 },
      { name: "Agility", value: 30 },
      { name: "Flexibility", value: 50 },
      { name: "Recovery", value: 70 }
  ];

  const attributesContainer = document.getElementById('attributes-container');
  if (attributesContainer) {
      attributesContainer.innerHTML = '';
      attributes.forEach(attr => {
          const attrElement = document.createElement('div');
          attrElement.className = 'attribute-item';
          attrElement.innerHTML = `
              <div class="attribute-name">${attr.name}</div>
              <div class="attribute-bar-container">
                  <div class="attribute-bar" style="width: ${attr.value}%"></div>
              </div>
              <div class="attribute-value">${attr.value}</div>
          `;
          attributesContainer.appendChild(attrElement);
      });
  }

  // This is a placeholder for active boosts. In a real application, 
  // you would fetch this data from your backend or local storage.
  const activeBoosts = [
      { name: "Protein Shake", duration: "2h 30m" },
      { name: "Pre-workout", duration: "45m" }
  ];

  const activeBoostsContainer = document.getElementById('active-boosts-container');
  if (activeBoostsContainer) {
      activeBoostsContainer.innerHTML = '';
      if (activeBoosts.length > 0) {
          activeBoosts.forEach(boost => {
              const boostElement = document.createElement('div');
              boostElement.className = 'active-boost-item';
              boostElement.innerHTML = `
                  <div class="boost-name">${boost.name}</div>
                  <div class="boost-duration">${boost.duration}</div>
              `;
              activeBoostsContainer.appendChild(boostElement);
          });
      } else {
          activeBoostsContainer.innerHTML = '<p>No active boosts</p>';
      }
  }
}

const socialTasks = [
  {     
    id: 'instagram',
    name: "Follow us on Instagram", 
    icon: "instagram-icon.png", 
    reward: 5000, 
    completed: false,
    link: "https://www.instagram.com/pumpme.me/" 
},
  { name: "Join our TG channel", icon: "telegram-icon.png", reward: 5000, completed: true },
  {
    id: 'twitter',
    name: "Follow our X account",
    icon: "twitter-icon.png",
    reward: 5000,
    completed: false,
    link: "https://x.com/Pumpme_me"
  },
  { name: "Refer a friend", icon: "refer-friend-icon.png", reward: 5000, completed: false }
];

function updateSocialPage() {
    const socialTasksContainer = document.getElementById('social-tasks-container');
    if (socialTasksContainer) {
        socialTasksContainer.innerHTML = '';
        socialTasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = 'social-task';
            taskElement.innerHTML = `
                <img src="/public/images/${task.icon}" alt="${task.name}" class="social-task-icon">
                <div class="social-task-content">
                    <div class="social-task-name">${task.name}</div>
                    <div class="social-task-reward">
                        <img src="/public/images/bicep-icon-yellow.png" alt="Gains" class="gains-icon">
                        +${task.reward.toLocaleString()}
                    </div>
                </div>
                <div class="social-task-status">
                    <img src="/public/images/${task.completed ? 'check-icon.png' : 'chevron-right-icon.png'}" 
                         alt="${task.completed ? 'Completed' : 'Incomplete'}" 
                         class="${task.completed ? 'status-icon' : 'chevron-icon'}">
                </div>
            `;
            socialTasksContainer.appendChild(taskElement);

            taskElement.addEventListener('click', () => handleTaskClick(task));
        });
    }
}

function handleTaskClick(task) {
    if (task.completed) return;

    const popupContent = `
        <img src="data:image/png;base64,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" alt="PUMP ME Character" class="character-image">
        <p>Click the button below to open our ${task.id === 'instagram' ? 'Instagram' : 'X'} page:</p>
        <div class="button-container">
            <a href="${task.link}" target="_blank" class="popup-button primary-button">PUMP ME on ${task.id === 'instagram' ? 'Instagram' : 'X'}</a>
            <button onclick="completeTask('${task.id}')" class="popup-button secondary-button">Done</button>
        </div>
    `;

    showPopup(popupContent);
}

function completeTask(taskId) {
    const task = socialTasks.find(t => t.id === taskId);
    if (task && !task.completed) {
        task.completed = true;
        gains += task.reward;
        updateUI();
        updateSocialPage();
        closePopup();
        showRewardPopup(task.reward);
    }
}

function showPopup(content) {
    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.innerHTML = `
        <div class="popup-content">
            ${content}
        </div>
    `;
    document.body.appendChild(popup);

    // Add error handling for the image
    const img = popup.querySelector('.character-image');
    if (img) {
        img.onerror = function() {
            console.error('Failed to load image:', this.src);
            this.style.display = 'none';
        };
        img.onload = function() {
            console.log('Image loaded successfully:', this.src);
        };
    }
}

function closePopup() {
    const popup = document.querySelector('.popup');
    if (popup) {
        popup.remove();
    }
}

function showRewardPopup(reward) {
    const rewardPopupContent = `
        <h2>Task Completed!</h2>
        <p>You've earned ${reward.toLocaleString()} gains!</p>
        <button onclick="closePopup()" class="popup-button ok-button">OK</button>
    `;
    showPopup(rewardPopupContent);
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");
    
    const navButtons = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');

    navButtons.forEach((btn, index) => {
      btn.addEventListener('click', (e) => {
          e.preventDefault();
          console.log("Nav button clicked:", btn.id);
          navButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          pages.forEach(page => page.style.display = 'none');
          pages[index].style.display = 'flex';
          if (btn.id === 'boosts-btn') {
              initializeBoostsPage();
          } else if (btn.id === 'top-pumpers-btn') {
              updateLeaderboard();
          } else if (btn.id === 'profile-btn') {
              updateProfilePage();
          } else if (btn.id === 'social-btn') {
              updateSocialPage();
          }
      });
  });

    const pumpMeContainer = document.getElementById('pump-me-container');
    const character = document.getElementById('character');
    [pumpMeContainer, character].forEach(element => {
        if (element) {
            element.addEventListener('touchstart', pump, { passive: false });
            element.addEventListener('mousedown', pump);
        }
    });

    setInterval(() => {
        if (energy < 1000) {
            energy = Math.min(1000, energy + 1);
            updateUI();
        }
    }, 1000);

    setInterval(() => {
        gains += gainsPerDay * boostMultiplier / (24 * 60 * 60);
        updateLevel();
        updateUI();
    }, 1000);

    loadUserData();
    updateUI();
    initializeBoostsPage();

    tg.ready();
    tg.expand();
});