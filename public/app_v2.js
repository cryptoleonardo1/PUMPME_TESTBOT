const tg = window.Telegram.WebApp;

let gains = 0;
let energy = 1000;
let level = 1;
let gainsPerRep = 1;
let gainsPerDay = 0;
let boostMultiplier = 1;
let activeBoosts = [];

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
    const energyBar = document.getElementById('energy-bar');
    const energyStatus = document.getElementById('energy-status');
    const levelDisplay = document.getElementById('level-display');
    const gainsDisplay = document.getElementById('gains-value');
    if (gainsDisplay) gainsDisplay.textContent = gains.toLocaleString();
    const gainsPerRepDisplay = document.querySelector('.status-item:nth-child(1) .status-value');
    const gainsPerDayDisplay = document.querySelector('.status-item:nth-child(3) .status-value');

    if (gainsDisplay) gainsDisplay.textContent = gains.toLocaleString();
    if (energyBar) energyBar.style.width = `${(energy / 1000) * 100}%`;
    if (energyStatus) energyStatus.textContent = energy >= 200 ? 'Rested' : 'Tired';
    if (levelDisplay) {
        const currentLevel = fitnessLevels[level - 1];
        levelDisplay.textContent = `${currentLevel.name} (Level ${level})`;
    }
    if (gainsPerRepDisplay) {
        const boostedGainsPerRep = gainsPerRep * boostMultiplier;
        gainsPerRepDisplay.innerHTML = `<img src="/public/images/bicep-icon-yellow.png" alt="Gains Icon" class="gains-icon"> +${boostedGainsPerRep.toFixed(2)}`;
    }
    if (gainsPerDayDisplay) gainsPerDayDisplay.innerHTML = `<img src="/public/images/bicep-icon-yellow.png" alt="Gains Icon" class="gains-icon"> +${gainsPerDay * boostMultiplier}`;
    
    // Update active boosts display
    updateActiveBoostsDisplay();
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
    setupBoosts(); 
}

function displayBoosts(category) {
    const boostItems = document.getElementById('boost-items');
    if (boostItems && window.boosts) {
        boostItems.innerHTML = '';  // Clear current boosts
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
            boostItems.appendChild(boostElement); // Add boost to the page
        });

        // Now that the boosts have been appended to the DOM, call setupBoosts
        setupBoosts();
    }
}

function setupBoosts() {
    const boostItems = document.querySelectorAll('.boost-item');
    boostItems.forEach(item => {
        item.addEventListener('click', handleBoostActivation);
    });
}

function handleBoostActivation(event) {
    const boostElement = event.currentTarget;
    const boostName = boostElement.querySelector('.boost-name').textContent;
    const boostValue = parseInt(boostElement.querySelector('.boost-price').textContent);

    showBoostPopUp(boostName, boostValue);
}

function showBoostPopUp(boostName, boostValue) {
    const popupContent = document.querySelector('#boost-popup p');
    if (popupContent) {
        popupContent.textContent = `Activate ${boostName} for ${boostValue} gains?`;
    }

    document.getElementById('boost-popup').style.display = 'block';

    // Clean up existing event listeners
    const confirmButton = document.getElementById('confirm-boost');
    const closeButton = document.getElementById('cancel-boost');

    confirmButton.replaceWith(confirmButton.cloneNode(true));
    closeButton.replaceWith(closeButton.cloneNode(true));

    // Re-select the buttons after cloning
    const newConfirmButton = document.getElementById('confirm-boost');
    const newCloseButton = document.getElementById('cancel-boost');

    newConfirmButton.addEventListener('click', function () {
        confirmBoost(boostName, boostValue);
    });

    newCloseButton.addEventListener('click', function () {
        closeBoostPopup();
    });
}

function confirmBoost(boostName, boostValue) {
    gains += boostValue;
    updateUI();
    closeBoostPopup();
    showBoostActivationMessage(boostName);
}

function showBoostActivationMessage(boostName) {
    const popupContent = `
        <img src="/public/images/max1.png" alt="PUMP ME Character" class="character-image">
        <p>You activated the boost: ${boostName}!</p>
        <div class="button-container">
            <button onclick="closePopup()" class="popup-button primary-button">OK</button>
        </div>
    `;
    showPopup(popupContent);
}

function closeBoostPopup() {
    document.getElementById('boost-popup').style.display = 'none';
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

function applyBoostEffect(boostName) {
    const boost = boostEffects[boostName];
    if (boost) {
        if (boost.type === "multiplier") {
            // Increase the boostMultiplier
            boostMultiplier *= boost.value;

            // Set a timer to reset the multiplier after the boost duration
            setTimeout(() => {
                boostMultiplier /= boost.value;
                updateUI();
            }, boost.duration * 1000);

            // Add the boost to active boosts
            activeBoosts.push({
                name: boostName,
                expiresAt: Date.now() + boost.duration * 1000
            });
        }
        // Handle other types of boosts if necessary
    }
}

function updateActiveBoostsDisplay() {
    const activeBoostsContainer = document.getElementById('active-boosts-container');
    if (activeBoostsContainer) {
        activeBoostsContainer.innerHTML = '';
        const now = Date.now();

        // Remove expired boosts
        activeBoosts = activeBoosts.filter(boost => boost.expiresAt > now);

        if (activeBoosts.length > 0) {
            activeBoosts.forEach(boost => {
                const timeRemaining = Math.ceil((boost.expiresAt - now) / 1000); // in seconds
                const boostElement = document.createElement('div');
                boostElement.className = 'active-boost-item';
                boostElement.innerHTML = `
                    <div class="boost-name">${boost.name}</div>
                    <div class="boost-duration">${formatTime(timeRemaining)}</div>
                `;
                activeBoostsContainer.appendChild(boostElement);
            });
        } else {
            activeBoostsContainer.innerHTML = '<p>No active boosts</p>';
        }
    }
}

function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) {
        return `${h}h ${m}m ${s}s`;
    } else if (m > 0) {
        return `${m}m ${s}s`;
    } else {
        return `${s}s`;
    }
}

function showInsufficientGainsMessage(boostName) {
    const popupContent = `
        <p>You do not have enough Gains to activate "${boostName}".</p>
        <div class="button-container">
            <button onclick="closePopup()" class="popup-button primary-button">OK</button>
        </div>
    `;
    showPopup(popupContent);
}

function updateProfilePage() {
    const attributes = [
        { name: "Strength", value: 20 },
        { name: "Endurance", value: 18 },
        { name: "Recovery", value: 22 },
        { name: "Technique", value: 15 },
        { name: "Motivation", value: 25 },
        { name: "Charisma", value: 17 },
        { name: "Risk of Injury", value: 25 }
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
        { id: 'instagram', name: "PUMPME.APP on Insta", icon: "instagram-icon.png", reward: 5000, completed: false, link: "https://www.instagram.com/pumpme.me/" },
        { id: 'twitter-like-retweet', name: "Like & Retweet", icon: "twitter-icon.png", reward: 5000, completed: false, link: "https://x.com/Pumpme_me/status/1799805962976715102?t=YEWsHD_DuNhyrV_Y0GrGDw&s=35" }
    ],
    referrals: [
        { id: 'refer', name: "Refer a friend", icon: "refer-friend-icon.png", reward: 10000, completed: true, noPopup: true }
    ],
    'in-game': [
        { id: 'reps', name: "Make 50,000 reps", icon: "reps-icon.png", reward: 50000, completed: false, noPopup: true },
        { id: 'reps', name: "Make 500,000 reps", icon: "reps-icon.png", reward: 500000, completed: false, noPopup: true },
        { id: 'level', name: "Achieve Level 3", icon: "level-icon.png", reward: 30000, completed: false, noPopup: true },
        { id: 'level', name: "Achieve Level 7", icon: "level-icon.png", reward: 70000, completed: false, noPopup: true },
        { id: 'level', name: "Achieve Level 10", icon: "level-icon.png", reward: 1000000, completed: false, noPopup: true },
        { id: 'purchase', name: "Purchase 50 Boosts", icon: "boost-icon.png", reward: 5000, completed: false, noPopup: true }
    ]
};

function updateTasksPage() {
    console.log("Updating Tasks page");
    
    // Set up category buttons
    const categoryButtons = document.querySelectorAll('.task-categories .category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            displayTasks(button.dataset.category);
        });
    });

    // Initialize the page
    initializeTasksPage();
}

function initializeTasksPage() {
    console.log("Initializing Tasks page");
    const defaultCategory = 'socials';
    setupTaskCategoryButtons(); // Add this line
    const categoryButtons = document.querySelectorAll('.task-categories .category-btn');
    categoryButtons.forEach(btn => btn.classList.remove('active'));
    const defaultButton = document.querySelector(`.task-categories .category-btn[data-category="${defaultCategory}"]`);
    if (defaultButton) {
        defaultButton.classList.add('active');
    }
    displayTasks(defaultCategory);
}

function setupTaskCategoryButtons() {
    console.log("Setting up task category buttons");
    const categoryButtons = document.querySelectorAll('.task-categories .category-btn');
    console.log("Found", categoryButtons.length, "category buttons");
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Category button clicked:", button.dataset.category);
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            displayTasks(button.dataset.category);
        });
    });
}

function displayTasks(category) {
    console.log("Displaying tasks for category:", category);
    const tasksContainer = document.getElementById('social-tasks-container');
    if (!tasksContainer) {
        console.error("Tasks container not found");
        return;
    }
    
    if (!socialTasks[category] || !Array.isArray(socialTasks[category])) {
        console.error("Invalid category or tasks not found for category:", category);
        tasksContainer.innerHTML = '<p>No tasks available for this category.</p>';
        return;
    }

    tasksContainer.innerHTML = '';
    socialTasks[category].forEach(task => {
        if (!task || typeof task !== 'object') {
            console.error("Invalid task object:", task);
            return;
        }

        const taskElement = document.createElement('div');
        taskElement.className = 'social-task';
        taskElement.innerHTML = `
            <img src="/public/images/${task.icon || 'default-icon.png'}" alt="${task.name || 'Task'}" class="social-task-icon">
            <div class="social-task-content">
                <div class="social-task-name">${task.name || 'Unnamed Task'}</div>
                <div class="social-task-reward">
                    <img src="/public/images/bicep-icon-yellow.png" alt="Gains" class="gains-icon">
                    +${(task.reward || 0).toLocaleString()}
                </div>
            </div>
            <div class="social-task-status">
                <img src="/public/images/${task.completed ? 'check-icon.png' : 'chevron-right-icon.png'}" 
                     alt="${task.completed ? 'Completed' : 'Incomplete'}" 
                     class="${task.completed ? 'status-icon' : 'chevron-icon'}">
            </div>
        `;
        tasksContainer.appendChild(taskElement);

        if (!task.noPopup) {
            taskElement.addEventListener('click', () => handleTaskClick(task));
        }
    });
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
    const category = Object.keys(socialTasks).find(key => 
        socialTasks[key].some(task => task.id === taskId)
    );
    
    if (!category) {
        console.error('Task category not found');
        return;
    }

    const task = socialTasks[category].find(t => t.id === taskId);
    if (task && !task.completed) {
        task.completed = true;
        gains += task.reward;
        updateUI();
        closePopup();
        showRewardPopup(task.reward);
        updateSocialPage(); // Refresh the social page to show updated task status
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

    // Hide all pages except the gym page on initial load
    pages.forEach(page => {
        if (page.id === 'gym-page') {
            page.style.display = 'flex';
        } else {
            page.style.display = 'none';
        }
    });

    // Ensure the gym button is active on initial load
    const gymButton = document.getElementById('gym-btn');
    if (gymButton) {
        gymButton.classList.add('active');
    }

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
            } else if (btn.id === 'tasks-btn') {
                initializeTasksPage();
            }
        });
    });

    // Bicep icon debugging
    const bicepIcon = document.getElementById('bicep-icon');
    if (bicepIcon) {
        bicepIcon.onload = function() {
            console.log('Bicep icon loaded successfully');
        };
        bicepIcon.onerror = function() {
            console.error('Failed to load bicep icon');
            // Fallback to a text representation if the image fails to load
            bicepIcon.style.display = 'none';
            bicepIcon.parentElement.textContent = '💪';
        };
    } else {
        console.error('Bicep icon element not found');
    }

    // Initialize the gym page
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

    tg.ready();
    tg.expand();
});