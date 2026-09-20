const category=new URLSearchParams(location.search).get("category")||"More";
let tools=[],q="";

const groups={
  "AI Tools":["ai","chat","model","assistant","bot","humanizer","detector"],
  "Writing":["writing","paraphras","grammar","essay","rewriting","text"],
  "Research":["research","academic","paper","literature","citation","evidence"],
  "PDF & Docs":["pdf","document","docs","manuscript"],
  "Image & Design":["image","design","visual","photo","ocr"],
  "Video & Audio":["video","audio","transcription"],
  "Developers":["developer","code","coding","api","programming"],
  "Productivity":["productivity","note","notes","knowledge","organization","workflow"]
};

const descriptions={
  "AI Tools":"AI assistants, models, detectors and related tools.",
  "Writing":"Writing, rewriting, grammar and text tools.",
  "Research":"Research, academic, citation and evidence tools.",
  "PDF & Docs":"PDF, document and manuscript tools.",
  "Image & Design":"Image, visual, design, photo and OCR tools.",
  "Video & Audio":"Video, audio and transcription tools.",
  "Developers":"Coding, developer, API and programming tools.",
  "Productivity":"Notes, knowledge, organization and workflow tools.",
  "More":"Other useful tools."
};

const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const text=t=>[
  t.name,t.description,...(t.categories||[]),...(t.tags||[]),
  ...(t.capabilities||[]),...(t.inputs||[]),...(t.outputs||[])
].join(" ").toLowerCase();

function bucket(t){
  const h=text(t);
  for(const [g,words] of Object.entries(groups)){
    if(words.some(w=>h.includes(w))) return g;
  }
  return "More";
}

function render(){
  let a=category==="All tools" ? [...tools] : tools.filter(t=>bucket(t)===category);
  if(q){
    const query=q.toLowerCase();
    a=a.filter(t=>text(t).includes(query));
  }
  a.sort((x,y)=>String(x.name).localeCompare(String(y.name)));

  document.title="ToolFast — "+category;
  document.querySelector("#title").textContent=category;
  document.querySelector("#desc").textContent=category==="All tools"
    ? "Browse every tool in ToolFast."
    : (descriptions[category]||"Find useful tools in this category.");
  document.querySelector("#count").textContent=a.length+" tool"+(a.length===1?"":"s");

  document.querySelector("#results").innerHTML=a.map(t=>'<article class="tool"><div class="tooltop"><a href="'+esc(t.url)+'" target="_blank" rel="noopener noreferrer">'+esc(t.name)+'</a><a class="open" href="'+esc(t.url)+'" target="_blank" rel="noopener noreferrer">OPEN ↗</a></div><p>'+esc(t.description)+'</p><div class="tags">'+(t.categories||[]).slice(0,3).map(c=>'<span class="tag">'+esc(c)+'</span>').join("")+'</div></article>').join("");

  const empty=document.querySelector("#empty");
  if(empty) empty.hidden=a.length>0;
}

document.querySelector("#search").oninput=e=>{q=e.target.value.trim();render()};
document.querySelector("#clear").onclick=()=>{q="";document.querySelector("#search").value="";render()};

fetch("tools.json?"+Date.now(),{cache:"no-store"})
  .then(r=>{if(!r.ok)throw new Error("tools.json failed");return r.json()})
  .then(x=>{tools=x;render()})
  .catch(()=>{document.querySelector("#title").textContent="Could not load tools";});
