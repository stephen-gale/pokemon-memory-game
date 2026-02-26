/* ================= FILTERS ================= */

function buildCategoryUI(){

  const container = document.getElementById("categoryContainer");
  container.innerHTML = "";

  categories.forEach(cat=>{
    const div = document.createElement("div");
    div.className = "toggle";
    div.innerHTML = `
      <input type="checkbox" data-cat="${cat}" checked>
      <span>${cat}</span>
    `;
    container.appendChild(div);
  });

  attachFilterListeners();
}

/* ---------- Attach Listeners ---------- */

function attachFilterListeners(){

  const container = document.getElementById("categoryContainer");

  /* Individual category toggles */
  container.addEventListener("change", e=>{
    const cat = e.target.dataset.cat;
    if(!cat) return;

    if(e.target.checked){
      activeCategories.add(cat);
    } else {
      activeCategories.delete(cat);
    }

    syncSelectAllState();
    applyFilter();
  });

  /* Select All */
  const selectAll = document.getElementById("selectAll");
  selectAll.addEventListener("change", e=>{
    if(e.target.checked){

      activeCategories.clear();
      categories.forEach(c=>activeCategories.add(c));

      document.querySelectorAll("#categoryContainer input")
        .forEach(cb=>cb.checked = true);

      document.getElementById("unselectAll").checked = false;
    }

    applyFilter();
  });

  /* Unselect All */
  const unselectAll = document.getElementById("unselectAll");
  unselectAll.addEventListener("change", e=>{
    if(e.target.checked){

      activeCategories.clear();

      document.querySelectorAll("#categoryContainer input")
        .forEach(cb=>cb.checked = false);

      document.getElementById("selectAll").checked = false;

      // Uncheck itself (as requested)
      e.target.checked = false;
    }

    applyFilter();
  });
}

/* ---------- Sync Select All State ---------- */

function syncSelectAllState(){
  const allSelected = categories.every(c=>activeCategories.has(c));
  document.getElementById("selectAll").checked = allSelected;
}

/* ---------- Filter Matching ---------- */

function matchesFilter(p){

  if(activeCategories.size === categories.length) return true;

  if(activeCategories.has("Starters") && p.isStarter) return true;
  if(activeCategories.has("Legendary and Mythical") && p.isLegendary) return true;

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

  /* Disable Done button if none selected */
  const doneBtn = document.getElementById("doneBtn");
  if(doneBtn){
    doneBtn.disabled = visible === 0;
  }

  updateCounter();
}

/* ---------- Counter ---------- */

function updateCounter(){
  const visible = pokemonData.filter(matchesFilter);
  const guessed = visible.filter(p=>guessedGlobal.has(p.id));

  document.getElementById("counter").textContent =
    `${guessed.length} / ${visible.length}`;
}