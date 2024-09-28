const tg = window.Telegram.WebApp;

let userId = tg.initDataUnsafe?.user?.id;
let username = tg.initDataUnsafe?.user?.username || 'Anonymous';

// Fallback for testing outside of Telegram
if (!userId) {
  userId = 'test-user-id'; // Replace with a unique identifier for testing
  username = 'TestUser';
}

let gains = 0;
let energy = 1000;
let level = 1;
let gainsPerRep = 1;
let gainsPerDay = 0;
let boostMultiplier = 1;
let activeBoosts = [];

const boostEffects = {
    "Protein Shake": { type: "multiplier", value: 1.5, duration: 3600 }, // Duration in seconds (1 hour)
    "Pre-workout": { type: "multiplier", value: 1.5, duration: 3600 }, 
    "Creatine": { type: "multiplier", value: 1.5, duration: 3600 },
    "BCAA": { type: "multiplier", value: 1.5, duration: 3600 },
    "Coffee": { type: "multiplier", value: 1.5, duration: 3600 },
    "Energy drink": { type: "multiplier", value: 1.5, duration: 3600 },
    "Steak": { type: "multiplier", value: 1.5, duration: 3600 },
    "Eggs": { type: "multiplier", value: 1.5, duration: 3600 },
    "Chicken": { type: "multiplier", value: 1.5, duration: 3600 },
    "Hot-dog": { type: "multiplier", value: 1.5, duration: 3600 },
    "Chest Day": { type: "multiplier", value: 1.5, duration: 3600 },
    "Back Day": { type: "multiplier", value: 1.5, duration: 3600 },
    "Leg Day": { type: "multiplier", value: 1.5, duration: 3600 },
    "Abs Workout": { type: "multiplier", value: 1.5, duration: 3600 },
    "Shoulder Day": { type: "multiplier", value: 1.5, duration: 3600 },
    "Biceps Workout": { type: "multiplier", value: 1.5, duration: 3600 },
    "Triceps Workout": { type: "multiplier", value: 1.5, duration: 3600 },
    "HIIT": { type: "multiplier", value: 1.5, duration: 3600 },
    "Endurance Cardio": { type: "multiplier", value: 1.5, duration: 3600 },
    "Calisthenics": { type: "multiplier", value: 1.5, duration: 3600 },
    "Street Workout": { type: "multiplier", value: 1.5, duration: 3600 },
    "Yoga": { type: "multiplier", value: 1.5, duration: 3600 },
    "Dance Class": { type: "multiplier", value: 1.5, duration: 3600 },
    "Muay Thai": { type: "multiplier", value: 1.5, duration: 3600 },
    "Karate": { type: "multiplier", value: 1.5, duration: 3600 },
    "Swimming": { type: "multiplier", value: 1.5, duration: 3600 },
    "Jogging": { type: "multiplier", value: 1.5, duration: 3600 },
    "Cycling": { type: "multiplier", value: 1.5, duration: 3600 },
    "Sauna": { type: "multiplier", value: 1.5, duration: 3600 },
    "Massage": { type: "multiplier", value: 1.5, duration: 3600 },
    "Ice Bath": { type: "multiplier", value: 1.5, duration: 3600 },
    "Cold Shower": { type: "multiplier", value: 1.5, duration: 3600 },
    "20 Min Nap": { type: "multiplier", value: 1.5, duration: 3600 },
    "7 Hour Sleep": { type: "multiplier", value: 1.5, duration: 3600 },
    "Walk a Dog": { type: "multiplier", value: 1.5, duration: 3600 },
    "Breathing Exercise": { type: "multiplier", value: 1.5, duration: 3600 },
    "Meditation": { type: "multiplier", value: 5, duration: 20 },
};

const userIdFallback = 'test-user-id'; // Replace with a unique identifier for testing

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
        gainsPerRepDisplay.innerHTML = `<img src="/public/images/bicep-icon-yellow.png" alt="Gains Icon" class="gains-icon"> +${(gainsPerRep * boostMultiplier).toFixed(1)}`;
    }
    // Update gains per day display
     if (gainsPerDayDisplay) {
         gainsPerDayDisplay.innerHTML = `<img src="/public/images/bicep-icon-yellow.png" alt="Gains Icon" class="gains-icon"> +${(gainsPerDay * boostMultiplier).toFixed(1)}`;
     }
    // Update active boosts display
    updateActiveBoostsDisplay();
}

function saveUserData() {
    const userId = tg.initDataUnsafe?.user?.id || 'test-user-id';
    const username = tg.initDataUnsafe?.user?.username || 'Anonymous';
  
    // Prepare boosts data to be saved
    const boostsData = window.boosts;
  
    console.log('Saving user data:', { userId, username, gains, level, boostsData });
  
    fetch('/api/saveUserData', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, username, gains, level, boostsData }),
    })
      .then(response => response.json())
      .then(data => console.log('User data saved:', data))
      .catch(error => console.error('Error saving user data:', error));
  }  

function loadUserData() {
  const userId = tg.initDataUnsafe?.user?.id || userIdFallback;
  if (userId) {
    fetch(`/api/getUserData?userId=${userId}`)
      .then(response => response.json())
      .then(data => {
        gains = data.gains || 0;
        level = data.level || 1;
        window.boosts = data.boostsData || window.boosts;
        console.log('Loaded user data:', { gains, level, boosts: window.boosts });

        // Re-apply active boosts
        applyLoadedBoosts();

        updateUI();
      })
      .catch(error => console.error('Error loading user data:', error));
  }
}

function applyLoadedBoosts() {
    Object.keys(window.boosts).forEach(category => {
      window.boosts[category].forEach(boost => {
        if (boost.active && boost.expirationTime) {
          const remainingDuration = boost.expirationTime - Date.now();
          if (remainingDuration > 0) {
            const boostEffect = boostEffects[boost.name];
            if (boostEffect.type === "multiplier") {
              boostMultiplier *= boostEffect.value;
  
              // Set a timeout to remove the boost effect after the remaining duration
              setTimeout(() => {
                console.log(`Boost ${boost.name} has expired.`);
                boostMultiplier /= boostEffect.value;
                boost.active = false;
                boost.expirationTime = null;
  
                updateUI();
                initializeBoostsPage();
                updateProfilePage();
                saveUserData();
              }, remainingDuration);
            }
          } else {
            // Boost has expired
            boost.active = false;
            boost.expirationTime = null;
          }
        }
      });
    });
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
  const categoryButtons = document.querySelectorAll('#boosts-page .category-btn');

  // Set default category
  let defaultCategory = 'nutrition';
  categoryButtons.forEach(btn => {
    btn.classList.remove('active');
    if (!defaultCategory && !btn.disabled) {
      defaultCategory = btn.dataset.category;
    }
  });

  const defaultButton = document.querySelector(`#boosts-page .category-btn[data-category="${defaultCategory}"]`);
  if (defaultButton) {
    defaultButton.classList.add('active');
  }

  displayBoosts(defaultCategory);
  setupBoostsCategoryButtons();
}

function displayBoosts(category) {
    const boostItems = document.getElementById('boost-items');
    if (boostItems && window.boosts) {
      boostItems.innerHTML = ''; // Clear current boosts
  
      window.boosts[category]
        .filter(boost => !boost.active) // Only include boosts that are not active
        .forEach(boost => {
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
  
          // Attach click handler
          boostElement.addEventListener('click', handleBoostActivation);
        });
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
    const boostPrice = parseInt(boostElement.querySelector('.boost-price').textContent);

    const boostEffect = boostEffects[boostName];

    if (!boostEffect) {
        console.error(`No effect data found for boost: ${boostName}`);
        return;
    }

    showBoostPopUp(boostName, boostPrice, boostEffect);
}

function showBoostPopUp(boostName, boostPrice, boostEffect) {
    // Update popup message
    const popupMessage = document.getElementById('boost-popup-message');
    if (popupMessage) {
        popupMessage.textContent = `Activate ${boostName} for ${boostPrice} gains?`;
    } else {
        console.error('Popup message element not found');
    }

    // Show the popup
    const boostPopup = document.getElementById('boost-popup');
    if (boostPopup) {
        boostPopup.style.display = 'flex';
    } else {
        console.error('Boost popup element not found');
        return;
    }

    // Clean up existing event listeners
    const confirmButton = document.getElementById('confirm-boost');
    const closeButton = document.getElementById('close-boost-popup');

    // Check if buttons are found
    if (!confirmButton || !closeButton) {
        console.error('One or more buttons not found in the boost popup');
        return;
    }

    // Remove existing event listeners by cloning the buttons
    confirmButton.replaceWith(confirmButton.cloneNode(true));
    closeButton.replaceWith(closeButton.cloneNode(true));

    // Re-select the buttons after cloning
    const newConfirmButton = document.getElementById('confirm-boost');
    const newCloseButton = document.getElementById('close-boost-popup');

    // Update the button text
    newConfirmButton.textContent = 'Pump Me';

    // Attach event listeners
    newConfirmButton.addEventListener('click', function () {
        confirmBoost(boostName, boostPrice, boostEffect);
    });

    newCloseButton.addEventListener('click', function () {
        closeBoostPopup();
    });
}


function confirmBoost(boostName, boostPrice, boostEffect) {
    if (gains >= boostPrice) {
      gains -= boostPrice;
  
      // Find the boost object
      let boost = null;
      Object.keys(window.boosts).some(category => {
        boost = window.boosts[category].find(b => b.name === boostName);
        return !!boost;
      });
  
      if (boost) {
        applyBoostEffect(boost);
      }
  
      updateUI();
      closeBoostPopup();
      // Refresh the Boosts page to update the list
      initializeBoostsPage();
    } else {
      closeBoostPopup();
      showInsufficientGainsMessage(boostName);
    }
  }
  

function closeBoostPopup() {
    const boostPopup = document.getElementById('boost-popup');
    if (boostPopup) {
        boostPopup.style.display = 'none';
    }
}


function showTaskPopup(content) {
    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.innerHTML = `
        <div class="popup-content">
            ${content}
        </div>
    `;
    document.body.appendChild(popup);
}


function closeTaskPopup() {
    const popup = document.querySelector('.popup');
    if (popup) {
        popup.remove();
    }
}

function applyBoostEffect(boost) {
    const boostEffect = boostEffects[boost.name];
    if (boostEffect.type === "multiplier") {
      boostMultiplier *= boostEffect.value;
  
      const expirationTime = Date.now() + boostEffect.duration * 1000;
      boost.active = true;
      boost.expirationTime = expirationTime;
  
      console.log('Applying boost effect:', boost.name, boostEffect);
  
      // Save user data after updating active boosts
      saveUserData();
  
      // Set a timeout to remove the boost effect after its duration
      setTimeout(() => {
        console.log(`Boost ${boost.name} has expired at ${new Date().toISOString()}`);
        boostMultiplier /= boostEffect.value;
        boost.active = false;
        boost.expirationTime = null;
  
        // Move the boost back to the Boosts page
        // Since we already update the boosts based on the `active` property, we just need to refresh the pages
        updateUI();
        // Update both the Boosts and Profile pages to reflect changes
        initializeBoostsPage();
        updateProfilePage();
        saveUserData();
      }, boostEffect.duration * 1000);
  
      // Update the UI to reflect the boost
      updateUI();
      updateProfilePage();
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
            <button onclick="closeTaskPopup()" class="popup-button secondary-button">OK</button>
        </div>
    `;
    showTaskPopup(popupContent);
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

    console.log('Updating profile page with activeBoosts:', activeBoosts);

    const activeBoostsContainer = document.getElementById('active-boosts-container');
    if (activeBoostsContainer) {
      activeBoostsContainer.innerHTML = '';
  
      // Collect all active boosts from all categories
      const activeBoostsList = [];
      Object.keys(window.boosts).forEach(category => {
        window.boosts[category].forEach(boost => {
          if (boost.active) {
            activeBoostsList.push(boost);
          }
        });
      });
  
      if (activeBoostsList.length > 0) {
        activeBoostsList.forEach(boost => {
          const remainingTime = Math.ceil((boost.expirationTime - Date.now()) / 1000); // in seconds
          const durationString = formatDuration(remainingTime);
  
          const boostElement = document.createElement('div');
          boostElement.className = 'active-boost-item';
          boostElement.innerHTML = `
            <div class="boost-name">${boost.name}</div>
            <div class="boost-duration">${durationString}</div>
          `;
          activeBoostsContainer.appendChild(boostElement);
        });
      } else {
        activeBoostsContainer.innerHTML = '<p>No active boosts</p>';
      }
    }
  }

function formatDuration(durationInMillis) {
    const totalSeconds = Math.floor(durationInMillis / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let durationString = '';
    if (hours > 0) durationString += `${hours}h `;
    if (minutes > 0) durationString += `${minutes}m `;
    if (seconds > 0 || durationString === '') durationString += `${seconds}s`;

    return durationString.trim();
}

const socialTasks = {
    socials: [
        { id: 'telegram', name: "PUMPME.APP on Telegram", icon: "telegram-icon.png", reward: 5000, completed: false, link: "https://t.me/pumpme_me" },
        { id: 'instagram', name: "PUMPME.APP on Insta", icon: "instagram-icon.png", reward: 5000, completed: false, link: "https://www.instagram.com/pumpme.me/" },
        { id: 'twitter', name: "PUMPME.APP on X", icon: "twitter-icon.png", reward: 5000, completed: false, link: "https://x.com/Pumpme_me" },
        { id: 'twitter-like-retweet', name: "Like & Retweet", icon: "twitter-icon.png", reward: 5000, completed: false, link: "https://x.com/Pumpme_me/status/1799805962976715102?t=YEWsHD_DuNhyrV_Y0GrGDw&s=35" }
    ],
    'in-game': [
        { id: 'reps', name: "Make 50,000 reps", icon: "reps-icon.png", reward: 50000, completed: false, noPopup: true },
        { id: 'reps', name: "Make 500,000 reps", icon: "reps-icon.png", reward: 500000, completed: false, noPopup: true },
        { id: 'level', name: "Achieve Level 3", icon: "level-icon.png", reward: 30000, completed: false, noPopup: true },
        { id: 'level', name: "Achieve Level 7", icon: "level-icon.png", reward: 70000, completed: false, noPopup: true },
        { id: 'level', name: "Achieve Level 10", icon: "level-icon.png", reward: 1000000, completed: false, noPopup: true },
        { id: 'purchase', name: "Purchase 50 Boosts", icon: "boost-icon.png", reward: 5000, completed: false, noPopup: true }
    ],
    referrals: [
        { id: 'refer', name: "Refer a friend", icon: "refer-friend-icon.png", reward: 10000, completed: true, noPopup: true }
    ],
    completed: []
};

function updateTasksPage() {
    console.log("Updating Tasks page");
    initializeTasksPage();
}

function initializeTasksPage() {
    console.log("Initializing Tasks page");
    setupTaskCategoryButtons();

    // Set default active category to "socials"
    const defaultCategory = 'socials';
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
    const tasksContainer = document.getElementById('tasks-container');
    if (!tasksContainer) {
        console.error("Tasks container not found");
        return;
    }

    tasksContainer.innerHTML = ''; // Clear existing tasks

    if (!socialTasks[category] || !Array.isArray(socialTasks[category])) {
        console.error("Invalid category or tasks not found for category:", category);
        tasksContainer.innerHTML = '<p>No tasks available for this category.</p>';
        return;
    }

    if (socialTasks[category].length === 0) {
        tasksContainer.innerHTML = '<p>No tasks available for this category.</p>';
        return;
    }

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
                ${task.completed ? '<img src="/public/images/check-icon.png" alt="Completed" class="status-icon">' : '<img src="/public/images/chevron-right-icon.png" alt="Incomplete" class="chevron-icon">'}
            </div>
        `;
        tasksContainer.appendChild(taskElement);

        // Make tasks in the "completed" category or completed tasks non-clickable
        if (!task.completed && category !== 'completed') {
            if (!task.noPopup) {
                taskElement.addEventListener('click', () => handleTaskClick(task));
            }
        } else {
            // Optionally add a class to style completed tasks differently
            taskElement.classList.add('completed-task');
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
        <p>${actionText}</p>
        <div class="button-container">
            <button class="popup-button primary-button" id="pump-me-button">Pump Me</button>
        </div>
    `;

    showTaskPopup(popupContent);

    // Attach event listener to the "Pump Me" button after the popup is shown
    setTimeout(() => {
        const pumpMeButton = document.getElementById('pump-me-button');
        if (pumpMeButton) {
            pumpMeButton.addEventListener('click', () => completeTask(task));
        } else {
            console.error('Pump Me button not found');
        }
    }, 0);
}


function completeTask(task) {
    // Open the desired website
    window.open(task.link, '_blank');

    // Mark the task as completed
    task.completed = true;

    // Add the task's reward to the user's gains
    gains += task.reward;
    updateUI();

    // Move the task to the "completed" category
    moveTaskToCompleted(task);

    // Close the task popup
    closeTaskPopup();

    // Show a reward popup (optional)
    showRewardPopup(task.reward);

    // Save user data
    saveUserData();
}

function moveTaskToCompleted(task) {
    // Find the category the task is in
    const category = Object.keys(socialTasks).find(cat => {
        return socialTasks[cat].includes(task);
    });

    if (category && category !== 'completed') {
        // Remove the task from its current category
        socialTasks[category] = socialTasks[category].filter(t => t !== task);

        // Add the task to the "completed" category
        if (!socialTasks['completed']) {
            socialTasks['completed'] = [];
        }
        socialTasks['completed'].push(task);
    }

    // Update the tasks display
    displayTasks(category);
}

function showTaskPopup(content) {
    // Create the overlay
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay task-popup-overlay';

    // Create the popup content container
    const popupContent = document.createElement('div');
    popupContent.className = 'popup-content task-popup-content';

    // Add the close button
    const closeButton = document.createElement('button');
    closeButton.className = 'popup-close task-popup-close';
    closeButton.innerHTML = '&times;';
    closeButton.onclick = closeTaskPopup;
    popupContent.appendChild(closeButton);

    // Insert the content
    const contentContainer = document.createElement('div');
    contentContainer.innerHTML = content;
    popupContent.appendChild(contentContainer);

    // Append the popup content to the overlay
    overlay.appendChild(popupContent);

    // Append the overlay to the body
    document.body.appendChild(overlay);
}

function closeTaskPopup() {
    const overlay = document.querySelector('.task-popup-overlay');
    if (overlay) {
        overlay.remove();
    }
}

function showRewardPopup(reward) {
    const rewardPopupContent = `
        <h2>Task Completed!</h2>
        <p>You've earned ${reward.toLocaleString()} gains!</p>
        <button onclick="closeTaskPopup()" class="popup-button ok-button">OK</button>
    `;
    showTaskPopup(rewardPopupContent);
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