const queueList = document.getElementById("queueList");
const serviceTimeInput = document.getElementById("serviceTimeInput");
const setServiceTimeBtn = document.getElementById("setServiceTimeBtn");

const socket = io();

function renderQueue(queue) {
  queueList.innerHTML = "";

  queue.forEach((u, index) => {
    const li = document.createElement("li");
    li.className = `flex justify-between items-center p-4 rounded-xl transition-all ${
      u.position === 1 ? "bg-green-700 animate-pulse" : "bg-gray-800"
    }`;

    li.innerHTML = `
      <div>
        <strong>${index + 1}. ${u.name}</strong> (ETA: ${u.eta} min)
      </div>
      <div class="flex gap-2">
        <button class="bg-green-500 px-3 py-1 rounded hover:bg-green-400 transition-all">Served</button>
        <button class="bg-red-500 px-3 py-1 rounded hover:bg-red-400 transition-all">Remove</button>
      </div>
    `;

    // Served
    li.querySelector("button:first-child").addEventListener("click", async () => {
      await fetch("/served", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: u.id })
      });
    });

    // Remove
    li.querySelector("button:last-child").addEventListener("click", async () => {
      await fetch("/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: u.id })
      });
    });

    queueList.appendChild(li);
  });
}

socket.on("queueUpdate", renderQueue);

setServiceTimeBtn.addEventListener("click", async () => {
  const minutes = parseInt(serviceTimeInput.value);
  if (!minutes || minutes <= 0) return alert("Enter valid minutes");

  await fetch("/setServiceTime", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ minutes })
  });
});
