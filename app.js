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
const colors=["#ff4b8b","#7656ef","#20a9e8","#55d94b","#ff9f1c","#ff5d5d","#3b9cff","#b7e92d","#d9d9d9"];
const icons=["✦","✎","⌕","▤","▧","▶","</>","✓","•••"];
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",""":"&quot;","'":"&#39;"}[m]));
const norm=t=>({...t,categories:[...new Set(t.categories||["Other"])],capabilities:t.capabilities||[],inputs:t.inputs||[],outputs:t.outputs||[],tags:t.tags||[]});
const text=t=>[t.name,t.description,...t.categories,...t.capabilities,...t.inputs,...t.outputs,...t.tags].join(" ").toLowerCase();
function bucket(t){const h=text(t);for(const [name,words] of groups.slice(0,-1)){if(words.some(w=>h.includes(w)))return name}return "More"}
function score(t,q){let s=0,h=text(t),n=t.name.toLowerCase();for(const x of q.toLowerCase().split(/\s+/).filter(Boolean)){if(n.includes(x))s+=25;if(h.includes(x))s+=7;if(t.categories.some(c=>c.toLowerCase().includes(x)))s+=12;if(t.capabilities.some(c=>c.toLowerCase().includes(x)))s+=8;if(t.tags.some(c=>c.toLowerCase().includes(x)))s+=8}return s}
function count(g){return tools.filter(t=>bucket(t)===g).length}
function renderCats(){
 const all=["All tools",...groups.map(g=>g[0])];
 document.querySelector("#cats").innerHTML=all.map((c,i)=>'<button class="cat" style="--c:'+colors[i%colors.length]+'" data-c="'+(c==="All tools"?"":esc(c))+'"><div class="ico">'+icons[i%icons.length]+'</div><b>'+esc(c)+'</b><span>'+(c==="All tools"?tools.length:count(c))+' tools</span></button>').join("");
 document.querySelectorAll(".cat").forEach(b=>b.onclick=()=>{category=b.dataset.c;render();document.querySelector("#tools").scrollIntoView({behavior:"smooth"})})
}
function render(){
 let a=tools.filter(t=>!category||bucket(t)===category);
 if(query)a=a.map(t=>({...t,s:score(t,query)})).filter(t=>t.s>0).sort((x,y)=>y.s-x.s);else a.sort((x,y)=>x.name.localeCompare(y.name));
 document.querySelector("#title").textContent=query?"Search results":category||"All tools";
 document.querySelector("#count").textContent=a.length+" tool"+(a.length===1?"":"s");
 document.querySelector("#hint").textContent=category?"Selected: "+category:"Pick one";
 document.querySelector("#active").innerHTML=(category?'<button class="active-btn" id="cx">'+esc(category)+' ×</button>':"")+(query?'<button class="active-btn" id="qx">“'+esc(query)+'” ×</button>':"");
 document.querySelector("#cx")?.addEventListener("click",()=>{category="";render()});
 document.querySelector("#qx")?.addEventListener("click",()=>{query="";document.querySelector("#search").value="";render()});
 document.querySelector("#results").innerHTML=a.map(t=>'<article class="tool"><div class="tooltop"><a href="'+esc(t.url)+'" target="_blank" rel="noopener">'+esc(t.name)+'</a><a class="open" href="'+esc(t.url)+'" target="_blank" rel="noopener">OPEN ↗</a></div><p>'+esc(t.description)+'</p><div class="tags">'+t.categories.slice(0,3).map(c=>'<span class="tag">'+esc(c)+'</span>').join("")+'</div></article>').join("");
 document.querySelector("#empty").hidden=a.length>0;
}
document.querySelector("#search").oninput=e=>{query=e.target.value.trim();render()};
document.querySelector("#clear").onclick=()=>{query="";document.querySelector("#search").value="";render()};
document.querySelector("#reset").onclick=()=>{category="";query="";document.querySelector("#search").value="";render()};
document.querySelectorAll(".quick button").forEach(b=>b.onclick=()=>{query=b.dataset.q;document.querySelector("#search").value=query;render();document.querySelector("#tools").scrollIntoView({behavior:"smooth"})});
async function load(){
 try{const r=await fetch("tools.json?"+Date.now(),{cache:"no-store"});if(!r.ok)throw Error("tools.json failed");tools=(await r.json()).map(norm)}catch(e){console.error(e);tools=[]}
 renderCats();render()
}
load();