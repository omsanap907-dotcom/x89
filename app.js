let tools=[],category="",query="";
const groups=[
["AI Tools",["ai","chat","model","assistant","bot","humanizer","detector"]],
["Writing",["writing","paraphras","grammar","essay","rewriting","text"]],
["Research",["research","academic","paper","literature","citation","evidence"]],
["PDF & Docs",["pdf","document","docs","manuscript"]],
["Image & Design",["image","design","visual","photo","ocr"]],
["Video & Audio",["video","audio","transcription"]],
["Developers",["developer","code","coding","api","programming"]],
["Productivity",["productivity","note","notes","knowledge","organization","workflow"]],
["More",[]]
];
const colors=["#ffd21c","#ff4b8b","#7656ef","#55d94b","#55d94b","#ff9f1c","#ff5d5d","#3b9cff","#b7e92d","#d9d9d9"];
const icons=["✦","✎","⌕","▤","▧","▶","</>","✓","•••"];
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const aliases={
  ai:["artificial intelligence","llm","language model","chatbot","generative ai"],
  chatbot:["chat","assistant","bot","ai"],
  humanizer:["humanize","natural writing","ai writing"],
  detector:["checker","detection","ai detector","ai checker"],
  plagiarism:["similarity","originality","academic integrity"],
  research:["academic","papers","literature","evidence","study","scholar"],
  writing:["writer","rewriting","paraphrase","grammar","essay","text"],
  pdf:["document","manuscript","paper","pdf"],
  notes:["note taking","study","knowledge management"],
  coding:["developer","programming","code","api","software"],
  image:["visual","photo","ocr","picture"],
  video:["youtube","transcript","transcription","audio"],
  search:["find","discovery","lookup","research"],
  email:["mail","email address"],
  domain:["website","hostname","subdomain","infrastructure"],
  security:["osint","breach","reconnaissance","verification"],
  student:["education","learning","academic","study"]
};
const expandQuery=q=>[...new Set(q.toLowerCase().split(/\s+/).filter(Boolean).flatMap(w=>[w,...(aliases[w]||[])]))];
const norm=t=>({...t,categories:[...new Set(t.categories||["Other"])],capabilities:t.capabilities||[],inputs:t.inputs||[],outputs:t.outputs||[],tags:t.tags||[]});
const text=t=>[t.name,t.description,...t.categories,...t.capabilities,...t.inputs,...t.outputs,...t.tags].join(" ").toLowerCase();
function bucket(t){const h=text(t);for(const [name,words] of groups.slice(0,-1)){if(words.some(w=>h.includes(w)))return name}return "More"}
function score(t,q){
 const terms=expandQuery(q); const h=text(t),n=t.name.toLowerCase(); let s=0;
 for(const x of terms){
   if(n.includes(x))s+=40;
   if(h.includes(x))s+=10;
   if(t.categories.some(v=>v.toLowerCase().includes(x)))s+=18;
   if(t.capabilities.some(v=>v.toLowerCase().includes(x)))s+=12;
   if(t.tags.some(v=>v.toLowerCase().includes(x)))s+=12;
 }
 return s;
}
document.querySelector("#search").oninput=e=>{query=e.target.value.trim();render()};
document.querySelector("#clear").onclick=()=>{query="";document.querySelector("#search").value="";render()};
document.querySelector("#reset").onclick=()=>{category="";query="";document.querySelector("#search").value="";render()};
document.querySelectorAll(".quick button").forEach(b=>b.onclick=()=>{query=b.dataset.q;document.querySelector("#search").value=query;render();document.querySelector("#tools").scrollIntoView({behavior:"smooth"})});
async function load(){
 const catsEl=document.querySelector("#cats");
 try{const r=await fetch("tools.json?"+Date.now(),{cache:"no-store"});if(!r.ok)throw Error("tools.json failed");tools=(await r.json()).map(norm)}catch(e){console.error(e);tools=[]}
 renderCats();render();
 if(!tools.length) catsEl.innerHTML='<div class="loading">No tools loaded. Check tools.json and refresh.</div>';
}
load();
const menuBtn=document.querySelector("#menu"),mobileMenu=document.querySelector("#mobileMenu");
menuBtn?.addEventListener("click",()=>{const open=mobileMenu.classList.toggle("open");menuBtn.setAttribute("aria-expanded",open)});
mobileMenu?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{mobileMenu.classList.remove("open");menuBtn.setAttribute("aria-expanded","false")}));