const displayName = document.getElementById("displayName");
const positionEl = document.getElementById("position");
const progressBar = document.getElementById("progressBar");
const historyDiv = document.getElementById("history");

let user = null;
let countdownInterval = null;
let lastPosition = null;
let queueHistory = [];

const socket = io();

// Get user from login
const storedName = localStorage.getItem("userName");
if (!storedName) {
  alert("No user found. Redirecting to login.");
  window.location.href = "login.html";
} else {
  displayName.innerText = storedName;
}

// Join queue automatically
(async () => {
  const res = await fetch("/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: storedName })
  });
  user = await res.json();
})();

// Countdown
function startCountdown(seconds) {
  if (countdownInterval) clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    if (seconds <= 0) return clearInterval(countdownInterval);

    const minutes = Math.floor(seconds / 60);
    const sec = seconds % 60;
    document.getElementById("eta").innerText = `ETA: ${minutes}m ${sec}s`;
    seconds--;
  }, 1000);
}

// Queue updates
socket.on("queueUpdate", (queue) => {
  if (!user) return;

  const myData = queue.find(u => u.id === user.id);

  if (!myData) {
    alert("You have been served. Thank you!");
    localStorage.removeItem("userName");
    window.location.href = "login.html";
    return;
  }

  user.position = myData.position;
  positionEl.innerText = myData.position;

  // Use backend ETA (clean & correct)
  startCountdown(myData.eta * 60);

  // Progress bar
  const maxPosition = queue.length || 1;
  const progress = ((maxPosition - myData.position + 1) / maxPosition) * 100;
  progressBar.style.width = `${progress}%`;

  // History
  queueHistory.push({
    timestamp: new Date().toLocaleTimeString(),
    position: myData.position
  });

  historyDiv.innerHTML = queueHistory
    .map(h => `${h.timestamp} - Position: ${h.position}`)
    .join("<br>");

  // Notify when next
  if (user.position === 1 && lastPosition !== 1) {
    if (Notification.permission === "granted") {
      new Notification("SmartQueue", { body: "You are next!" });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(p => {
        if (p === "granted") {
          new Notification("SmartQueue", { body: "You are next!" });
        }
      });
    }

    const audio = new Audio("https://www.soundjay.com/buttons/sounds/beep-07.mp3");
    audio.play();
  }

  lastPosition = user.position;
});
