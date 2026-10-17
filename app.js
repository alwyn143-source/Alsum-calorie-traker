const BUILTIN_FOODS = [
  {name:"White rice, cooked", kcal:130, protein:2.7, carbs:28.2, fat:0.3, fiber:0.4, source:"Built-in"},
  {name:"Brown rice, cooked", kcal:123, protein:2.7, carbs:25.6, fat:1.0, fiber:1.6, source:"Built-in"},
  {name:"Chapati / roti", kcal:297, protein:11.3, carbs:55.0, fat:4.0, fiber:11.0, source:"Built-in"},
  {name:"Dal, cooked", kcal:116, protein:9.0, carbs:20.1, fat:0.4, fiber:7.9, source:"Built-in"},
  {name:"Toor dal, cooked", kcal:128, protein:7.0, carbs:22.0, fat:1.5, fiber:5.0, source:"Built-in"},
  {name:"Chickpeas, cooked", kcal:164, protein:8.9, carbs:27.4, fat:2.6, fiber:7.6, source:"Built-in"},
  {name:"Paneer", kcal:265, protein:18.3, carbs:6.1, fat:20.8, fiber:0, source:"Built-in"},
  {name:"Chicken breast, cooked", kcal:165, protein:31.0, carbs:0, fat:3.6, fiber:0, source:"Built-in"},
  {name:"Egg, whole", kcal:143, protein:12.6, carbs:0.7, fat:9.5, fiber:0, source:"Built-in"},
  {name:"Curd / plain yogurt", kcal:61, protein:3.5, carbs:4.7, fat:3.3, fiber:0, source:"Built-in"},
  {name:"Milk, whole", kcal:61, protein:3.2, carbs:4.8, fat:3.3, fiber:0, source:"Built-in"},
  {name:"Banana", kcal:89, protein:1.1, carbs:22.8, fat:0.3, fiber:2.6, source:"Built-in"},
  {name:"Apple", kcal:52, protein:0.3, carbs:13.8, fat:0.2, fiber:2.4, source:"Built-in"},
  {name:"Potato, boiled", kcal:87, protein:1.9, carbs:20.1, fat:0.1, fiber:1.8, source:"Built-in"},
  {name:"Oats, dry", kcal:389, protein:16.9, carbs:66.3, fat:6.9, fiber:10.6, source:"Built-in"},
  {name:"Peanuts", kcal:567, protein:25.8, carbs:16.1, fat:49.2, fiber:8.5, source:"Built-in"},
  {name:"Almonds", kcal:579, protein:21.2, carbs:21.6, fat:49.9, fiber:12.5, source:"Built-in"},
  {name:"Dosa", kcal:168, protein:3.9, carbs:29.0, fat:3.7, fiber:1.0, source:"Built-in"},
  {name:"Idli", kcal:58, protein:2.0, carbs:12.0, fat:0.4, fiber:0.9, source:"Built-in"},
  {name:"Sambar", kcal:75, protein:3.5, carbs:11.0, fat:1.8, fiber:3.0, source:"Built-in"},
  {name:"Poha", kcal:180, protein:3.0, carbs:32.0, fat:4.5, fiber:2.0, source:"Built-in"},
  {name:"Upma", kcal:150, protein:4.0, carbs:25.0, fat:4.0, fiber:2.0, source:"Built-in"},
  {name:"Puffed rice / murmura", kcal:402, protein:6.3, carbs:90.0, fat:0.5, fiber:1.0, source:"Built-in"}
];

const DEFAULT_TARGETS = {calories:2000, protein:100, carbs:250, fat:65, fiber:30};
let foods = JSON.parse(localStorage.getItem("nutritrackFoods") || "[]");
let targets = {...DEFAULT_TARGETS, ...(JSON.parse(localStorage.getItem("nutritrackTargets") || "{}"))};
let selectedFood = null;

const $ = id => document.getElementById(id);
const round = n => Math.round((Number(n)||0)*10)/10;
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function nutritionFor(food, grams){
  const factor = Number(grams)/100;
  return {
    kcal: round(food.kcal*factor),
    protein: round(food.protein*factor),
    carbs: round(food.carbs*factor),
    fat: round(food.fat*factor),
    fiber: round(food.fiber*factor)
  };
}

function totals(){
  return foods.reduce((t,f)=>{
    t.kcal += f.n.kcal; t.protein += f.n.protein; t.carbs += f.n.carbs;
    t.fat += f.n.fat; t.fiber += f.n.fiber; return t;
  }, {kcal:0,protein:0,carbs:0,fat:0,fiber:0});
}

function save(){localStorage.setItem("nutritrackFoods", JSON.stringify(foods));}
function render(){
  const t=totals();
  $("totalCalories").textContent=round(t.kcal);
  $("totalProtein").textContent=round(t.protein);
  $("totalCarbs").textContent=round(t.carbs);
  $("totalFat").textContent=round(t.fat);
  $("totalFiber").textContent=round(t.fiber);
  $("foodCount").textContent=`${foods.length} ${foods.length===1?"item":"items"}`;
  $("mealList").innerHTML=foods.map((f,i)=>`
    <div class="meal-item">
      <div><div class="meal-name">${esc(f.name)}</div><div class="meal-meta">${f.grams} g · ${esc(f.source||"")}</div></div>
      <div class="num">${f.n.kcal} kcal</div>
      <div class="num">${f.n.protein}g P</div>
      <div class="num">${f.n.carbs}g C</div>
      <div class="num">${f.n.fat}g F</div>
      <button class="remove" onclick="removeFood(${i})">Remove</button>
    </div>`).join("");
  $("emptyState").classList.toggle("hidden", foods.length>0);
  renderTargets(t);
}
function removeFood(i){foods.splice(i,1);save();render();}

function renderTargets(t){
  const defs=[
    ["Calories",t.kcal,targets.calories,"kcal"],
    ["Protein",t.protein,targets.protein,"g"],
    ["Carbs",t.carbs,targets.carbs,"g"],
    ["Fat",t.fat,targets.fat,"g"],
    ["Fiber",t.fiber,targets.fiber,"g"]
  ];
  $("targetBars").innerHTML=defs.map(([name,val,target,unit])=>{
    const pct=target?Math.min(100,(val/target)*100):0;
    return `<div><div class="bar-label"><span>${name}</span><span>${round(val)}/${target}${unit}</span></div><div class="bar"><i style="width:${pct}%"></i></div></div>`;
  }).join("");
}
function loadTargets(){
  $("targetCalories").value=targets.calories;$("targetProtein").value=targets.protein;
  $("targetCarbs").value=targets.carbs;$("targetFat").value=targets.fat;$("targetFiber").value=targets.fiber;
}
function showStatus(msg,type=""){ $("searchStatus").textContent=msg; $("searchStatus").className=`status ${type}`; }

function renderResults(list){
  $("foodResults").innerHTML=list.map((f,i)=>`
    <div class="food-result">
      <div><h4>${esc(f.name)}</h4><p>${f.kcal} kcal · P ${f.protein}g · C ${f.carbs}g · F ${f.fat}g · Fiber ${f.fiber}g per 100g · ${esc(f.source||"")}</p></div>
      <button onclick="selectFood(${i})">Select</button>
    </div>`).join("");
  window.currentResults=list;
}
function selectFood(i){
  selectedFood=window.currentResults[i];
  $("selectedFoodName").textContent=selectedFood.name;
  $("selectedFoodInfo").textContent=`${selectedFood.kcal} kcal · Protein ${selectedFood.protein}g · Carbs ${selectedFood.carbs}g · Fat ${selectedFood.fat}g · Fiber ${selectedFood.fiber}g per 100g`;
  $("selectedFood").classList.remove("hidden");
  $("gramsInput").focus();
}

async function onlineSearch(q){
  // Open Food Facts' legacy text-search endpoint is used because the current v3 API
  // does not yet expose full-text search. We search only on button press to respect rate limits.
  const url=`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=8&fields=product_name,brands,nutriments`;
  const res=await fetch(url,{headers:{"Accept":"application/json"}});
  if(!res.ok) throw new Error("Online search failed");
  const data=await res.json();
  return (data.products||[]).filter(p=>p.product_name && p.nutriments).map(p=>{
    const n=p.nutriments;
    const kcal=Number(n["energy-kcal_100g"] ?? (Number(n["energy_100g"]||0)/4.184));
    return {name:p.product_name+(p.brands?` (${p.brands.split(",")[0]})`:""),
      kcal:round(kcal),protein:round(n.proteins_100g),carbs:round(n.carbohydrates_100g),
      fat:round(n.fat_100g),fiber:round(n.fiber_100g),source:"Open Food Facts"};
  }).filter(f=>Number.isFinite(f.kcal));
}

async function search(){
  const q=$("foodSearch").value.trim().toLowerCase();
  if(!q){renderResults(BUILTIN_FOODS.slice(0,10));showStatus("Showing popular built-in foods.");return;}
  const local=BUILTIN_FOODS.filter(f=>f.name.toLowerCase().includes(q));
  renderResults(local.slice(0,8));
  showStatus("Searching online…");
  try{
    const online=await onlineSearch(q);
    const merged=[...local,...online].slice(0,12);
    renderResults(merged);
    showStatus(`${merged.length} result${merged.length===1?"":"s"} found. Check the nutrition basis before adding packaged foods.`,"success");
  }catch(e){
    showStatus("Online search is unavailable right now. Built-in results are still available.","error");
  }
}

function addSelected(){
  if(!selectedFood)return;
  const grams=Number($("gramsInput").value);
  if(!(grams>0)){alert("Enter a valid number of grams.");return;}
  foods.push({name:selectedFood.name,grams,n:nutritionFor(selectedFood,grams),source:selectedFood.source});
  save();render();
  showStatus(`${selectedFood.name} added.`,"success");
  selectedFood=null;$("selectedFood").classList.add("hidden");$("gramsInput").value=100;
}

function addCustom(){
  const name=$("customName").value.trim();
  const vals=["customCalories","customProtein","customCarbs","customFat","customFiber"].map(id=>Number($(id).value));
  if(!name || vals.some(v=>!Number.isFinite(v)||v<0)){alert("Enter a name and all nutrition values per 100 g.");return;}
  selectedFood={name,kcal:vals[0],protein:vals[1],carbs:vals[2],fat:vals[3],fiber:vals[4],source:"Custom"};
  $("selectedFoodName").textContent=name;$("selectedFoodInfo").textContent="Custom nutrition values per 100 g.";
  $("selectedFood").classList.remove("hidden");$("gramsInput").focus();
}

function exportCSV(){
  if(!foods.length){alert("Add at least one food first.");return;}
  const rows=[["Food","Grams","Calories kcal","Protein g","Carbs g","Fat g","Fiber g","Source"],
    ...foods.map(f=>[f.name,f.grams,f.n.kcal,f.n.protein,f.n.carbs,f.n.fat,f.n.fiber,f.source||""])];
  const csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`nutritrack-${new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(a.href);
}

$("searchBtn").onclick=search;
$("foodSearch").addEventListener("keydown",e=>{if(e.key==="Enter")search();});
$("addFoodBtn").onclick=addSelected;
$("addCustomBtn").onclick=addCustom;
$("exportBtn").onclick=exportCSV;
$("clearDayBtn").onclick=()=>{if(confirm("Clear all foods for today?")){foods=[];save();render();}};
$("editTargetsBtn").onclick=()=>{$("targetForm").classList.toggle("hidden");loadTargets();};
$("saveTargetsBtn").onclick=()=>{
  targets={calories:Number($("targetCalories").value)||0,protein:Number($("targetProtein").value)||0,carbs:Number($("targetCarbs").value)||0,fat:Number($("targetFat").value)||0,fiber:Number($("targetFiber").value)||0};
  localStorage.setItem("nutritrackTargets",JSON.stringify(targets));$("targetForm").classList.add("hidden");render();
};

$("today").textContent=new Intl.DateTimeFormat(undefined,{dateStyle:"medium"}).format(new Date());
render();
renderResults(BUILTIN_FOODS.slice(0,10));
