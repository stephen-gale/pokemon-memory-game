/* ================= GAME ================= */

function scrollToFirstMissedVisible(){
  const firstMissed = pokemonData.find(p=>{
    if(guessedGlobal.has(p.id)) return false;
    const row = document.getElementById(`row-${p.id}`);
    return row && !row.classList.contains("hidden-row");
  });

  if(!firstMissed) return;

  document.getElementById(`row-${firstMissed.id}`)
    .scrollIntoView({behavior:"smooth", block:"center"});
}

function normalizeGuessText(value){
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/['’.\- ]/g,"")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"");
}

function getTypoThreshold(length){
  if(length <= 4) return 1;
  if(length <= 9) return 2;
  return 3;
}

function levenshteinDistance(a, b, maxDistance){
  const aLen = a.length;
  const bLen = b.length;

  if(Math.abs(aLen - bLen) > maxDistance){
    return maxDistance + 1;
  }

  if(aLen === 0) return bLen;
  if(bLen === 0) return aLen;

  let previous = new Array(bLen + 1);
  let current = new Array(bLen + 1);

  for(let j = 0; j <= bLen; j++){
    previous[j] = j;
  }

  for(let i = 1; i <= aLen; i++){
    current[0] = i;
    let rowMin = current[0];

    for(let j = 1; j <= bLen; j++){
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + cost
      );

      if(current[j] < rowMin){
        rowMin = current[j];
      }
    }

    if(rowMin > maxDistance){
      return maxDistance + 1;
    }

    const temp = previous;
    previous = current;
    current = temp;
  }

  return previous[bLen];
}

function resolvePokemonGuess(guess){
  const exact = pokemonData.find(p=>p.normalizedName === guess);
  if(exact) return exact;

  if(!misspellingEnabled) return null;

  if(guess.length < 3) return null;

  const threshold = getTypoThreshold(guess.length);
  let bestMatch = null;
  let bestDistance = threshold + 1;
  let secondBestDistance = threshold + 1;

  for(const p of pokemonData){
    if(!p.normalizedName) continue;

    const normalized = p.normalizedName;

    if(normalized[0] !== guess[0]) continue;
    if(Math.abs(normalized.length - guess.length) > threshold) continue;

    const distance = levenshteinDistance(guess, normalized, threshold);

    if(distance < bestDistance){
      secondBestDistance = bestDistance;
      bestDistance = distance;
      bestMatch = p;
    } else if(distance < secondBestDistance){
      secondBestDistance = distance;
    }
  }

  if(!bestMatch) return null;
  if(bestDistance > threshold) return null;
  if(secondBestDistance === bestDistance) return null;

  return bestMatch;
}

/* ---------- Reveal Pokémon ---------- */

function reveal(id){
  const p = pokemonData.find(pokemon=>pokemon.id === id);
  if(!p) return;

  const nameEl = document.getElementById(`name-${id}`);
  const spriteEl = document.getElementById(`sprite-${id}`);

  nameEl.textContent = p.display;
  nameEl.classList.remove("hidden-name");

  if(p.sprite){
    spriteEl.src = p.sprite;
    spriteEl.style.visibility = "visible";
  }
}

/* ---------- Guess Handling ---------- */

function handleGuess(inputEl){

  if(gameFinished) return;

  timer.handleGuess();

  const raw = inputEl.value;
  const guess = normalizeGuessText(raw);

  if(!guess) return;

  const pokemon = resolvePokemonGuess(guess);

  if(pokemon && !guessedGlobal.has(pokemon.id)){
    guessedGlobal.add(pokemon.id);
    reveal(pokemon.id);

    const rowEl = document.getElementById(`row-${pokemon.id}`);
    if(rowEl){
      rowEl.classList.add("flash");
      setTimeout(()=>{
        rowEl.classList.remove("flash");
      },600);
    }

    // Only play cry if the Pokemon is visible under current filters.
    const isVisible = rowEl && !rowEl.classList.contains("hidden-row");
    if(!audioMuted && pokemon.cry && isVisible){
      playCry(pokemon.cry);
    }

    saveProgress();
    updateCounter();
    checkCompletion();
    document.getElementById(`row-${pokemon.id}`)
      .scrollIntoView({behavior:"smooth", block:"center"});
    inputEl.value = "";
  }
}

/* ---------- Completion Check ---------- */

function checkCompletion(){

  const visible = pokemonData.filter(matchesFilter);
  const guessed = visible.filter(p=>guessedGlobal.has(p.id));

  if(visible.length > 0 && guessed.length === visible.length){

    if(!gameFinished){
      gameFinished = true;

      timer.lock();

      fadeOutMusic();
      playCelebration();

      const timeEl = document.getElementById("completionTime");

      const row = document.querySelector(".game-info-row");
      const timerIsHidden = row.classList.contains("timer-hidden");

      if(!timerIsHidden){
        timeEl.textContent = `Time: ${timer.getTime()}`;
        timeEl.classList.remove("hidden");
      } else {
        timeEl.classList.add("hidden");
      }

      document.getElementById("celebration").style.display = "flex";
    }
    return;
  }

  // Completion is always tied to the currently visible set.
  if(gameFinished){
    gameFinished = false;
    stopCelebration();
    document.getElementById("celebration").style.display = "none";
  }
}

/* ---------- Give Up ---------- */

function giveUp(){

  gameFinished = true;
  timer.lock();

  const timeEl = document.getElementById("completionTime");

  const row = document.querySelector(".game-info-row");
  const timerIsHidden = row.classList.contains("timer-hidden");

  if(!timerIsHidden){
    timeEl.textContent = `Time: ${timer.getTime()}`;
    timeEl.classList.remove("hidden");
  } else {
    timeEl.classList.add("hidden");
  }

  fadeOutMusic();

  let firstMissed = null;

  const visible = pokemonData.filter(matchesFilter);

  visible.forEach(p=>{
    if(!guessedGlobal.has(p.id)){

      reveal(p.id);

      const nameEl = document.getElementById(`name-${p.id}`);
      const spriteEl = document.getElementById(`sprite-${p.id}`);

      nameEl.classList.add("missed-name");
      spriteEl.classList.add("grayscale");

      if(!firstMissed) firstMissed = p.id;
    }
  });

  const postGiveUpRow = document.getElementById("postGiveUpRow");
  const missedBtn = document.getElementById("missedBtn");
  const giveUpResetBtn = document.getElementById("giveUpResetBtn");
  postGiveUpRow.classList.remove("hidden");
  missedBtn.classList.remove("hidden");
  giveUpResetBtn.classList.remove("hidden");

  if(firstMissed){
    document.getElementById(`row-${firstMissed}`)
      .scrollIntoView({behavior:"smooth", block:"center"});
  }

  updateCounter();
}

/* ---------- Reset Game ---------- */

function resetGame(){

  /* Clear guesses */
  guessedGlobal.clear();
  saveProgress();
  localStorage.removeItem(SAVE_KEY);

  timer.reset();

  /* Reset rows cleanly */
  pokemonData.forEach(p=>{

    const nameEl = document.getElementById(`name-${p.id}`);
    const spriteEl = document.getElementById(`sprite-${p.id}`);

    nameEl.textContent = ".";
    nameEl.classList.add("hidden-name");
    nameEl.classList.remove("missed-name");

    // Prevent broken sprite icon
    spriteEl.src = "";
    spriteEl.style.visibility = "hidden";
    spriteEl.classList.remove("grayscale");
  });

  /* Restore filters */
  activeCategories.clear();
  categories.forEach(c=>activeCategories.add(c));

  selectedGenerations.clear();
  supportedGenerations.forEach(gen=>selectedGenerations.add(gen.id));

  document.querySelectorAll("#generationContainer input[data-generation]")
    .forEach(cb=>{
      cb.checked = true;
    });

  document.querySelectorAll("#categoryContainer input[data-cat]")
    .forEach(cb=>{
      cb.checked = true;
    });

  saveFilters();

  /* Reset missed toggle */
  showingMissedOnly = false;
  const postGiveUpRow = document.getElementById("postGiveUpRow");
  const missedBtn = document.getElementById("missedBtn");
  const giveUpResetBtn = document.getElementById("giveUpResetBtn");
  postGiveUpRow.classList.add("hidden");
  missedBtn.classList.add("hidden");
  missedBtn.textContent = "Show Only Missed";
  giveUpResetBtn.classList.add("hidden");

  /* Reset game flags */
  gameFinished = false;

  /* Close overlays safely */
  stopCelebration();
  document.getElementById("celebration").style.display = "none";
  document.getElementById("confirmOverlay").style.display = "none";
  document.getElementById("settingsOverlay").style.display = "none";
  document.getElementById("sheetOverlay").style.display = "none";
  document.getElementById("pokemonSheet").classList.remove("open");
  document.body.style.overflow = "";

  /* Reset input */
  const input = document.getElementById("guessInput");
  if(input) input.value = "";

  /* Audio reset */
  stopMusic();
  if(!audioMuted) startMusic();

  /* Recalculate */
  applyFilter();
}
