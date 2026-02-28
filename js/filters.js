/* ================= FILTERS ================= */

function toCheckboxId(prefix, value){
  return `${prefix}-${String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function buildCategoryUI(){
  loadFilters(); // restore saved filters before rendering

  const generationContainer = document.getElementById("generationContainer");
  generationContainer.innerHTML = "";

  supportedGenerations.forEach(gen=>{
    const checkboxId = toCheckboxId("generation", gen.id);
    const label = document.createElement("label");
    label.className = "toggle";
    label.setAttribute("for", checkboxId);
    label.innerHTML = `
      <input id="${checkboxId}" type="checkbox" data-generation="${gen.id}" ${selectedGenerations.has(gen.id) ? "checked" : ""}>
      <span>${gen.label}</span>
    `;
    generationContainer.appendChild(label);
  });

  const container = document.getElementById("categoryContainer");
  container.innerHTML = "";

  categories.forEach(cat=>{
    const checkboxId = toCheckboxId("category", cat);
    const label = document.createElement("label");
    label.className = "toggle";
    label.setAttribute("for", checkboxId);
    label.innerHTML = `
      <input id="${checkboxId}" type="checkbox" data-cat="${cat}" ${activeCategories.has(cat) ? "checked" : ""}>
      <span>${cat}</span>
    `;
    container.appendChild(label);
  });

  attachFilterListeners();
}

/* ================= FILTER PERSISTENCE ================= */

function saveFilters(){
  localStorage.setItem(
    FILTER_SAVE_KEY,
    JSON.stringify({
      categories: [...activeCategories],
      generations: [...selectedGenerations]
    })
  );
}

function loadFilters(){
  const saved = JSON.parse(localStorage.getItem(FILTER_SAVE_KEY) || "null");
  if(!saved) return;

  // Backward compatibility with older category-only persistence.
  if(Array.isArray(saved)){
    activeCategories = new Set(saved.filter(cat=>categories.includes(cat)));
    return;
  }

  if(Array.isArray(saved.categories)){
    activeCategories = new Set(saved.categories.filter(cat=>categories.includes(cat)));
  }

  if(Array.isArray(saved.generations)){
    selectedGenerations = new Set(
      saved.generations
        .map(Number)
        .filter(genId=>supportedGenerations.some(gen=>gen.id === genId))
    );
  }
}

/* ---------- Attach Listeners ---------- */

function attachFilterListeners(){

  const generationCheckboxes = document.querySelectorAll("#generationContainer input[data-generation]");
  const categoryCheckboxes = document.querySelectorAll("#categoryContainer input[data-cat]");

  generationCheckboxes.forEach(cb=>{
    cb.onchange = e=>{
      const generationId = Number(e.target.dataset.generation);
      if(!generationId) return;

      if(e.target.checked){
        selectedGenerations.add(generationId);
      } else {
        selectedGenerations.delete(generationId);
      }

      saveFilters();
      applyFilter();
    };
  });

  categoryCheckboxes.forEach(cb=>{
    cb.onchange = e=>{
      const cat = e.target.dataset.cat;
      if(!cat) return;

      if(e.target.checked){
        activeCategories.add(cat);
      } else {
        activeCategories.delete(cat);
      }

      saveFilters();
      applyFilter();
    };
  });

  /* Select All Button */
  const selectAllBtn = document.getElementById("selectAllBtn");
  if(selectAllBtn){
    selectAllBtn.onclick = ()=>{
      selectedGenerations.clear();
      supportedGenerations.forEach(gen=>selectedGenerations.add(gen.id));

      activeCategories.clear();
      categories.forEach(c=>activeCategories.add(c));

      document.querySelectorAll("#generationContainer input[data-generation]")
        .forEach(cb=>cb.checked = true);

      document.querySelectorAll("#categoryContainer input[data-cat]")
        .forEach(cb=>cb.checked = true);

      applyFilter();
      saveFilters();
    };
  }

  /* Unselect All Button */
  const unselectAllBtn = document.getElementById("unselectAllBtn");
  if(unselectAllBtn){
    unselectAllBtn.onclick = ()=>{
      selectedGenerations.clear();
      activeCategories.clear();

      document.querySelectorAll("#generationContainer input[data-generation]")
        .forEach(cb=>cb.checked = false);

      document.querySelectorAll("#categoryContainer input[data-cat]")
        .forEach(cb=>cb.checked = false);

      applyFilter();
      saveFilters();
    };
  }
  
}

/* ---------- Filter Matching ---------- */

function matchesFilter(p){

  if(!selectedGenerations.has(p.generation)) return false;

  if(activeCategories.size === 0) return true;
  if(activeCategories.size === categories.length) return true;

  if(activeCategories.has("Starters") && p.isStarter) return true;
  if(activeCategories.has("Legendary and Mythical") && p.isLegendary) return true;
  if(activeCategories.has("Stage 1") && p.stage === 1) return true;
  if(activeCategories.has("Stage 2") && p.stage === 2) return true;
  if(activeCategories.has("Stage 3") && p.stage >= 3) return true;

  for(const type of p.types){
    const formatted = type.charAt(0).toUpperCase()+type.slice(1);
    if(activeCategories.has(formatted)) return true;
  }

  return false;
}

/* ---------- Apply Filter ---------- */

function applyFilter(){

  let visible = 0;

  pokemonData.forEach(p=>{
    const row = document.getElementById(`row-${p.id}`);
    const matches = matchesFilter(p);

    if(showingMissedOnly){
      if(matches && !guessedGlobal.has(p.id)){
        row.classList.remove("hidden-row");
        visible++;
      } else {
        row.classList.add("hidden-row");
      }
      return;
    }

    if(matches){
      row.classList.remove("hidden-row");
      visible++;
    } else {
      row.classList.add("hidden-row");
    }
  });

  /* Empty message */
  const emptyMessage = document.getElementById("emptyMessage");
  if(emptyMessage){
    emptyMessage.classList.toggle("hidden", visible !== 0);
  }

  /* Disable Done button if no generation is selected */
  const doneBtn = document.getElementById("doneBtn");
  if(doneBtn){
    doneBtn.disabled = selectedGenerations.size === 0;
  }

  updateCounter();

  if(gameFinished){
    checkCompletion();
  }
}

/* ---------- Counter ---------- */

function updateCounter(){
  const visible = pokemonData.filter(matchesFilter);
  const guessed = visible.filter(p=>guessedGlobal.has(p.id));
  const percent = visible.length === 0
    ? 0
    : Math.round((guessed.length / visible.length) * 100);

  document.getElementById("counter").textContent =
    `${guessed.length} / ${visible.length} (${percent}%)`;
}
