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
  
  // Ignore input if locked (prevents typing overflow after correct guess)
  if(inputLocked) {
    inputEl.value = "";
    return;
  }

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

    // Award hint token every 3 guesses
    const guessCount = guessedGlobal.size;
    if(guessCount % 3 === 0){
      hintTokens++;
      updateHintButton();
    }

    // Check if hint dialog needs to update (unlimited hints mode)
    checkAndUpdateHintIfGuessed();

    saveProgress();
    updateCounter();
    checkCompletion();
    document.getElementById(`row-${pokemon.id}`)
      .scrollIntoView({behavior:"smooth", block:"center"});
    inputEl.value = "";
    
    // Lock input briefly to prevent typing overflow
    inputLocked = true;
    setTimeout(() => {
      inputLocked = false;
    }, 300);
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
      const hintsEl = document.getElementById("completionHints");

      const row = document.querySelector(".game-info-row");
      const timerIsHidden = row.classList.contains("timer-hidden");

      if(!timerIsHidden){
        timeEl.textContent = `Time: ${timer.getTime()}`;
        timeEl.classList.remove("hidden");
      } else {
        timeEl.classList.add("hidden");
      }

      // Show hints used if hints are enabled
      if(hintsEnabled){
        hintsEl.textContent = `Hints used: ${hintsUsed}`;
        hintsEl.classList.remove("hidden");
      } else {
        hintsEl.classList.add("hidden");
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
  updateHintButton(); // Hide hint button

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
  givenUpPokemon.clear();
  saveProgress();
  localStorage.removeItem(SAVE_KEY);

  /* Reset hint system */
  hintTokens = 0;
  hintsUsed = 0;
  localStorage.setItem(HINT_TOKENS_SAVE_KEY, hintTokens);
  localStorage.setItem(HINTS_USED_SAVE_KEY, hintsUsed);
  updateHintButton();

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
  document.getElementById("menuOverlay").style.display = "none";
  document.getElementById("sheetOverlay").style.display = "none";
  document.getElementById("pokemonSheet").classList.remove("open");
  document.getElementById("hintOverlay").style.display = "none";
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

/* ---------- Hint System ---------- */

function updateHintButton(){
  const hintBtn = document.getElementById("hintBtn");
  const hintBadge = document.getElementById("hintBadge");
  
  if(!hintsEnabled || gameFinished){
    hintBtn.style.display = "none";
    return;
  }
  
  hintBtn.style.display = "flex";
  
  if(unlimitedHints){
    hintBadge.textContent = "∞";
    hintBtn.disabled = false;
    hintBtn.classList.remove("disabled");
  } else {
    hintBadge.textContent = hintTokens;
    if(hintTokens === 0){
      hintBtn.disabled = true;
      hintBtn.classList.add("disabled");
    } else {
      hintBtn.disabled = false;
      hintBtn.classList.remove("disabled");
    }
  }
  
  // Save hint tokens
  localStorage.setItem(HINT_TOKENS_SAVE_KEY, hintTokens);
}

function updateAnotherHintButton(){
  const anotherHintBtn = document.getElementById("anotherHint");
  
  if(unlimitedHints){
    anotherHintBtn.disabled = false;
  } else {
    anotherHintBtn.disabled = hintTokens === 0;
  }
}

function displayHintPokemon(){
  // Get unguessed Pokemon from current filter (exclude both guessed and given up)
  const unguessed = pokemonData.filter(p => {
    if(guessedGlobal.has(p.id)) return false;
    if(givenUpPokemon.has(p.id)) return false;
    return matchesFilter(p);
  });
  
  if(unguessed.length === 0) return null;
  
  // Pick random Pokemon
  const randomPokemon = unguessed[Math.floor(Math.random() * unguessed.length)];
  
  // Build hint text
  const name = randomPokemon.display;
  const firstThree = name.substring(0, 3);
  const remaining = name.length > 3 ? "_".repeat(name.length - 3) : "";
  const hintText = firstThree + remaining;
  
  // Update dialog
  const hintSprite = document.getElementById("hintSprite");
  const hintTextEl = document.getElementById("hintText");
  
  hintSprite.src = randomPokemon.sprite || "";
  hintTextEl.textContent = hintText;
  
  // Store current hint pokemon ID for tracking
  window.currentHintPokemonId = randomPokemon.id;
  
  return randomPokemon;
}

function checkAndUpdateHintIfGuessed(){
  // Only auto-update if unlimited hints is enabled and hint dialog is open
  if(!unlimitedHints) return;
  
  const hintOverlay = document.getElementById("hintOverlay");
  if(hintOverlay.style.display !== "flex") return;
  
  // Check if the currently displayed hint pokemon was just guessed or given up
  if(window.currentHintPokemonId && (guessedGlobal.has(window.currentHintPokemonId) || givenUpPokemon.has(window.currentHintPokemonId))){
    // Display a new hint automatically
    const pokemon = displayHintPokemon();
    if(!pokemon){
      // No more unguessed pokemon, close the dialog
      closeHintDialog();
    }
  }
}

function giveUpHintPokemon(){
  if(!window.currentHintPokemonId) return;
  
  const pokemonId = window.currentHintPokemonId;
  
  // Mark as given up
  givenUpPokemon.add(pokemonId);
  
  // Reveal the Pokemon with "missed" styling (shared with global give up)
  reveal(pokemonId);
  
  const nameEl = document.getElementById(`name-${pokemonId}`);
  const spriteEl = document.getElementById(`sprite-${pokemonId}`);
  
  if(nameEl) nameEl.classList.add("missed-name");
  if(spriteEl) spriteEl.classList.add("grayscale");
  
  // Scroll to the revealed Pokemon
  const rowEl = document.getElementById(`row-${pokemonId}`);
  if(rowEl){
    rowEl.scrollIntoView({behavior:"smooth", block:"center"});
  }
  
  // In unlimited hints mode, automatically show next hint
  if(unlimitedHints){
    const pokemon = displayHintPokemon();
    if(!pokemon){
      // No more unguessed pokemon, close the dialog
      closeHintDialog();
    }
    // Don't refocus - keep existing focus state to prevent keyboard jump
  } else {
    // In normal mode, close the hint dialog
    closeHintDialog();
    // Restore focus only if input doesn't already have it
    const guessInput = document.getElementById("guessInput");
    if(guessInput && document.activeElement !== guessInput){
      setTimeout(() => guessInput.focus(), 100);
    }
  }
}

function showHint(){
  if(!hintsEnabled || gameFinished) return;
  if(!unlimitedHints && hintTokens === 0) return;
  
  // Consume token
  if(!unlimitedHints){
    hintTokens--;
  }
  hintsUsed++;
  
  // Save hints used
  localStorage.setItem(HINTS_USED_SAVE_KEY, hintsUsed);
  
  updateHintButton();
  
  // Display hint
  const pokemon = displayHintPokemon();
  if(!pokemon) return;
  
  // Show dialog
  const hintOverlay = document.getElementById("hintOverlay");
  hintOverlay.style.display = "flex";
  document.body.style.overflow = "hidden";
  
  // Update another hint button state
  updateAnotherHintButton();
  
  // Adjust for keyboard on mobile
  adjustHintDialogForKeyboard();
  
  // Keep focus on input field only if not already focused
  const guessInput = document.getElementById("guessInput");
  if(guessInput && document.activeElement !== guessInput){
    setTimeout(() => guessInput.focus(), 0);
  }
}

function adjustHintDialogForKeyboard(){
  // Use Visual Viewport API to detect keyboard
  if(window.visualViewport){
    const updatePosition = () => {
      const hintPanel = document.querySelector(".hint-panel");
      if(!hintPanel) return;
      
      const viewportHeight = window.visualViewport.height;
      const windowHeight = window.innerHeight;
      
      // If viewport is significantly smaller than window, keyboard is likely showing
      if(windowHeight - viewportHeight > 150){
        hintPanel.style.maxHeight = `${viewportHeight * 0.7}px`;
        hintPanel.style.top = `${viewportHeight * 0.05}px`;
      } else {
        hintPanel.style.maxHeight = "";
        hintPanel.style.top = "";
      }
    };
    
    // Update on viewport resize (keyboard show/hide)
    window.visualViewport.addEventListener("resize", updatePosition);
    window.visualViewport.addEventListener("scroll", updatePosition);
    
    // Initial update
    updatePosition();
    
    // Store cleanup function
    if(!window.hintViewportCleanup){
      window.hintViewportCleanup = () => {
        window.visualViewport.removeEventListener("resize", updatePosition);
        window.visualViewport.removeEventListener("scroll", updatePosition);
      };
    }
  }
}

function showAnotherHint(){
  if(!hintsEnabled || gameFinished) return;
  if(!unlimitedHints && hintTokens === 0) return;
  
  // Consume token
  if(!unlimitedHints){
    hintTokens--;
  }
  hintsUsed++;
  
  // Save hints used
  localStorage.setItem(HINTS_USED_SAVE_KEY, hintsUsed);
  
  updateHintButton();
  
  // Display new hint
  const pokemon = displayHintPokemon();
  if(!pokemon){
    closeHintDialog();
    return;
  }
  
  // Update another hint button state
  updateAnotherHintButton();
  
  // Don't refocus - keep existing focus state to prevent keyboard jump
}

function closeHintDialog(){
  const hintOverlay = document.getElementById("hintOverlay");
  hintOverlay.style.display = "none";
  document.body.style.overflow = "";
  
  // Cleanup viewport listeners
  if(window.hintViewportCleanup){
    window.hintViewportCleanup();
    window.hintViewportCleanup = null;
  }
  
  // Reset panel styles
  const hintPanel = document.querySelector(".hint-panel");
  if(hintPanel){
    hintPanel.style.maxHeight = "";
    hintPanel.style.top = "";
  }
}
