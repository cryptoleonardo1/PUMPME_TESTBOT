<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>PUMPME.APP</title>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <link rel="stylesheet" href="/styles_v2.css">
    <link rel="stylesheet" href="/boosts.css">
    <link rel="icon" href="/images/x-icon.png" type="image/png">
</head>
<body>
    <div id="app">
        <div id="gym-page">
            <header>
                <div class="header-logo">LEVEL</div>
                <div class="header-logo">PUMP ME</div>
            </header>

            <main>
                <div class="fitness-level">Fitness Level 3: Buff Beginner 🏋️‍♂️</div>
                <div class="stats left">
                    <div class="meter muscle-mass">
                        <div class="meter-fill"></div>
                        <span class="meter-value">15,400</span>
                    </div>
                </div>

                <div class="character-container">
                    <div id="character-clickable-area">
                        <img src="/images/bull_default.png" alt="Bull Character" id="character" class="character">
                        <div class="progress-ring"></div>
                    </div>
                </div>

                <div class="stats right">
                    <div class="meter pump">
                        <div class="meter-fill"></div>
                        <span class="meter-value">64/1000</span>
                    </div>
                </div>

                <div id="score-display">Clean Reps: 16</div>
            </main>

            <div class="bottom-stats">
                <div class="character-stats">
                    <div class="stat-bar">
                        <div class="stat-progress">
                            <div class="stat-fill" style="width: 60%;"></div>
                            <span class="stat-text">Muscle Growth</span>
                        </div>
                    </div>
                    <div class="stat-bar">
                        <div class="stat-progress">
                            <div class="stat-fill" style="width: 40%;"></div>
                            <span class="stat-text">Agility</span>
                        </div>
                    </div>
                    <div class="stat-bar">
                        <div class="stat-progress">
                            <div class="stat-fill" style="width: 30%;"></div>
                            <span class="stat-text">Regeneration</span>
                        </div>
                    </div>
                    <div class="stat-bar">
                        <div class="stat-progress">
                            <div class="stat-fill" style="width: 50%;"></div>
                            <span class="stat-text">Cardio</span>
                        </div>
                    </div>
                    <div class="stat-bar">
                        <div class="stat-progress">
                            <div class="stat-fill" style="width: 70%;"></div>
                            <span class="stat-text">Social</span>
                        </div>
                    </div>
                </div>
                <div class="energy-bar">
                    <div class="energy-fill"></div>
                </div>
            </div>
        </div>

        <div id="boosts-page" style="display: none;">
            <header>
                <div class="header-logo">PUMP ME</div>
            </header>

            <main id="boosts-main">
                <h1>Boosts</h1>
                <div class="boost-categories">
                    <button class="category-btn active" data-category="nutrition">Nutrition</button>
                    <button class="category-btn" data-category="equipment">Equipment</button>
                    <button class="category-btn" data-category="activities">Activities</button>
                    <button class="category-btn" data-category="training">Training</button>
                </div>

                <div class="boost-items" id="boost-items">
                    <!-- Items will be dynamically added here -->
                </div>
            </main>
        </div>

        <div id="challenges-page" style="display: none;">
            <header>
                <div class="header-logo">PUMP ME</div>
            </header>
            <main class="challenges-main">
                <h2>Challenges</h2>
                <div id="challenges-container">
                    <!-- Challenges will be dynamically added here -->
                </div>
            </main>
        </div>

        <div id="leaderboard-page" style="display: none;">
            <header>
                <div class="header-logo">PUMP ME</div>
            </header>
            <main class="leaderboard-main">
                <h2>Top Pumpers</h2>
                <table id="leaderboard-table">
                    <thead>
                        <tr>
                            <th>RANK</th>
                            <th>HERO</th>
                            <th>CLEAN REPS</th>
                            <th>DIVINE REWARD</th>
                        </tr>
                    </thead>
                    <tbody id="leaderboard-body">
                        <!-- Rows will be dynamically added here -->
                    </tbody>
                </table>
                <button id="back-button">RETURN TO TRAINING</button>
            </main>
        </div>

        <nav>
            <button class="nav-btn active" id="gym-btn">🏋️ Gym</button>
            <button class="nav-btn" id="boosts-btn">🚀 Boosts</button>
            <button class="nav-btn" id="challenges-btn">🏆 Challenges</button>
            <button class="nav-btn" id="top-pumpers-btn">👥 Top Pumpers</button>
        </nav>

        <div id="version-display">PUMPME.APP v1.0.3</div>
    </div>

    <script src="/app_v2.js"></script>
</body>
</html>