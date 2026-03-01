/* ================= UI ================= */

function initUI(){
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

  /* ---- Menu Overlay ---- */
  const menuOverlay = document.getElementById("menuOverlay");
  const timerVisibilityToggle = document.getElementById("timerVisibilityToggle");
  const darkModeToggle = document.getElementById("darkModeToggle");
  const muteToggle = document.getElementById("muteToggle");

  if(timerVisibilityToggle){
    timerVisibilityToggle.checked = timer.isVisible();
    timerVisibilityToggle.addEventListener("change", e=>{
      timer.setVisibility(e.target.checked);
    });
  }

  if(darkModeToggle){
    darkModeToggle.checked = darkModeEnabled;
    darkModeToggle.addEventListener("change", e=>{
      darkModeEnabled = e.target.checked;
      localStorage.setItem(DARK_MODE_SAVE_KEY, darkModeEnabled);
      applyDarkMode();
    });
  }

  if(muteToggle){
    muteToggle.checked = audioMuted;
    muteToggle.addEventListener("change", e=>{
      setAudioMuted(e.target.checked);
    });
  }

  document.getElementById("menuBtn").onclick=()=>{
    timer.pauseForMenu();
    menuOverlay.style.display="flex";
    document.body.style.overflow="hidden";
  };

  document.getElementById("closeMenu").onclick=()=>{
    menuOverlay.style.display="none";
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
  const menuPanel = document.getElementById("menuOverlay");

  document.getElementById("giveUpBtn").onclick=()=>{
    confirmOverlay.style.display = "flex";
  };

  document.getElementById("cancelGiveUp").onclick=()=>{
    confirmOverlay.style.display = "none";
  };

  document.getElementById("confirmGiveUp").onclick=()=>{
    confirmOverlay.style.display = "none";
    menuPanel.style.display = "none";
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
