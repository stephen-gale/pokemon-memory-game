/* ================= AUDIO ================= */

const MUSIC_FILE = "music-palettetown.mp3";
const CELEBRATION_FILE = "celebration.mp3";

let bgMusic = null;
let currentCry = null;
let currentCelebration = null;
let musicStarted = false;

function startMusic(){
 if(audioMuted || musicStarted) return;
 if(!bgMusic){
   bgMusic = new Audio(MUSIC_FILE);
   bgMusic.loop = true;
   bgMusic.volume = 0.4;
 }
 bgMusic.play().catch(()=>{});
 musicStarted = true;
}

function stopMusic(){
 if(bgMusic){
   bgMusic.pause();
   bgMusic.currentTime = 0;
 }
 musicStarted = false;
}

function fadeOutMusic(){
 if(!bgMusic || audioMuted) return;
 let vol = bgMusic.volume;
 const fade = setInterval(()=>{
   vol -= 0.05;
   if(vol <= 0){
     clearInterval(fade);
     stopMusic();
   } else {
     bgMusic.volume = vol;
   }
 },100);
}

function playCry(url){
 if(audioMuted || gameFinished || !url) return;
 if(currentCry){
   currentCry.pause();
   currentCry.currentTime = 0;
 }
 currentCry = new Audio(url);
 currentCry.play().catch(()=>{});
}

function playCelebration(){
 if(audioMuted) return;
 stopCelebration();
 currentCelebration = new Audio(CELEBRATION_FILE);
 currentCelebration.play().catch(()=>{});
}

function stopCelebration(){
 if(currentCelebration){
   currentCelebration.pause();
   currentCelebration.currentTime = 0;
   currentCelebration = null;
 }
}

function setAudioMuted(muted){
  audioMuted = Boolean(muted);
  localStorage.setItem(AUDIO_MUTED_SAVE_KEY, audioMuted);

  if(audioMuted){
    stopMusic();
    if(currentCry){
      currentCry.pause();
      currentCry.currentTime = 0;
      currentCry = null;
    }
    stopCelebration();
    return;
  }

  if(!gameFinished){
    startMusic();
  }
}
