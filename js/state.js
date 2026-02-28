/* ================= STATE ================= */

const SAVE_KEY = "gen1-memory-progress";
const FILTER_SAVE_KEY = "gen1-memory-filters";
const MISSPELLING_SAVE_KEY = "misspellingEnabled";
const DARK_MODE_SAVE_KEY = "darkModeEnabled";
const AUDIO_MUTED_SAVE_KEY = "audioMuted";

const supportedGenerations = [
  { id: 1, label: "Gen 1", startId: 1, endId: 151 },
  { id: 2, label: "Gen 2", startId: 152, endId: 251 },
  { id: 3, label: "Gen 3", startId: 252, endId: 386 },
  { id: 4, label: "Gen 4", startId: 387, endId: 493 },
  { id: 5, label: "Gen 5", startId: 494, endId: 649 },
  { id: 6, label: "Gen 6", startId: 650, endId: 721 },
  { id: 7, label: "Gen 7", startId: 722, endId: 809 },
  { id: 8, label: "Gen 8", startId: 810, endId: 905 },
  { id: 9, label: "Gen 9", startId: 906, endId: 1025 }
];

const legendaryList = [
  "articuno","zapdos","moltres","mewtwo","mew",
  "raikou","entei","suicune","lugia","ho-oh","celebi",
  "regirock","regice","registeel","latias","latios","kyogre","groudon","rayquaza","jirachi","deoxys",
  "uxie","mesprit","azelf","dialga","palkia","heatran","regigigas","giratina","cresselia","phione",
  "manaphy","darkrai","shaymin","arceus",
  "victini","cobalion","terrakion","virizion","tornadus","thundurus","reshiram","zekrom","landorus",
  "kyurem","keldeo","meloetta","genesect",
  "xerneas","yveltal","zygarde","diancie","hoopa","volcanion",
  "type-null","silvally","tapu-koko","tapu-lele","tapu-bulu","tapu-fini","cosmog","cosmoem","solgaleo",
  "lunala","nihilego","buzzwole","pheromosa","xurkitree","celesteela","kartana","guzzlord","necrozma",
  "magearna","marshadow","poipole","naganadel","stakataka","blacephalon","zeraora","meltan","melmetal",
  "zacian","zamazenta","eternatus","kubfu","urshifu","zarude","regieleki","regidrago","glastrier",
  "spectrier","calyrex","enamorus",
  "wo-chien","chien-pao","ting-lu","chi-yu","koraidon","miraidon","okidogi","munkidori","fezandipiti",
  "ogerpon","terapagos","pecharunt"
];
const starterList = [
  "bulbasaur","ivysaur","venusaur",
  "charmander","charmeleon","charizard",
  "squirtle","wartortle","blastoise",
  "chikorita","bayleef","meganium",
  "cyndaquil","quilava","typhlosion",
  "totodile","croconaw","feraligatr",
  "treecko","grovyle","sceptile",
  "torchic","combusken","blaziken",
  "mudkip","marshtomp","swampert",
  "turtwig","grotle","torterra",
  "chimchar","monferno","infernape",
  "piplup","prinplup","empoleon",
  "snivy","servine","serperior",
  "tepig","pignite","emboar",
  "oshawott","dewott","samurott",
  "chespin","quilladin","chesnaught",
  "fennekin","braixen","delphox",
  "froakie","frogadier","greninja",
  "rowlet","dartrix","decidueye",
  "litten","torracat","incineroar",
  "popplio","brionne","primarina",
  "grookey","thwackey","rillaboom",
  "scorbunny","raboot","cinderace",
  "sobble","drizzile","inteleon",
  "sprigatito","floragato","meowscarada",
  "fuecoco","crocalor","skeledirge",
  "quaxly","quaxwell","quaquaval"
];

const categories = [
 "Starters","Legendary and Mythical","Stage 1","Stage 2","Stage 3",
 "Normal","Fire","Water","Electric","Grass","Ice",
 "Fighting","Poison","Ground","Flying","Psychic",
 "Bug","Rock","Ghost","Dragon","Dark","Steel","Fairy"
];

let pokemonData = [];
let guessedGlobal = new Set();
let activeCategories = new Set(categories);
let selectedGenerations = new Set(supportedGenerations.map(gen=>gen.id));

let gameFinished = false;
let showingMissedOnly = false;

let misspellingEnabled = true;
let darkModeEnabled = false;
let audioMuted = false;

function saveProgress(){
 localStorage.setItem(SAVE_KEY, JSON.stringify([...guessedGlobal]));
}

function loadProgress(){
 guessedGlobal = new Set(JSON.parse(localStorage.getItem(SAVE_KEY) || "[]"));
}

function loadMisspellingSetting(){
  const saved = localStorage.getItem(MISSPELLING_SAVE_KEY);
  if(saved === null) return;
  misspellingEnabled = saved === "true";
}

function applyDarkMode(){
  document.body.classList.toggle("dark-mode", darkModeEnabled);
}

function loadDarkModeSetting(){
  const saved = localStorage.getItem(DARK_MODE_SAVE_KEY);
  if(saved !== null){
    darkModeEnabled = saved === "true";
  }
  applyDarkMode();
}

function loadAudioMutedSetting(){
  const saved = localStorage.getItem(AUDIO_MUTED_SAVE_KEY);
  if(saved !== null){
    audioMuted = saved === "true";
  }
}
