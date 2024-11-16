let reminders = [];
let intervalId = null;
let vibrationInterval = null;

document.getElementById("reminderForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const age = document.getElementById("age").value;
  const medicineNames = document.querySelectorAll(".medicineName");
  const medicineTimes = document.querySelectorAll(".medicineTime");

  reminders = [];

  for (let i = 0; i < medicineNames.length; i++) {
    reminders.push({
      name: medicineNames[i].value,
      time: medicineTimes[i].value,
    });
  }

  alert(`Reminder set for ${name}, Age: ${age}`);
  startReminder();
});

function addMedicine() {
  const medicineList = document.getElementById("medicineList");
  const medicineEntry = document.createElement("div");
  medicineEntry.className = "medicineEntry";
  medicineEntry.innerHTML = `
    <label>Medicine:</label>
    <input type="text" class="medicineName" required>
    <label>Time:</label>
    <input type="time" class="medicineTime" required>
  `;
  medicineList.appendChild(medicineEntry);
}

function clearForm() {
  document.getElementById("reminderForm").reset();
  reminders = [];
  clearInterval(intervalId);
  stopVibration();
  alert("All reminders cleared.");
}

function startReminder() {
  clearInterval(intervalId); // Clear any existing intervals
  intervalId = setInterval(() => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    reminders.forEach(reminder => {
      if (reminder.time === currentTime) {
        triggerNotification(reminder.name);
      }
    });
  }, 60000); // Check every minute
}

function triggerNotification(medicine) {
  const led = document.getElementById("led");
  const alarmSound = document.getElementById("alarmSound");

  if ("vibrate" in navigator) {
    stopVibration();
    vibrationInterval = setInterval(() => navigator.vibrate([500, 200]), 1000);
  }

  // Show in-app notification modal
  document.getElementById("notificationText").innerText = `Time to take your medicine: ${medicine}`;
  document.getElementById("notificationModal").style.display = "block";
  led.style.display = "block";
  alarmSound.play();

  // Trigger push notification via service worker
  navigator.serviceWorker.ready.then(swRegistration => {
    swRegistration.showNotification("Medicine Reminder", {
      body: `Time to take your medicine: ${medicine}`,
      icon: 'icon.png',
      vibrate: [500, 200, 500]
    });
  });
}

function confirmMedication() {
  const led = document.getElementById("led");
  const alarmSound = document.getElementById("alarmSound");

  // Hide modal and stop LED, sound, and vibration
  document.getElementById("notificationModal").style.display = "none";
  led.style.display = "none";
  alarmSound.pause();
  alarmSound.currentTime = 0;
  stopVibration();

  alert("Medication taken.");
}

function stopVibration() {
  clearInterval(vibrationInterval);
  navigator.vibrate(0); // Stop any ongoing vibration
}
