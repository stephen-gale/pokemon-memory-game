/* ================= MAIN ================= */

function normalizePokemonText(value){
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/['’.\- ]/g,"")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"");
}

function getGenerationSprite(data, generation){
  const generationSpritePaths = {
    1: [
      "versions.generation-i.red-blue.front_default",
      "versions.generation-i.yellow.front_default"
    ],
    2: [
      "versions.generation-ii.crystal.front_default",
      "versions.generation-ii.gold.front_default",
      "versions.generation-ii.silver.front_default"
    ],
    3: [
      "versions.generation-iii.emerald.front_default",
      "versions.generation-iii.firered-leafgreen.front_default",
      "versions.generation-iii.ruby-sapphire.front_default"
    ],
    4: [
      "versions.generation-iv.platinum.front_default",
      "versions.generation-iv.heartgold-soulsilver.front_default",
      "versions.generation-iv.diamond-pearl.front_default"
    ],
    5: [
      "versions.generation-v.black-white.front_default"
    ],
    6: [
      "versions.generation-vi.omegaruby-alphasapphire.front_default",
      "versions.generation-vi.x-y.front_default"
    ],
    7: [
      "versions.generation-vii.ultra-sun-ultra-moon.front_default",
      "versions.generation-vii.icons.front_default"
    ],
    8: [
      "versions.generation-viii.icons.front_default"
    ],
    9: [
      "versions.generation-ix.scarlet-violet.front_default"
    ]
  };

  const paths = generationSpritePaths[generation] || [];

  const resolvePath = (obj, path)=>
    path.split(".").reduce((acc, key)=>acc?.[key], obj);

  for(const path of paths){
    const sprite = resolvePath(data.sprites, path);
    if(sprite) return sprite;
  }

  return data.sprites?.front_default || null;
}

function getSpeciesIdFromUrl(url){
  const match = url.match(/\/pokemon-species\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
}

function getEvolutionChainIdFromUrl(url){
  const match = url.match(/\/evolution-chain\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
}

async function runConcurrent(items, worker, concurrency = 30){
  const results = new Array(items.length);
  let cursor = 0;

  async function runner(){
    while(cursor < items.length){
      const idx = cursor++;
      results[idx] = await worker(items[idx], idx);
    }
  }

  const runners = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => runner()
  );

  await Promise.all(runners);
  return results;
}

async function buildEvolutionStageMap(indexEntries){
  const speciesIds = [...new Set(indexEntries.map(entry=>entry.id))];
  const speciesMeta = await runConcurrent(
    speciesIds,
    async speciesId=>{
      try{
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${speciesId}`);
        const data = await res.json();
        return {
          speciesId,
          chainId: getEvolutionChainIdFromUrl(data.evolution_chain?.url || "")
        };
      }catch{
        return { speciesId, chainId: null };
      }
    },
    30
  );

  const chainIds = [...new Set(
    speciesMeta
      .map(meta=>meta.chainId)
      .filter(Boolean)
  )];

  const stageBySpeciesId = new Map();

  function walkChain(node, depth){
    const speciesId = getSpeciesIdFromUrl(node.species?.url || "");
    if(speciesId){
      // Clamp to 3 so Stage 3 includes late evolutions in longer chains.
      stageBySpeciesId.set(speciesId, Math.min(depth, 3));
    }

    (node.evolves_to || []).forEach(nextNode=>{
      walkChain(nextNode, depth + 1);
    });
  }

  await runConcurrent(
    chainIds,
    async chainId=>{
      try{
        const res = await fetch(`https://pokeapi.co/api/v2/evolution-chain/${chainId}`);
        const data = await res.json();
        walkChain(data.chain, 1);
      }catch{
        // Keep default stage fallback for failed chains.
      }
    },
    20
  );

  speciesIds.forEach(speciesId=>{
    if(!stageBySpeciesId.has(speciesId)){
      stageBySpeciesId.set(speciesId, 1);
    }
  });

  return stageBySpeciesId;
}

async function buildPokemonIndex(){
  const generationEntries = await Promise.all(
    supportedGenerations.map(async gen=>{
      try{
        const res = await fetch(`https://pokeapi.co/api/v2/generation/${gen.id}`);
        const data = await res.json();

        return data.pokemon_species
          .map(species=>{
            const speciesId = getSpeciesIdFromUrl(species.url);
            if(!speciesId) return null;
            return { id: speciesId, generation: gen.id };
          })
          .filter(Boolean);
      }catch{
        return [];
      }
    })
  );

  return generationEntries
    .flat()
    .sort((a,b)=>a.id-b.id);
}

async function loadPokemonData(indexEntries, evolutionStageMap){
  const results = await runConcurrent(
    indexEntries,
    async entry=>{
      try{
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${entry.id}`);
        const data = await res.json();
        const name = data.name;

        return {
          id: entry.id,
          name,
          normalizedName: normalizePokemonText(name),
          display:name.charAt(0).toUpperCase()+name.slice(1),
          generation: entry.generation,
          stage: evolutionStageMap.get(entry.id) || 1,
          types:data.types.map(t=>t.type.name),
          isLegendary:legendaryList.includes(name),
          isStarter:starterList.includes(name),
          sprite:getGenerationSprite(data, entry.generation),
          cry:data.cries?.latest
        };
      }catch{
        return {
          id: entry.id,name:"",normalizedName:"",display:"",generation:entry.generation,stage:1,types:[],
          isLegendary:false,isStarter:false,sprite:null,cry:null
        };
      }
    },
    30
  );

  return results;
}

async function init(){

 loadProgress();
 loadAudioMutedSetting();
 loadMisspellingSetting();
 loadDarkModeSetting();

 const pokemonIndex = await buildPokemonIndex();
 const evolutionStageMap = await buildEvolutionStageMap(pokemonIndex);
 const list = document.getElementById("list");

 pokemonIndex.forEach(entry=>{
   const row=document.createElement("div");
   row.className="row";
   row.id=`row-${entry.id}`;
   row.innerHTML=`
     <div class="index">${entry.id}</div>
     <img class="sprite" id="sprite-${entry.id}">
     <div class="name hidden-name" id="name-${entry.id}">.</div>
   `;
   list.appendChild(row);
 });

 pokemonData = await loadPokemonData(pokemonIndex, evolutionStageMap);

 guessedGlobal.forEach(id=>reveal(id));

 buildCategoryUI();
 applyFilter();
 timer.init();
 initUI();

 document.getElementById("loading").classList.add("hidden");
}

document.addEventListener("click", startMusic);

init();
