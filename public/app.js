// ... (previous code remains the same)

function updateLeaderboard() {
    fetch('/api/leaderboard')
    .then(response => response.json())
    .then(leaderboard => {
        console.log('Received leaderboard data:', leaderboard);
        leaderboardBody.innerHTML = '';
        leaderboard.forEach((entry, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${entry.userId}</td>
                <td>${entry.score}</td>
                <td>${calculateRewards(entry.score)}</td>
            `;
            leaderboardBody.appendChild(row);
        });
        console.log('Leaderboard updated in DOM');
    })
    .catch(error => console.error('Error fetching leaderboard:', error));
}

// ... (rest of the code remains the same)