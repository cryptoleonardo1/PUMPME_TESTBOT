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
        <h2>${task.name}</h2>
        <p>Click the button below to open our ${task.id === 'instagram' ? 'Instagram' : 'X'} page:</p>
        <div class="button-container">
            <a href="${task.link}" target="_blank" class="popup-button">Open ${task.id === 'instagram' ? 'Instagram' : 'X'}</a>
            <button onclick="completeTask('${task.id}')" class="popup-button">Done</button>
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