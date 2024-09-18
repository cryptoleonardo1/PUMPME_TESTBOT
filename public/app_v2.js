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
    const boostItems = document.getElementById('boost-items');
    if (boostItems && window.boosts) {
        boostItems.innerHTML = '';
        window.boosts[category].forEach(boost => {
            const boostElement = document.createElement('div');
            boostElement.className = 'boost-item';
            boostElement.innerHTML = `
                <div class="boost-icon">${boost.icon}</div>
                <div class="boost-content">
                    <div class="boost-name">${boost.name}</div>
                    <div class="boost-description">${boost.description}</div>
                </div>
                <div class="boost-price">
                    <img src="/public/images/bicep-icon-yellow.png" alt="Price" class="price-icon">
                    ${boost.price}
                </div>
            `;
            boostItems.appendChild(boostElement);
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
/*
const socialTasks = [
    {
      id: 'telegram',
      name: "PUMPME.APP on Telegram",
      icon: "telegram-icon.png",
      reward: 5000,
      completed: false,
      link: "https://t.me/pumpme_me"
    },
    {
      id: 'twitter',
      name: "PUMPME.APP on X",
      icon: "twitter-icon.png",
      reward: 5000,
      completed: false,
      link: "https://x.com/Pumpme_me"
    },
    { 
      id: 'instagram',
      name: "PUMPME.APP on Instagram", 
      icon: "instagram-icon.png", 
      reward: 5000, 
      completed: false,
      link: "https://www.instagram.com/pumpme.me/"
    },
    {
      id: 'twitter-like-retweet',
      name: "Like & Retweet",
      icon: "twitter-icon.png",
      reward: 5000,
      completed: false,
      link: "https://x.com/Pumpme_me/status/1799805962976715102?t=YEWsHD_DuNhyrV_Y0GrGDw&s=35" // You may want to update this to a specific tweet URL
    },
    {
      id: 'refer',
      name: "Refer a friend",
      icon: "refer-friend-icon.png",
      reward: 5000,
      completed: true,
      noPopup: true
    }
  ]; */

  const socialTasks = {
    socials: [
        { id: 'telegram', name: "PUMPME.APP on Telegram", icon: "telegram-icon.png", reward: 5000, completed: false, link: "https://t.me/pumpme_me" },
        { id: 'twitter', name: "PUMPME.APP on X", icon: "twitter-icon.png", reward: 5000, completed: false, link: "https://x.com/Pumpme_me" },
        { id: 'instagram', name: "PUMPME.APP on Instagram", icon: "instagram-icon.png", reward: 5000, completed: false, link: "https://www.instagram.com/pumpme.me/" },
        { id: 'twitter-like-retweet', name: "Like & Retweet", icon: "twitter-icon.png", reward: 5000, completed: false, link: "https://x.com/Pumpme_me/status/1799805962976715102?t=YEWsHD_DuNhyrV_Y0GrGDw&s=35" }
    ],
    referrals: [
        { id: 'refer', name: "Refer a friend", icon: "refer-friend-icon.png", reward: 10000, completed: true, noPopup: true }
    ],
    'in-game': [
        { id: 'reps', name: "Make 50,000 reps", icon: "reps-icon.png", reward: 3000, completed: false, noPopup: true },
        { id: 'level', name: "Achieve Level 7", icon: "level-icon.png", reward: 3000, completed: false, noPopup: true },
        { id: 'purchase', name: "Purchase 50 Boosts", icon: "boost-icon.png", reward: 3000, completed: false, noPopup: true }
    ]
};

function updateSocialPage() {
    const taskCategories = document.querySelectorAll('.task-categories .category-btn');
    taskCategories.forEach(button => {
        button.addEventListener('click', () => {
            displayTasks(button.dataset.category);
            updateTaskCategoryButtons(button.dataset.category);
        });
    });

    // Always start with Socials category
    displayTasks('socials');
    updateTaskCategoryButtons('socials');
}

function navigateToPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => page.style.display = 'none');
    
    // Show the selected page
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.style.display = 'block';
        
        // If it's the Tasks page, reset to the Socials sub-page
        if (pageId === 'social-page') {
            displayTasks('socials');
            updateTaskCategoryButtons('socials');
        }
    }
}

// Add this new function to update the category buttons
function updateTaskCategoryButtons(activeCategory) {
    const categoryButtons = document.querySelectorAll('.task-categories .category-btn');
    categoryButtons.forEach(button => {
        if (button.dataset.category === activeCategory) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

function displayTasks(category) {
    const socialTasksContainer = document.getElementById('social-tasks-container');
    if (socialTasksContainer) {
        socialTasksContainer.innerHTML = '';
        socialTasks[category].forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = 'social-task';
            taskElement.innerHTML = `
                ${task.icon.includes('.png') 
    ? `${task.icon.includes('.png') 
    ? `<img src="/public/images/${task.icon}" alt="${task.name}" class="social-task-icon">`
    : `<span class="social-task-icon">${task.icon}</span>`
}`
    : `<span class="social-task-icon">${task.icon}</span>`
}                <div class="social-task-content">
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

            if (!task.noPopup) {
                taskElement.addEventListener('click', () => handleTaskClick(task));
            }
        });
    }
}

function handleTaskClick(task) {
    if (task.completed) return;

    let platformName;
    let actionText;
    switch(task.id) {
        case 'instagram':
            platformName = 'Instagram';
            actionText = 'Follow us on Instagram';
            break;
        case 'telegram':
            platformName = 'Telegram';
            actionText = 'Join our Telegram channel';
            break;
        case 'twitter':
            platformName = 'X';
            actionText = 'Follow us on X';
            break;
        case 'twitter-like-retweet':
            platformName = 'X';
            actionText = 'Like & Retweet our post on X';
            break;
        default:
            platformName = task.id;
            actionText = 'Complete the task';
    }

    const popupContent = `
        <img src="/public/images/max1.png" alt="PUMP ME Character" class="character-image">
        <p>${actionText}:</p>
        <div class="button-container">
            <a href="${task.link}" target="_blank" class="popup-button primary-button">PUMP ME on ${platformName}</a>
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

    navButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Nav button clicked:", btn.id);
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            let pageId;
            switch(btn.id) {
                case 'boosts-btn':
                    pageId = 'boosts-page';
                    initializeBoostsPage();
                    break;
                case 'top-pumpers-btn':
                    pageId = 'top-pumpers-page';
                    updateLeaderboard();
                    break;
                case 'profile-btn':
                    pageId = 'profile-page';
                    updateProfilePage();
                    break;
                case 'social-btn':
                    pageId = 'social-page';
                    break;
                default:
                    pageId = btn.id.replace('-btn', '-page');
            }
            
            navigateToPage(pageId);
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