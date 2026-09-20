const page=document.documentElement;
const category=page.dataset.category||"More";
const folderColor=page.dataset.color||"#ffd21c";
let tools=[],q="";

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

function bucket(t){
 const h=text(t);
 const cats=(t.categories||[]).join(" | ");
 // Use the tool's explicit categories first, then its searchable metadata.
 for(const [group,patterns] of Object.entries(rules)){
   if(patterns.some(re=>re.test(cats)||re.test(h))) return group;
 }
 return "More";
}

function render(){
 let a=category==="All tools"?[...tools]:tools.filter(t=>bucket(t)===category);
 if(q)a=a.filter(t=>text(t).includes(q.toLowerCase()));
 a.sort((x,y)=>String(x.name).localeCompare(String(y.name)));
 document.title="ToolFast — "+category;
 document.querySelector("#title").textContent=category;
 document.querySelector("#desc").textContent=descriptions[category]||"Find useful tools.";
 document.querySelector("#count").textContent=a.length+" tool"+(a.length===1?"":"s");
 document.querySelector("#results").innerHTML=a.map(t=>'<article class="tool"><div class="tooltop"><a href="'+esc(t.url)+'" target="_blank" rel="noopener noreferrer">'+esc(t.name)+'</a><a class="open" href="'+esc(t.url)+'" target="_blank" rel="noopener noreferrer">OPEN ↗</a></div><p>'+esc(t.description)+'</p><div class="tags">'+(t.categories||[]).slice(0,3).map(c=>'<span class="tag">'+esc(c)+'</span>').join("")+'</div></article>').join("");
 const empty=document.querySelector("#empty"); if(empty) empty.hidden=a.length>0;
}

document.querySelector("#search").oninput=e=>{q=e.target.value.trim();render()};
document.querySelector("#clear").onclick=()=>{q="";document.querySelector("#search").value="";render()};

fetch("./tools.json?v=20260920",{cache:"no-store"})
 .then(r=>{if(!r.ok)throw Error("tools.json failed: "+r.status);return r.json()})
 .then(x=>{tools=x;render()})
 .catch(e=>{console.error(e);document.querySelector("#title").textContent="Could not load tools";document.querySelector("#count").textContent="";});
