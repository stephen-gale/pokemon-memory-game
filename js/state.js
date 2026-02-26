/* ================= STATE ================= */

const SAVE_KEY = "gen1-memory-progress";

const legendaryList = ["articuno","zapdos","moltres","mewtwo","mew"];
const starterList = ["bulbasaur","charmander","squirtle"];

const categories = [
 "Starters","Legendary and Mythical",
 "Normal","Fire","Water","Electric","Grass","Ice",
 "Fighting","Poison","Ground","Flying","Psychic",
 "Bug","Rock","Ghost","Dragon"
];

let pokemonData = [];
let guessedGlobal = new Set();
let activeCategories = new Set(categories);

let gameFinished = false;
let showingMissedOnly = false;

let criesEnabled = true;
let musicEnabled = false;

function saveProgress(){
 localStorage.setItem(SAVE_KEY, JSON.stringify([...guessedGlobal]));
}

function loadProgress(){
 guessedGlobal = new Set(JSON.parse(localStorage.getItem(SAVE_KEY) || "[]"));
}