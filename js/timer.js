/* ================= TIMER SYSTEM ================= */

const TIMER_SAVE_KEY = "gen1-memory-timer";

const TIMER_VISIBILITY_KEY = "gen1-memory-timer-visibility";

const MAX_SECONDS = (99 * 60) + 59;

let elapsedSeconds = 0;
let timerInterval = null;
let timerState = "stopped"; 
// "stopped" | "running" | "paused" | "locked"

let timerVisible = true;

/* ---------- Utilities ---------- */

function formatTime(seconds){
  const mins = String(Math.floor(seconds / 60)).padStart(2,"0");
  const secs = String(seconds % 60).padStart(2,"0");
  return `${mins}:${secs}`;
}

function updateDisplay(){
  const display = document.getElementById("timerDisplay");
  if(display){
    display.textContent = formatTime(elapsedSeconds);
  }
}

/* ---------- Persistence ---------- */

function saveTimer(){
  localStorage.setItem(TIMER_SAVE_KEY, JSON.stringify({
    elapsedSeconds,
    timerState
  }));
}

function loadTimer(){
  const saved = JSON.parse(localStorage.getItem(TIMER_SAVE_KEY) || "null");
  if(!saved) return;

  elapsedSeconds = saved.elapsedSeconds || 0;

  // If it was running before refresh, restore as paused
  timerState = saved.timerState === "running"
    ? "paused"
    : saved.timerState || "stopped";
}

/* ---------- Core Controls ---------- */

function startTimer(){
  if(timerState === "locked") return;
  if(timerState === "running") return;

  timerState = "running";

  timerInterval = setInterval(()=>{
    elapsedSeconds++;

    if(elapsedSeconds >= MAX_SECONDS){
      elapsedSeconds = MAX_SECONDS;
      lockTimer();
      return;
    }

    updateDisplay();
    saveTimer();
  },1000);

  updateTimerButton();
  saveTimer();
}

function pauseTimer(){
  if(timerState !== "running") return;

  clearInterval(timerInterval);
  timerInterval = null;
  timerState = "paused";

  updateTimerButton();
  saveTimer();
}

function toggleTimer(){
  if(timerState === "running"){
    pauseTimer();
  } else if(timerState === "stopped" || timerState === "paused"){
    startTimer();
  }
}

function lockTimer(){
  clearInterval(timerInterval);
  timerInterval = null;
  timerState = "locked";

  updateTimerButton();
  saveTimer();
}

function resetTimer(){
  clearInterval(timerInterval);
  timerInterval = null;
  elapsedSeconds = 0;
  timerState = "stopped";

  updateDisplay();
  updateTimerButton();
  saveTimer();
}

/* ---------- Guess Hook ---------- */

function handleTimerGuess(){
  if(timerState === "stopped" || timerState === "paused"){
    startTimer();
  }
}

/* ---------- Visibility Auto-Pause ---------- */

document.addEventListener("visibilitychange", ()=>{
  if(document.visibilityState === "hidden"){
    pauseTimer();
  }
});

/* ---------- Menu Pause Hook ---------- */

function pauseForMenu(){
  pauseTimer();
}

/* ---------- Button UI ---------- */

function updateTimerButton(){
  const btn = document.getElementById("timerBtn");
  if(!btn) return;

  if(timerState === "running"){
    btn.textContent = "⏸";
    btn.disabled = false;
  }
  else if(timerState === "locked"){
    btn.textContent = "⏸";
    btn.disabled = true;
  }
  else{
    btn.textContent = "▶";
    btn.disabled = false;
  }
}

/* ---------- Visibility Toggle ---------- */

function setTimerVisibility(visible){
  timerVisible = visible;

  const row = document.querySelector(".game-info-row");

  if(visible){
    row.classList.remove("timer-hidden");
  } else {
    row.classList.add("timer-hidden");
  }

  // Persist preference
  localStorage.setItem(
    TIMER_VISIBILITY_KEY,
    JSON.stringify(visible)
  );
}

/* ---------- Public API ---------- */

window.timer = {
init(){
  loadTimer();

  const savedVisibility =
    JSON.parse(localStorage.getItem(TIMER_VISIBILITY_KEY) || "true");

  setTimerVisibility(savedVisibility);

  updateDisplay();
  updateTimerButton();
},
  toggle: toggleTimer,
  handleGuess: handleTimerGuess,
  pauseForMenu,
  lock: lockTimer,
  reset: resetTimer,
  setVisibility: setTimerVisibility,
  getTime(){
    return formatTime(elapsedSeconds);
  },
  isVisible(){
    return timerVisible;
  }
};
