/* ================= UI ================= */

function initUI(){

  /* ---- Guess Input ---- */
document.getElementById("guessInput")
  .addEventListener("input", e=>{
    handleGuess(e.target);
  });

  /* ---- Settings Overlay ---- */
  const settingsOverlay = document.getElementById("settingsOverlay");

  document.getElementById("settingsBtn").onclick=()=>{
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

  function closeSheet(){
    // Prevent closing if no Pokémon selected
    const visible = pokemonData.filter(matchesFilter);
    if(visible.length === 0) return;

    sheet.classList.remove("open");
    sheetOverlay.style.display="none";
    document.body.style.overflow="";
  }

  doneBtn.onclick = closeSheet;

  sheetOverlay.onclick = closeSheet;

  /* ---- Give Up ---- */
  document.getElementById("giveUpBtn").onclick=giveUp;

  /* ---- Reset ---- */
  document.getElementById("restartBtn").onclick=resetGame;

  /* ---- Show Only Missed ---- */
  document.getElementById("missedBtn").onclick=()=>{
    showingMissedOnly = !showingMissedOnly;
    document.getElementById("missedBtn").textContent =
      showingMissedOnly ? "Show All" : "Show Only Missed";
    applyFilter();
  };

  /* ---- Close Celebration ---- */
  document.getElementById("closeCelebration").onclick=()=>{
    document.getElementById("celebration").style.display="none";
    gameFinished=false;
    if(musicEnabled) startMusic();
  };

  /* ---- Cry Toggle ---- */
  const cryToggle = document.getElementById("cryToggle");
  cryToggle.checked = criesEnabled;

  cryToggle.addEventListener("change", e=>{
    criesEnabled = e.target.checked;
    localStorage.setItem("criesEnabled", criesEnabled);
  });

  /* ---- Music Toggle ---- */
  const musicToggle = document.getElementById("musicToggle");
  musicToggle.checked = musicEnabled;

  musicToggle.addEventListener("change", e=>{
    musicEnabled = e.target.checked;
    localStorage.setItem("musicEnabled", musicEnabled);

    if(musicEnabled){
      startMusic();
    } else {
      stopMusic();
    }
  });

}
