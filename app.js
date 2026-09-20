let tools=[],category="",query="";
const groups=[
["AI Tools",["ai","chat","model","assistant","bot","humanizer","detector"]],
["Writing",["writing","paraphras","grammar","essay","rewriting","text"]],
["Research",["research","academic","paper","literature","citation","evidence","osint"]],
["PDF & Docs",["pdf","document","docs","manuscript"]],
["Image & Design",["image","design","visual","photo","ocr"]],
["Video & Audio",["video","audio","transcription","youtube"]],
["Developers",["developer","code","coding","api","programming"]],
["Productivity",["productivity","note","notes","knowledge","organization","workflow","summarization","education"]],
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
pdf:["document","manuscript","paper"],
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

function bucket(t){
 const h=text(t);
 for(const [name,words] of groups.slice(0,-1)){
  if(words.some(w=>h.includes(w)))return name;
 }
 return "More";
}
function count(g){return tools.filter(t=>bucket(t)===g).length}
function pageFor(c){return {"All tools":"all-tools.html","AI Tools":"ai-tools.html","Writing":"writing.html","Research":"research.html","PDF & Docs":"pdf-docs.html","Image & Design":"image-design.html","Video & Audio":"video-audio.html","Developers":"developers.html","Productivity":"productivity.html","More":"more.html"}[c]||"all-tools.html"}

function score(t,q){
 const terms=expandQuery(q),h=text(t),n=t.name.toLowerCase();
 let s=0;
 for(const x of terms){
  if(n.includes(x))s+=40;
  if(h.includes(x))s+=10;
  if(t.categories.some(v=>v.toLowerCase().includes(x)))s+=18;
  if(t.capabilities.some(v=>v.toLowerCase().includes(x)))s+=12;
  if(t.tags.some(v=>v.toLowerCase().includes(x)))s+=12;
 }
 return s;
}
function renderCats(){
 const all=["All tools",...groups.map(g=>g[0])];
 document.querySelector("#cats").innerHTML=all.map((c,i)=>'<a class="cat" style="--c:'+colors[i%colors.length]+'" href="'+pageFor(c)+'"><div class="ico">'+icons[i%icons.length]+'</div><b>'+esc(c)+'</b><span>'+(c==="All tools"?tools.length:count(c))+' tools</span></a>').join("");
}
function render(){
 let a=[...tools];
 if(query)a=a.map(t=>({...t,_score:score(t,query)})).filter(t=>t._score>0).sort((x,y)=>y._score-x._score);
 else a.sort((x,y)=>x.name.localeCompare(y.name));
 document.querySelector("#title").textContent=query?"Search results":"All tools";
 document.querySelector("#count").textContent=a.length+" tool"+(a.length===1?"":"s");
 document.querySelector("#hint").textContent=query?"Related matches":"Pick one";
 document.querySelector("#active").innerHTML=query?'<button class="active-btn" id="qx">“'+esc(query)+'” ×</button>':"";
 document.querySelector("#qx")?.addEventListener("click",()=>{query="";document.querySelector("#search").value="";render()});
 document.querySelector("#results").innerHTML=a.map(t=>'<article class="tool"><div class="tooltop"><a href="'+esc(t.url)+'" target="_blank" rel="noopener">'+esc(t.name)+'</a><a class="open" href="'+esc(t.url)+'" target="_blank" rel="noopener">OPEN ↗</a></div><p>'+esc(t.description)+'</p><div class="tags">'+t.categories.slice(0,3).map(c=>'<span class="tag">'+esc(c)+'</span>').join("")+'</div></article>').join("");
 document.querySelector("#empty").hidden=a.length>0;
}
document.querySelector("#search").oninput=e=>{query=e.target.value.trim();render()};
document.querySelector("#clear").onclick=()=>{query="";document.querySelector("#search").value="";render()};
document.querySelector("#reset").onclick=()=>{query="";document.querySelector("#search").value="";render()};
document.querySelectorAll(".quick button").forEach(b=>b.onclick=()=>{query=b.dataset.q;document.querySelector("#search").value=query;render();document.querySelector("#tools").scrollIntoView({behavior:"smooth"})});

async function load(){
 const catsEl=document.querySelector("#cats");
 try{
  const r=await fetch("tools.json?"+Date.now(),{cache:"no-store"});
  if(!r.ok)throw Error("tools.json failed: "+r.status);
  tools=(await r.json()).map(norm);
 }catch(e){console.error(e);tools=[]}
 renderCats();
 render();
 if(!tools.length)catsEl.innerHTML='<div class="loading">No tools loaded. Check tools.json and refresh.</div>';
}
load();
const menuBtn=document.querySelector("#menu"),mobileMenu=document.querySelector("#mobileMenu");
menuBtn?.addEventListener("click",()=>{const open=mobileMenu?.classList.toggle("open");menuBtn.setAttribute("aria-expanded",open)});
mobileMenu?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{mobileMenu.classList.remove("open");menuBtn.setAttribute("aria-expanded","false")}));
