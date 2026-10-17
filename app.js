const DB = [
["White rice",130,2.7,28.2,.3,.4],["Brown rice",123,2.7,25.6,1,1.6],["Basmati rice",130,2.7,28,.3,.4],
["Chapati / Roti",297,11,55,7,11],["Wheat flour",340,13.2,72.5,2.5,10.7],["Dal",116,9,20,0.4,7.9],
["Toor dal",343,22,63,1.5,15],["Moong dal",347,24,63,1.2,16],["Chickpeas",164,8.9,27.4,2.6,7.6],
["Rajma",127,8.7,22.8,.5,6.4],["Paneer",265,18.3,1.2,20.8,0],["Chicken breast",165,31,0,3.6,0],
["Chicken thigh",209,26,0,10.9,0],["Egg",143,12.6,.7,9.5,0],["Curd / Yogurt",61,3.5,4.7,3.3,0],
["Milk",61,3.2,4.8,3.3,0],["Banana",89,1.1,22.8,.3,2.6],["Apple",52,.3,13.8,.2,2.4],
["Orange",47,.9,11.8,.1,2.4],["Potato",77,2,17.5,.1,2.2],["Sweet potato",86,1.6,20.1,.1,3],
["Oats",389,16.9,66.3,6.9,10.6],["Peanuts",567,25.8,16.1,49.2,8.5],["Almonds",579,21.2,21.6,49.9,12.5],
["Dosa",168,3.9,28,4,1.3],["Idli",146,5,28,.7,2],["Sambar",72,3.5,11.5,1.5,3],
["Poha",158,2.6,25.9,4.5,2.5],["Upma",209,4.2,28.5,8,2.3],["Puffed rice",387,7,85,.5,0.5],
["Ragi flour",336,7.3,72,1.3,11.2],["Tofu",76,8,1.9,4.8,.3]
].map(x=>({name:x[0],cal:x[1],pro:x[2],carb:x[3],fat:x[4],fib:x[5]}));

const $=id=>document.getElementById(id);
const today=()=>new Date().toISOString().slice(0,10);
let entries=JSON.parse(localStorage.getItem("nt_entries")||"[]");
let targets=JSON.parse(localStorage.getItem("nt_targets")||'{"cal":2000,"pro":120,"carb":250,"fat":65,"fib":30}');
let history=JSON.parse(localStorage.getItem("nt_history")||"{}");
let deferredInstall=null;

function save(){localStorage.setItem("nt_entries",JSON.stringify(entries));}
function round(n){return Math.round(n*10)/10}
function calc(food,g){let m=g/100;return {cal:food.cal*m,pro:food.pro*m,carb:food.carb*m,fat:food.fat*m,fib:food.fib*m}}
function totals(){return entries.filter(e=>e.date===today()).reduce((a,e)=>{for(const k of ["cal","pro","carb","fat","fib"])a[k]+=e[k];return a},{cal:0,pro:0,carb:0,fat:0,fib:0})}
function pct(v,t){return Math.min(100,Math.round(v/t*100))}
function render(){
  $("dateLabel").textContent=new Date().toLocaleDateString(undefined,{weekday:"long",year:"numeric",month:"long",day:"numeric"});
  const t=totals();
  [["calories","cal"],["protein","pro"],["carbs","carb"],["fat","fat"],["fiber","fib"]].forEach(([id,k])=>$(id).textContent=round(t[k]));
  [["cal","calBar","calPct"],["pro","proBar","proPct"],["carb","carbBar","carbPct"],["fat","fatBar","fatPct"],["fib","fibBar","fibPct"]].forEach(([k,b,p])=>{let q=pct(t[k],targets[k]);$(b).style.width=q+"%";$(p).textContent=q+"%"});
  const day=entries.filter(e=>e.date===today());$("entryCount").textContent=day.length+" item"+(day.length===1?"":"s");
  const meals=["Breakfast","Lunch","Dinner","Snacks"];
  $("meals").innerHTML=meals.map(meal=>{
    const es=day.filter(e=>e.meal===meal);
    return `<div class="meal-block"><div class="meal-title">${meal} <span class="pill">${round(es.reduce((s,e)=>s+e.cal,0))} kcal</span></div>${es.length?es.map(e=>`<div class="food-row"><div><b>${esc(e.name)}</b><br><small>${e.grams}g • ${round(e.cal)} kcal</small></div><div class="food-macros">P ${round(e.pro)}g • C ${round(e.carb)}g<br>F ${round(e.fat)}g • Fi ${round(e.fib)}g</div><button class="remove" onclick="removeEntry('${e.id}')">✕</button></div>`).join(""):`<div class="empty">No foods added</div>`}</div>`
  }).join("");
  drawChart();
}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function addFood(food){
  const g=Number($("grams").value);
  if(!food.name||!g||g<=0)return alert("Enter a food and grams.");
  const c=calc(food,g);
  entries.push({id:Date.now()+"-"+Math.random(),date:today(),meal:$("meal").value,name:food.name,grams:g,...c});
  save(); updateHistory(); $("foodName").value="";$("grams").value="";render();
}
$("addCustomBtn").onclick=()=>{const name=$("foodName").value.trim();let f=DB.find(x=>x.name.toLowerCase()===name.toLowerCase());if(!f){$("customPanel").classList.remove("hidden");$("cName").value=name;return}addFood(f)}
$("customBtn").onclick=()=>$("customPanel").classList.remove("hidden");
$("closeCustom").onclick=()=>$("customPanel").classList.add("hidden");
$("saveCustom").onclick=()=>{const f={name:$("cName").value.trim(),cal:+$("cCal").value,pro:+$("cPro").value,carb:+$("cCarb").value,fat:+$("cFat").value,fib:+$("cFib").value};if(!f.name)return alert("Enter a name.");addFood(f);$("customPanel").classList.add("hidden")};
$("searchBtn").onclick=()=>{$("searchPanel").classList.toggle("hidden");$("searchInput").focus()};
$("doSearch").onclick=searchOnline;
$("searchInput").addEventListener("keydown",e=>{if(e.key==="Enter")searchOnline()});
async function searchOnline(){
  const q=$("searchInput").value.trim();if(!q)return;
  $("searchResults").innerHTML="<p class='muted'>Searching…</p>";
  try{
    const url="https://world.openfoodfacts.org/cgi/search.pl?search_terms="+encodeURIComponent(q)+"&search_simple=1&action=process&json=1&page_size=8&fields=product_name,brands,nutriments";
    const data=await fetch(url).then(r=>r.json());
    const results=(data.products||[]).filter(p=>p.product_name);
    $("searchResults").innerHTML=results.length?results.map((p,i)=>{const n=p.nutriments||{};const f={name:(p.product_name+(p.brands?" • "+p.brands:"")).slice(0,90),cal:+(n["energy-kcal_100g"]||0),pro:+(n.proteins_100g||0),carb:+(n.carbohydrates_100g||0),fat:+(n.fat_100g||0),fib:+(n.fiber_100g||0)};window._results=window._results||[];window._results[i]=f;return `<div class="result"><div><b>${esc(f.name)}</b><small>${f.cal} kcal • P ${f.pro}g • C ${f.carb}g • F ${f.fat}g • Fi ${f.fib}g /100g</small></div><button class="primary" onclick="useOnline(${i})">Use</button></div>`}).join(""):"<p class='muted'>No results found.</p>";
  }catch(e){$("searchResults").innerHTML="<p class='muted'>Could not reach Open Food Facts. Check your internet connection.</p>"}
}
function useOnline(i){addFood(window._results[i])}
function removeEntry(id){entries=entries.filter(e=>e.id!==id);save();updateHistory();render()}
$("clearDayBtn").onclick=()=>{if(confirm("Clear all foods for today?")){entries=entries.filter(e=>e.date!==today());save();updateHistory();render()}}
$("targetBtn").onclick=()=>{$("targetModal").classList.remove("hidden");["cal","pro","carb","fat","fib"].forEach(k=>$("t"+k[0].toUpperCase()+k.slice(1)).value=targets[k])}
$("closeTarget").onclick=()=>$("targetModal").classList.add("hidden");
$("saveTargets").onclick=()=>{targets={cal:+$("tCal").value,pro:+$("tPro").value,carb:+$("tCarb").value,fat:+$("tFat").value,fib:+$("tFib").value};localStorage.setItem("nt_targets",JSON.stringify(targets));$("targetModal").classList.add("hidden");render()}
$("darkBtn").onclick=()=>{document.body.classList.toggle("dark");localStorage.setItem("nt_dark",document.body.classList.contains("dark")?"1":"0")}
$("exportBtn").onclick=()=>{const rows=[["Date","Meal","Food","Grams","Calories","Protein","Carbs","Fat","Fiber"],...entries.map(e=>[e.date,e.meal,e.name,e.grams,round(e.cal),round(e.pro),round(e.carb),round(e.fat),round(e.fib)])];const csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="nutritrack.csv";a.click()}
function updateHistory(){const d=today();history[d]=totals().cal;localStorage.setItem("nt_history",JSON.stringify(history))}
$("resetHistoryBtn").onclick=()=>{if(confirm("Reset the 7-day history?")){history={};localStorage.setItem("nt_history","{}");render()}}
function drawChart(){
 const c=$("historyChart"),ctx=c.getContext("2d"),w=c.clientWidth||700,h=220,dpr=devicePixelRatio||1;c.width=w*dpr;c.height=h*dpr;ctx.scale(dpr,dpr);ctx.clearRect(0,0,w,h);
 const days=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);days.push(d.toISOString().slice(0,10))}
 const max=Math.max(targets.cal,...days.map(d=>history[d]||0),1), pad=30,bottom=30,chartH=h-pad-bottom,chartW=w-pad*2;
 ctx.strokeStyle=getComputedStyle(document.body).getPropertyValue("--grid")||"#dbe4dc";ctx.lineWidth=1;
 for(let j=0;j<5;j++){const y=pad+chartH*j/4;ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(w-pad,y);ctx.stroke()}
 ctx.strokeStyle="#16a34a";ctx.lineWidth=3;ctx.beginPath();
 days.forEach((d,i)=>{const x=pad+i*(chartW/6),y=pad+chartH-(history[d]||0)/max*chartH;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();
 ctx.fillStyle=getComputedStyle(document.body).color;ctx.font="11px system-ui";days.forEach((d,i)=>{const x=pad+i*(chartW/6);ctx.fillText(d.slice(5),x-13,h-9);});
}
window.addEventListener("resize",drawChart);
if(localStorage.getItem("nt_dark")==="1")document.body.classList.add("dark");
window.removeEntry=removeEntry;window.useOnline=useOnline;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstall=e;$("installBtn").classList.remove("hidden")});
$("installBtn").onclick=async()=>{if(!deferredInstall)return;deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;$("installBtn").classList.add("hidden")};
window.addEventListener("appinstalled",()=>{$("installBtn").classList.add("hidden")});
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js").catch(()=>{}));
render();
