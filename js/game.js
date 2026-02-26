/* ================= GAME ================= */

/* ---------- Reveal Pokémon ---------- */

function reveal(id){
  const p = pokemonData[id-1];
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

  const raw = inputEl.value;

  const guess = raw.toLowerCase().trim()
    .replace(/['’.\- ]/g,"")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"");

  if(!guess) return;

  const pokemon = pokemonData.find(p=>{
    const normalized = p.name.toLowerCase()
      .replace(/['’.\- ]/g,"")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g,"");
    return normalized === guess;
  });

  if(pokemon && !guessedGlobal.has(pokemon.id)){

    guessedGlobal.add(pokemon.id);
    reveal(pokemon.id);

    playCry(pokemon.cry);
    saveProgress();

    updateCounter();
    checkCompletion();

    document.getElementById(`row-${pokemon.id}`)
      .scrollIntoView({behavior:"smooth", block:"center"});

    // ✅ Only clear when correct
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

      fadeOutMusic();
      playCelebration();

      document.getElementById("celebration").style.display = "flex";
    }
  }
}

/* ---------- Give Up ---------- */

function giveUp(){

  gameFinished = true;
  fadeOutMusic();

  let firstMissed = null;

  pokemonData.forEach(p=>{
    if(!guessedGlobal.has(p.id)){

      reveal(p.id);

      const nameEl = document.getElementById(`name-${p.id}`);
      const spriteEl = document.getElementById(`sprite-${p.id}`);

      nameEl.classList.add("missed-name");
      spriteEl.classList.add("grayscale");

      if(!firstMissed) firstMissed = p.id;
    }
  });

  document.getElementById("missedBtn").classList.remove("hidden");

  if(firstMissed){
    document.getElementById(`row-${firstMissed}`)
      .scrollIntoView({behavior:"smooth", block:"center"});
  }
}

/* ---------- Reset Game ---------- */

function resetGame(){

  /* Clear guesses */
  guessedGlobal.clear();
  saveProgress();

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

  /* Reset missed toggle */
  showingMissedOnly = false;
  const missedBtn = document.getElementById("missedBtn");
  missedBtn.classList.add("hidden");
  missedBtn.textContent = "Show Only Missed";

  /* Reset game flags */
  gameFinished = false;

  /* Close overlays safely */
  document.getElementById("celebration").style.display = "none";

  /* Reset input */
  const input = document.getElementById("guessInput");
  if(input) input.value = "";

  /* Audio reset */
  stopMusic();
  if(musicEnabled) startMusic();

  /* Recalculate */
  applyFilter();
}