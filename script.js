// YouTube API Key
const apiKey = "AIzaSyAuM2YMTSpTSURR_UffUn-C80eq0BL5UUY";

// Navigation Functionality
document.addEventListener('DOMContentLoaded', function () {
    // Tab navigation
    const navItems = document.querySelectorAll('nav li');
    const tabContents = document.querySelectorAll('.tab-content');

    navItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            // Remove active class from all nav items and tabs
            navItems.forEach(i => i.classList.remove('active'));
            tabContents.forEach(t => t.classList.remove('active'));

            // Add active class to clicked nav item and corresponding tab
            item.classList.add('active');
            tabContents[index].classList.add('active');
        });
    });

    // Player controls
    const prevBtn = document.getElementById('prev-btn');
    const playBtn = document.getElementById('play-btn');
    const nextBtn = document.getElementById('next-btn');

    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', playPrevious);
    nextBtn.addEventListener('click', playNext);

    // Theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    themeToggle.addEventListener('click', toggleTheme);

    // Add event listener for search input focus
    const searchInput = document.getElementById('search');
    searchInput.addEventListener('focus', function () {
        document.querySelector('.search-bar').classList.add('focused');
    });

    searchInput.addEventListener('blur', function () {
        document.querySelector('.search-bar').classList.remove('focused');
    });

    // Search on Enter key press
    searchInput.addEventListener("keyup", function (event) {
        if (event.key === "Enter") {
            searchYouTube(searchInput.value);
        }
    });

    // Load initial data
    displayFavorites();
    displayHistory();
});

// Local Storage Functions
function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getFromLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

// Add to Favorites (No Firebase)
function addToFavorites(videoId, title, thumbnail = null) {
    let favorites = getFromLocalStorage("favorites");
    const isFavorite = favorites.some(fav => fav.videoId === videoId);

    if (isFavorite) {
        // Remove from favorites if already exists
        favorites = favorites.filter(fav => fav.videoId !== videoId);
        // Update UI
        const favBtn = document.querySelector(`.fav-btn[data-id="${videoId}"]`);
        if (favBtn) favBtn.classList.remove('active');
        showToast("Removed from favorites");
    } else {
        // Add to favorites
        favorites.push({ videoId, title, thumbnail, dateAdded: new Date().toISOString() });
        // Update UI
        const favBtn = document.querySelector(`.fav-btn[data-id="${videoId}"]`);
        if (favBtn) favBtn.classList.add('active');
        showToast("Added to favorites");
    }

    saveToLocalStorage("favorites", favorites);
    displayFavorites();
}

// Add to History (No Firebase)
function addToHistory(videoId, title, thumbnail = null) {
    let history = getFromLocalStorage("history");

    // Remove if already exists (to avoid duplicates)
    history = history.filter(item => item.videoId !== videoId);

    // Add to the beginning of history
    history.unshift({
        videoId,
        title,
        thumbnail,
        timestamp: new Date().toISOString()
    });

    // Limit history to 20 items
    if (history.length > 20) {
        history = history.slice(0, 20);
    }

    saveToLocalStorage("history", history);
    displayHistory();
}

// Display Favorites (No Firebase)
function displayFavorites() {
    let favorites = getFromLocalStorage("favorites");
    let favoritesList = document.getElementById("favorites");
    favoritesList.innerHTML = "";

    if (favorites.length === 0) {
        favoritesList.innerHTML = "<div class='no-results'>No favorites yet. Heart a song to add it here!</div>";
        return;
    }

    // Create and display favorites from local storage
    favorites.forEach(fav => {
        let li = document.createElement("li");
        li.onclick = () => playVideo(fav.videoId, fav.title, fav.thumbnail);

        let thumbDiv = document.createElement("div");
        thumbDiv.className = "favorite-thumbnail";

        if (fav.thumbnail) {
            let img = document.createElement("img");
            img.src = fav.thumbnail;
            img.alt = fav.title;
            thumbDiv.appendChild(img);
        } else {
            let icon = document.createElement("i");
            icon.className = "fas fa-music";
            thumbDiv.appendChild(icon);
        }

        let infoDiv = document.createElement("div");
        infoDiv.className = "favorite-info";

        let titleSpan = document.createElement("div");
        titleSpan.className = "favorite-title";
        titleSpan.textContent = fav.title;

        infoDiv.appendChild(titleSpan);
        li.appendChild(thumbDiv);
        li.appendChild(infoDiv);
        favoritesList.appendChild(li);
    });
}

// Display History (No Firebase)
function displayHistory() {
    let history = getFromLocalStorage("history");
    let historyList = document.getElementById("history");
    historyList.innerHTML = "";

    if (history.length === 0) {
        historyList.innerHTML = "<div class='no-results'>No listening history yet. Play some music!</div>";
        return;
    }

    history.forEach(hist => {
        let li = document.createElement("li");

        let songInfo = document.createElement("div");
        songInfo.className = "song-info";

        let thumbDiv = document.createElement("div");
        thumbDiv.className = "song-thumbnail";

        if (hist.thumbnail) {
            let img = document.createElement("img");
            img.src = hist.thumbnail;
            img.alt = hist.title;
            thumbDiv.appendChild(img);
        } else {
            let icon = document.createElement("i");
            icon.className = "fas fa-music";
            thumbDiv.appendChild(icon);
        }

        let titleDiv = document.createElement("div");
        titleDiv.className = "song-title";
        titleDiv.textContent = hist.title;

        let dateDiv = document.createElement("div");
        dateDiv.className = "song-date";
        dateDiv.textContent = formatDate(hist.timestamp);

        songInfo.appendChild(thumbDiv);
        songInfo.appendChild(titleDiv);
        songInfo.appendChild(dateDiv);

        let actionDiv = document.createElement("div");
        actionDiv.className = "song-actions";

        let playBtn = document.createElement("button");
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        playBtn.onclick = (e) => {
            e.stopPropagation();
            playVideo(hist.videoId, hist.title, hist.thumbnail);
        };

        let favBtn = document.createElement("button");
        favBtn.className = "fav-btn";
        favBtn.setAttribute("data-id", hist.videoId);
        favBtn.innerHTML = '<i class="fas fa-heart"></i>';

        // Check if it's already a favorite
        let favorites = getFromLocalStorage("favorites");
        if (favorites.some(fav => fav.videoId === hist.videoId)) {
            favBtn.classList.add("active");
        }

        favBtn.onclick = (e) => {
            e.stopPropagation();
            addToFavorites(hist.videoId, hist.title, hist.thumbnail);
        };

        actionDiv.appendChild(playBtn);
        actionDiv.appendChild(favBtn);

        li.appendChild(songInfo);
        li.appendChild(actionDiv);
        li.onclick = () => playVideo(hist.videoId, hist.title, hist.thumbnail);

        historyList.appendChild(li);
    });
}

// Clear History
function clearHistory() {
    if (confirm('Are you sure you want to clear your history?')) {
        localStorage.removeItem("history");
        displayHistory();
        showToast("History cleared successfully!");
    }
}

// YouTube API Integration (Improved)
const searchInput = document.getElementById("search");
const resultsList = document.getElementById("results");
const player = document.getElementById("player");

let playlist = [];
let currentVideoIndex = 0;
let isPlaying = false;

function searchYouTube(query) {
    if (!query.trim()) {
        resultsList.innerHTML = "<div class='no-results'>Please enter a search term</div>";
        return;
    }

    // Show loading state
    resultsList.innerHTML = "<div class='loading'>Searching for music...</div>";

    console.log("Searching for:", query);

    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=15&key=${apiKey}`;

    fetch(searchUrl)
        .then(response => {
            console.log("Response status:", response.status);
            if (!response.ok) {
                throw new Error(`YouTube API error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Search results:", data);
            resultsList.innerHTML = "";
            playlist = [];
            currentVideoIndex = 0;

            if (data.items && data.items.length > 0) {
                data.items.forEach(item => {
                    let videoId = item.id.videoId;
                    let title = item.snippet.title;
                    let thumbnail = item.snippet.thumbnails.medium.url;

                    playlist.push({ videoId, title, thumbnail });

                    let li = document.createElement("li");

                    let songInfo = document.createElement("div");
                    songInfo.className = "song-info";

                    let thumbDiv = document.createElement("div");
                    thumbDiv.className = "song-thumbnail";

                    let img = document.createElement("img");
                    img.src = thumbnail;
                    img.alt = title;
                    img.onerror = () => {
                        img.remove();
                        let icon = document.createElement("i");
                        icon.className = "fas fa-music";
                        thumbDiv.appendChild(icon);
                    };
                    thumbDiv.appendChild(img);

                    let titleDiv = document.createElement("div");
                    titleDiv.className = "song-title";
                    titleDiv.textContent = title;

                    songInfo.appendChild(thumbDiv);
                    songInfo.appendChild(titleDiv);

                    let actionDiv = document.createElement("div");
                    actionDiv.className = "song-actions";

                    let playBtn = document.createElement("button");
                    playBtn.innerHTML = '<i class="fas fa-play"></i>';
                    playBtn.onclick = (e) => {
                        e.stopPropagation();
                        playVideo(videoId, title, thumbnail);
                    };

                    let favBtn = document.createElement("button");
                    favBtn.className = "fav-btn";
                    favBtn.setAttribute("data-id", videoId);
                    favBtn.innerHTML = '<i class="fas fa-heart"></i>';

                    // Check if it's already a favorite
                    let favorites = getFromLocalStorage("favorites");
                    if (favorites.some(fav => fav.videoId === videoId)) {
                        favBtn.classList.add("active");
                    }

                    favBtn.onclick = (e) => {
                        e.stopPropagation();
                        addToFavorites(videoId, title, thumbnail);
                    };

                    actionDiv.appendChild(playBtn);
                    actionDiv.appendChild(favBtn);

                    li.appendChild(songInfo);
                    li.appendChild(actionDiv);
                    li.onclick = () => playVideo(videoId, title, thumbnail);

                    resultsList.appendChild(li);
                });
            } else {
                resultsList.innerHTML = "<div class='no-results'>No results found. Try a different search term.</div>";
            }
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            resultsList.innerHTML = `<div class='error'>Error: ${error.message}</div>`;
        });
}

// Play Video with Enhanced Controls
function playVideo(videoId, title, thumbnail = null) {
    player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`;
    player.style.display = "block";

    // Update play button icon
    const playBtn = document.getElementById('play-btn');
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    isPlaying = true;

    // Scroll to player if not in view
    const playerSection = document.querySelector('.now-playing-section');
    playerSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    addToHistory(videoId, title, thumbnail);

    currentVideoIndex = playlist.findIndex(video => video.videoId === videoId);
    if (currentVideoIndex === -1 && playlist.length > 0) {
        // If not in playlist but we're playing something, add it
        playlist.unshift({ videoId, title, thumbnail });
        currentVideoIndex = 0;
    }
}

// Toggle Play/Pause
function togglePlay() {
    const playBtn = document.getElementById('play-btn');

    if (isPlaying) {
        player.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        isPlaying = false;
    } else {
        player.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        isPlaying = true;
    }
}

// Play Previous Track
function playPrevious() {
    if (currentVideoIndex > 0) {
        currentVideoIndex--;
        let prevVideo = playlist[currentVideoIndex];
        playVideo(prevVideo.videoId, prevVideo.title, prevVideo.thumbnail);
    } else {
        showToast("This is the first track in the playlist");
    }
}

// Play Next Track
function playNext() {
    if (currentVideoIndex < playlist.length - 1) {
        currentVideoIndex++;
        let nextVideo = playlist[currentVideoIndex];
        playVideo(nextVideo.videoId, nextVideo.title, nextVideo.thumbnail);
    } else {
        showToast("This is the last track in the playlist");
    }
}

// Toggle Theme
function toggleTheme() {
    document.body.classList.toggle('light-theme');

    const themeIcon = document.querySelector('.theme-toggle i');
    const themeText = document.querySelector('.theme-toggle span');

    if (document.body.classList.contains('light-theme')) {
        themeIcon.className = 'fas fa-sun';
        themeText.textContent = 'Light Mode';
        localStorage.setItem('theme', 'light');
    } else {
        themeIcon.className = 'fas fa-moon';
        themeText.textContent = 'Dark Mode';
        localStorage.setItem('theme', 'dark');
    }
}

// Load saved theme preference
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        const themeIcon = document.querySelector('.theme-toggle i');
        const themeText = document.querySelector('.theme-toggle span');
        themeIcon.className = 'fas fa-sun';
        themeText.textContent = 'Light Mode';
    }
}

// Helper Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return date.toLocaleDateString();
    }
}

// Toast Notification
function showToast(message) {
    // Create toast element if it doesn't exist
    let toast = document.getElementById('toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notification';
        document.body.appendChild(toast);
    }

    // Set message and show toast
    toast.textContent = message;
    toast.classList.add('visible');

    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('visible');
    }, 3000);
}

// Load Favorites & History and Theme on Page Load
document.addEventListener("DOMContentLoaded", function () {
    loadTheme();
    displayFavorites();
    displayHistory();
});
// Add default favorites
function addDefaultFavorites() {
    let favorites = getFromLocalStorage("favorites");

    // Only add default favorites if there are no favorites yet
    if (favorites.length === 0) {
        const defaultSongs = [
            {
                videoId: "K5KAc5CoCuk",
                title: "Tune O Rangeele - Kudrat | Kishore Kumar | R.D. Burman",
                thumbnail: "https://i.ytimg.com/vi/K5KAc5CoCuk/mqdefault.jpg",
                dateAdded: new Date().toISOString()
            },
            {
                videoId: "PBYoqlWjHs4",
                title: "Pal Pal Dil Ke Paas - Blackmail | Kishore Kumar | Kalyanji-Anandji",
                thumbnail: "https://i.ytimg.com/vi/PBYoqlWjHs4/mqdefault.jpg",
                dateAdded: new Date().toISOString()
            },
            {
                videoId: "HAl7GxONVRQ",
                title: "Kya Yehi Pyar Hai - Rocky | Kishore Kumar | R.D. Burman",
                thumbnail: "https://i.ytimg.com/vi/HAl7GxONVRQ/mqdefault.jpg",
                dateAdded: new Date().toISOString()
            },
            {
                videoId: "VwrZR7Gvr0Q",
                title: "Wahan Kaun Hai Tera Musafir - Guide | Mohammed Rafi | S.D. Burman",
                thumbnail: "https://i.ytimg.com/vi/VwrZR7Gvr0Q/mqdefault.jpg",
                dateAdded: new Date().toISOString()
            }
        ];

        // Add all default songs to favorites
        saveToLocalStorage("favorites", defaultSongs);
        console.log("Added default favorites");
    }
}
// Load Favorites & History and Theme on Page Load
document.addEventListener("DOMContentLoaded", function () {
    loadTheme();
    addDefaultFavorites(); // Add this line
    displayFavorites();
    displayHistory();
});