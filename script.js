// Firebase Config (Replace with your Firebase Credentials)
const firebaseConfig = {
    apiKey: "AIzaSyARHh_O4IZinaGViPk6wVnRLNjf2Z5DfBo",
    authDomain: "music-player-57f0a.firebaseapp.com",
    projectId: "music-player-57f0a",
    storageBucket: "music-player-57f0a.firebasestorage.app",
    messagingSenderId: "809108731968",
    appId: "1:809108731968:web:06bbeb26e6228a28d2c7a5",
    measurementId: "G-8VTV7SQJML"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Local Storage Functions
function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getFromLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

// Add to Favorites (Firebase + Local Storage)
function addToFavorites(videoId, title) {
    let favorites = getFromLocalStorage("favorites");
    if (!favorites.some(fav => fav.videoId === videoId)) {
        favorites.push({ videoId, title });
        saveToLocalStorage("favorites", favorites);
    }

    db.collection("favorites").doc(videoId).set({ title: title })
        .then(() => console.log("Added to Favorites"))
        .catch(error => console.error("Error adding favorite:", error));

    displayFavorites();
}

// Add to History (Firebase + Local Storage)
function addToHistory(videoId, title) {
    let history = getFromLocalStorage("history");
    history.unshift({ videoId, title, timestamp: new Date().toISOString() });
    saveToLocalStorage("history", history);

    db.collection("history").doc(videoId).set({ title: title, timestamp: new Date() })
        .then(() => console.log("Added to History"))
        .catch(error => console.error("Error adding history:", error));

    displayHistory();
}

// Display Favorites (Firebase + Local Storage)
function displayFavorites() {
    let favorites = getFromLocalStorage("favorites");
    let favoritesList = document.getElementById("favorites");
    favoritesList.innerHTML = "";

    favorites.forEach(fav => {
        let li = document.createElement("li");
        li.textContent = fav.title;
        li.onclick = () => playVideo(fav.videoId, fav.title);
        favoritesList.appendChild(li);
    });

    db.collection("favorites").get().then(snapshot => {
        snapshot.forEach(doc => {
            if (!favorites.some(fav => fav.videoId === doc.id)) {
                let li = document.createElement("li");
                li.textContent = doc.data().title;
                li.onclick = () => playVideo(doc.id, doc.data().title);
                favoritesList.appendChild(li);
            }
        });
    });
}

// Display History (Firebase + Local Storage)
function displayHistory() {
    let history = getFromLocalStorage("history");
    let historyList = document.getElementById("history");
    historyList.innerHTML = "";

    history.forEach(hist => {
        let li = document.createElement("li");
        li.textContent = hist.title;
        li.onclick = () => playVideo(hist.videoId, hist.title);
        historyList.appendChild(li);
    });

    db.collection("history").orderBy("timestamp", "desc").get().then(snapshot => {
        snapshot.forEach(doc => {
            if (!history.some(hist => hist.videoId === doc.id)) {
                let li = document.createElement("li");
                li.textContent = doc.data().title;
                li.onclick = () => playVideo(doc.id, doc.data().title);
                historyList.appendChild(li);
            }
        });
    });
}

// Clear History (Local + Firebase)
function clearHistory() {
    localStorage.removeItem("history");
    db.collection("history").get().then(snapshot => {
        snapshot.forEach(doc => {
            doc.ref.delete();
        });
    }).then(() => displayHistory());
}

// YouTube API Integration
const apiKey = "AIzaSyAhj6eBJ7yg8pIIWRdvVHgq06y2NCE_VQI";
const searchInput = document.getElementById("search");
const resultsList = document.getElementById("results");
const player = document.getElementById("player");

searchInput.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        searchYouTube(searchInput.value);
    }
});

let playlist = [];
let currentVideoIndex = 0;

function searchYouTube(query) {
    fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&key=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            resultsList.innerHTML = "";
            playlist = [];
            currentVideoIndex = 0;

            data.items.forEach(item => {
                let videoId = item.id.videoId;
                let title = item.snippet.title;
                playlist.push({ videoId, title });

                let li = document.createElement("li");
                li.textContent = title;
                li.onclick = () => playVideo(videoId, title);

                // Add favorite button
                let favBtn = document.createElement("button");
                favBtn.textContent = "★";
                favBtn.onclick = (event) => {
                    event.stopPropagation();
                    addToFavorites(videoId, title);
                };

                li.appendChild(favBtn);
                resultsList.appendChild(li);
            });
        })
        .catch(error => console.error("Error fetching data:", error));
}

// Play Video with Auto-Next Feature
function playVideo(videoId, title) {
    player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&vq=small`;
    player.style.display = "block";
    addToHistory(videoId, title);

    currentVideoIndex = playlist.findIndex(video => video.videoId === videoId);

    player.onload = () => {
        player.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
    };
}

// Auto Play Next Video if Current Ends
player.addEventListener("ended", function () {
    if (currentVideoIndex < playlist.length - 1) {
        currentVideoIndex++;
        let nextVideo = playlist[currentVideoIndex];
        playVideo(nextVideo.videoId, nextVideo.title);
    }
});

// Load Favorites & History on Page Load
document.addEventListener("DOMContentLoaded", function () {
    displayFavorites();
    displayHistory();
});
