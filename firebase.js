// // Firebase Config (Replace with your Firebase Credentials)

// // import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
// // import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-analytics.js";


// const firebaseConfig = {
//     apiKey: "AIzaSyARHh_O4IZinaGViPk6wVnRLNjf2Z5DfBo",
//     authDomain: "music-player-57f0a.firebaseapp.com",
//     projectId: "music-player-57f0a",
//     storageBucket: "music-player-57f0a.appspot.com",
//     messagingSenderId: "809108731968",
//     appId: "1:809108731968:web:06bbeb26e6228a28d2c7a5",
//     measurementId: "G-8VTV7SQJML"
// };

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
firebase.initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// Firestore Database Reference
const db = firebase.firestore();


function addToFavorites(videoId, title) {
    db.collection("favorites").doc(videoId).set({ title: title })
        .then(() => console.log("Added to Favorites"))
        .catch(error => console.error("Error adding favorite:", error));
}

function addToHistory(videoId, title) {
    db.collection("history").doc(videoId).set({ title: title, timestamp: new Date() })
        .then(() => console.log("Added to History"))
        .catch(error => console.error("Error adding history:", error));
}

function displayFavorites() {
    db.collection("favorites").get().then(snapshot => {
        let favoritesList = document.getElementById("favorites");
        favoritesList.innerHTML = "";
        snapshot.forEach(doc => {
            let li = document.createElement("li");
            li.textContent = doc.data().title;
            li.onclick = () => playVideo(doc.id, doc.data().title);
            favoritesList.appendChild(li);
        });
    });
}

function displayHistory() {
    db.collection("history").orderBy("timestamp", "desc").get().then(snapshot => {
        let historyList = document.getElementById("history");
        historyList.innerHTML = "";
        snapshot.forEach(doc => {
            let li = document.createElement("li");
            li.textContent = doc.data().title;
            li.onclick = () => playVideo(doc.id, doc.data().title);
            historyList.appendChild(li);
        });
    });
}

function clearHistory() {
    db.collection("history").get().then(snapshot => {
        snapshot.forEach(doc => {
            doc.ref.delete();
        });
    }).then(() => displayHistory());
}
