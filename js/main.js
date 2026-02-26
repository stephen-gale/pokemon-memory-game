/* ================= MAIN ================= */

async function init(){

 loadProgress();

 for(let i=1;i<=151;i++){

   const row=document.createElement("div");
   row.className="row";
   row.id=`row-${i}`;
   row.innerHTML=`
     <div class="index">${i}</div>
     <img class="sprite" id="sprite-${i}">
     <div class="name hidden-name" id="name-${i}">.</div>
   `;
   document.getElementById("list").appendChild(row);

   try{
     const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`);
     const data = await res.json();
     const name = data.name;

     pokemonData.push({
       id:i,
       name,
       display:name.charAt(0).toUpperCase()+name.slice(1),
       types:data.types.map(t=>t.type.name),
       isLegendary:legendaryList.includes(name),
       isStarter:starterList.includes(name),
       sprite:data.sprites?.versions?.["generation-i"]?.["red-blue"]?.front_default,
       cry:data.cries?.latest
     });

   }catch{
     pokemonData.push({
       id:i,name:"",display:"",types:[],
       isLegendary:false,isStarter:false,
       sprite:null,cry:null
     });
   }
 }

 guessedGlobal.forEach(id=>reveal(id));

 buildCategoryUI();
 applyFilter();
 initUI();

 document.getElementById("loading").classList.add("hidden");
}

document.addEventListener("click", startMusic);

init();
