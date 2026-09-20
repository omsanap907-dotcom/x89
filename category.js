const page=document.documentElement;
const category=page.dataset.category||"More";
const folderColor=page.dataset.color||"#ffd21c";
let tools=[],q="",subcat="";

const rules={
"AI Tools":[/\bai\b/i,/ai /i,/artificial intelligence/i,/assistant/i,/chat/i,/model/i,/humanizer/i,/detector/i],
"Writing":[/writing/i,/paraphras/i,/grammar/i,/essay/i,/rewriting/i,/text rewriting/i],
"Research":[/research/i,/academic/i,/paper/i,/literature/i,/citation/i,/evidence/i,/osint/i,/link analysis/i,/domains? & infrastructure/i,/search engines/i,/verification/i,/breach awareness/i],
"PDF & Docs":[/pdf/i,/document/i,/docs/i,/manuscript/i],
"Image & Design":[/image/i,/design/i,/visual/i,/photo/i,/ocr/i],
"Video & Audio":[/video/i,/audio/i,/transcription/i],
"Developers":[/developer/i,/code/i,/coding/i,/api/i,/programming/i],
"Productivity":[/productivity/i,/note/i,/knowledge/i,/organization/i,/workflow/i,/summarization/i,/education/i]
};

const descriptions={
"AI Tools":"AI assistants, models, detectors and related tools.",
"Writing":"Writing, rewriting, grammar and text tools.",
"Research":"Research, academic, citation, OSINT and evidence tools.",
"PDF & Docs":"PDF, document and manuscript tools.",
"Image & Design":"Image, visual, design, photo and OCR tools.",
"Video & Audio":"Video, audio and transcription tools.",
"Developers":"Coding, developer, API and programming tools.",
"Productivity":"Notes, knowledge, organization and workflow tools.",
"More":"Other useful tools.",
"All tools":"Browse every tool in ToolFast."
};

document.documentElement.style.setProperty("--folder-color",folderColor);

const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const text=t=>[t.name,t.description,...(t.categories||[]),...(t.tags||[]),...(t.capabilities||[]),...(t.inputs||[]),...(t.outputs||[])].join(" ").toLowerCase();
const aliases={
  ai:["artificial intelligence","llm","language model","chatbot","generative ai"],
  detector:["checker","detection","ai detector","ai checker"],
  research:["academic","papers","literature","evidence","study","scholar"],
  writing:["writer","rewriting","paraphrase","grammar","essay","text"],
  pdf:["document","manuscript","paper"],
  notes:["note taking","study","knowledge management"],
  coding:["developer","programming","code","api"],
  image:["visual","photo","ocr","picture"],
  video:["youtube","transcript","transcription","audio"],
  search:["find","discovery","lookup"],
  security:["osint","breach","reconnaissance","verification"]
};
const expandQuery=q=>[...new Set(q.toLowerCase().split(/\s+/).filter(Boolean).flatMap(w=>[w,...(aliases[w]||[])]))];

function bucket(t){
 const h=text(t);
 const cats=(t.categories||[]).join(" | ");
 // Use the tool's explicit categories first, then its searchable metadata.
 for(const [group,patterns] of Object.entries(rules)){
   if(patterns.some(re=>re.test(cats)||re.test(h))) return group;
 }
 return "More";
}

function ensureSubcats(){
 let box=document.querySelector("#subcats");
 if(!box){
   box=document.createElement("div"); box.id="subcats"; box.className="subcats";
   document.querySelector("#desc").after(box);
 }
 const base=category==="All tools"?tools:tools.filter(t=>bucket(t)===category);
 const counts={};
 base.forEach(t=>(t.categories||[]).forEach(s=>counts[s]=(counts[s]||0)+1));
 const subs=Object.entries(counts).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
 box.innerHTML='<button class="subcat '+(!subcat?'selected':'')+'" data-sub="">All</button>'+
   subs.map(([s,n])=>'<button class="subcat '+(subcat===s?'selected':'')+'" data-sub="'+esc(s)+'">'+esc(s)+' <small>'+n+'</small></button>').join("");
 box.querySelectorAll(".subcat").forEach(btn=>btn.onclick=()=>{subcat=btn.dataset.sub||"";ensureSubcats();render()});
}
function searchScore(t,query){
 const terms=expandQuery(query),h=text(t),n=t.name.toLowerCase(); let s=0;
 for(const x of terms){if(n.includes(x))s+=40;if(h.includes(x))s+=10}
 return s;
}
function render(){
 let a=category==="All tools"?[...tools]:tools.filter(t=>bucket(t)===category);
 if(subcat)a=a.filter(t=>(t.categories||[]).includes(subcat));
 if(q)a=a.map(t=>({...t,_score:searchScore(t,q)})).filter(t=>t._score>0).sort((x,y)=>y._score-x._score);
 else a.sort((x,y)=>String(x.name).localeCompare(String(y.name)));
 document.title="ToolFast — "+category;
 document.querySelector("#title").textContent=category;
 document.querySelector("#desc").textContent=descriptions[category]||"Find useful tools.";
 document.querySelector("#count").textContent=a.length+" tool"+(a.length===1?"":"s");
 document.querySelector("#results").innerHTML=a.map(t=>'<article class="tool"><div class="tooltop"><a href="'+esc(t.url)+'" target="_blank" rel="noopener noreferrer">'+esc(t.name)+'</a><a class="open" href="'+esc(t.url)+'" target="_blank" rel="noopener noreferrer">OPEN ↗</a></div><p>'+esc(t.description)+'</p><div class="tags">'+(t.categories||[]).slice(0,3).map(c=>'<span class="tag">'+esc(c)+'</span>').join("")+'</div></article>').join("");
 const empty=document.querySelector("#empty"); if(empty) empty.hidden=a.length>0;
}
ensureSubcats();

document.querySelector("#search").oninput=e=>{q=e.target.value.trim();render()};
document.querySelector("#clear").onclick=()=>{q="";document.querySelector("#search").value="";render()};

fetch("./tools.json?v=20260920",{cache:"no-store"})
 .then(r=>{if(!r.ok)throw Error("tools.json failed: "+r.status);return r.json()})
 .then(x=>{tools=x;render()})
 .catch(e=>{console.error(e);document.querySelector("#title").textContent="Could not load tools";document.querySelector("#count").textContent="";});
