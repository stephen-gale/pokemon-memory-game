/* ================= UI ================= */

function initUI(){
  function syncTimerVisibilityButton(){
    const btn = document.getElementById("timerVisibilityBtn");
    if(!btn) return;

    const timerIsVisible = timer.isVisible();
    btn.textContent = timerIsVisible ? "🕒" : "🚫";
    btn.setAttribute(
      "aria-label",
      timerIsVisible ? "Timer visible" : "Timer hidden"
    );
  }

  function syncDarkModeButton(){
    const btn = document.getElementById("darkModeBtn");
    if(!btn) return;
    btn.textContent = darkModeEnabled ? "🌙" : "☀️";
    btn.setAttribute(
      "aria-label",
      darkModeEnabled ? "Dark mode enabled" : "Light mode enabled"
    );
  }

  function syncMuteButton(){
    const btn = document.getElementById("muteBtn");
    if(!btn) return;
    btn.textContent = audioMuted ? "🔇" : "🔊";
    btn.setAttribute(
      "aria-label",
      audioMuted ? "Audio muted" : "Audio unmuted"
    );
  }

  function initAccordion(buttonId, sectionId){
    const button = document.getElementById(buttonId);
    const section = document.getElementById(sectionId);
    if(!button || !section) return;

    button.onclick = ()=>{
      const isCollapsed = section.classList.toggle("collapsed");
      button.setAttribute("aria-expanded", String(!isCollapsed));
    };
  }

  /* ---- Guess Input ---- */
document.getElementById("guessInput")
  .addEventListener("input", e=>{
    handleGuess(e.target);
  });

  /* ---- Settings Overlay ---- */
  const settingsOverlay = document.getElementById("settingsOverlay");
  const timerVisibilityBtn = document.getElementById("timerVisibilityBtn");
  const darkModeBtn = document.getElementById("darkModeBtn");
  const muteBtn = document.getElementById("muteBtn");

  syncTimerVisibilityButton();
  timerVisibilityBtn.onclick=()=>{
    timer.setVisibility(!timer.isVisible());
    syncTimerVisibilityButton();
  };

  syncDarkModeButton();
  darkModeBtn.onclick=()=>{
    darkModeEnabled = !darkModeEnabled;
    localStorage.setItem(DARK_MODE_SAVE_KEY, darkModeEnabled);
    applyDarkMode();
    syncDarkModeButton();
  };

  syncMuteButton();
  if(muteBtn){
    muteBtn.onclick = ()=>{
      setAudioMuted(!audioMuted);
      syncMuteButton();
    };
  }

  document.getElementById("settingsBtn").onclick=()=>{
    timer.pauseForSettings();
    settingsOverlay.style.display="flex";
    document.body.style.overflow="hidden";
  };

  document.getElementById("closeSettings").onclick=()=>{
    settingsOverlay.style.display="none";
    document.body.style.overflow="";
  };

  /* ---- Pokémon Select Drawer ---- */

  const sheet = document.getElementById("pokemonSheet");
  const sheetOverlay = document.getElementById("sheetOverlay");
  const doneBtn = document.getElementById("doneBtn");

  document.getElementById("openSelect").onclick=()=>{
    sheetOverlay.style.display="block";
    sheet.classList.add("open");
    document.body.style.overflow="hidden";
  };

  initAccordion("generationAccordionBtn", "generationSection");
  initAccordion("categoriesAccordionBtn", "categoriesSection");

  function closeSheet(){
    // Prevent closing if no generation is selected.
    if(selectedGenerations.size === 0) return;

    sheet.classList.remove("open");
    sheetOverlay.style.display="none";
    document.body.style.overflow="";
  }

  doneBtn.onclick = closeSheet;

  sheetOverlay.addEventListener("click", e => {
    if (e.target === sheetOverlay) {
      closeSheet();
    }
  });

  /* ---- Give Up ---- */
  const confirmOverlay = document.getElementById("confirmOverlay");
  const settingsPanel = document.getElementById("settingsOverlay");

  document.getElementById("giveUpBtn").onclick=()=>{
    confirmOverlay.style.display = "flex";
  };

  document.getElementById("cancelGiveUp").onclick=()=>{
    confirmOverlay.style.display = "none";
  };

  document.getElementById("confirmGiveUp").onclick=()=>{
    confirmOverlay.style.display = "none";
    settingsPanel.style.display = "none";
    document.body.style.overflow = "";
    giveUp();
  };

  /* ---- Reset ---- */
  document.getElementById("restartBtn").onclick=resetGame;
  document.getElementById("giveUpResetBtn").onclick=resetGame;

/* ---- Play/Pause Control ---- */
document.getElementById("timerBtn").onclick = timer.toggle;

  /* ---- Show Only Missed ---- */
  document.getElementById("missedBtn").onclick=()=>{
    showingMissedOnly = !showingMissedOnly;
    document.getElementById("missedBtn").textContent =
      showingMissedOnly ? "Show All" : "Show Only Missed";
    applyFilter();
    if(showingMissedOnly){
      scrollToFirstMissedVisible();
    }
  };

  /* ---- Close Celebration ---- */
  document.getElementById("closeCelebration").onclick=()=>{
    stopCelebration();
    document.getElementById("celebration").style.display="none";
    gameFinished=false;
    if(!audioMuted) startMusic();
  };

  /* ---- Mispelling Toggle ---- */
  const misspellingToggle = document.getElementById("misspellingToggle");
  misspellingToggle.checked = misspellingEnabled;

  misspellingToggle.addEventListener("change", e=>{
    misspellingEnabled = e.target.checked;
    localStorage.setItem(MISSPELLING_SAVE_KEY, misspellingEnabled);
  });

}
