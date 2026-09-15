let tools=[], selected='All';
const categoryRules={
  'Username':['username','handle','user name','account name'],
  'Email Addresses':['email','e-mail','mail address'],
  'People Search':['person','people','identity','name search','profile'],
  'Social Networks':['social','instagram','facebook','twitter','linkedin','tiktok'],
  'Domains & Infrastructure':['domain','subdomain','dns','host','ip address','certificate','infrastructure','whois'],
  'Images / Videos / Docs':['image','photo','video','document','pdf','visual'],
  'Verification':['verify','verification','fact check','reverse image','authentic'],
  'Search Engines':['search engine','search','indexed','public records'],
  'Business Records':['company','business','corporate','organization'],
  'Geolocation Tools / Maps':['geolocation','location','map','coordinates','geo'],
  'Archives':['archive','historical','wayback','cached'],
  'Automation':['automation','automated','recon','crawler','scraper','collect'],
  'Dark Web':['dark web','onion','tor'],
  'Breach Awareness':['breach','leaked','compromised'],
  'Blockchain & Cryptocurrency':['bitcoin','crypto','blockchain','wallet','transaction'],
  'AI Tools':['ai ','artificial intelligence','machine learning','llm']
};
function inferCategories(t){const text=(t.name+' '+t.description+' '+(t.capabilities||[]).join(' ')+' '+(t.inputs||[]).join(' ')).toLowerCase();let out=[];for(const [cat,words] of Object.entries(categoryRules)){if(words.some(w=>text.includes(w)))out.push(cat)}return out.length?out:['Other'];}
function normalize(t){t.categories=[...(t.categories||[]),...inferCategories(t)];t.categories=[...new Set(t.categories)];t.capabilities=t.capabilities||[];return t}
async function load(){try{tools=(await fetch('tools.json?'+Date.now()).then(r=>r.json())).map(normalize)}catch(e){tools=[]}render()}
function score(t,q){if(!q)return 0;const terms=q.toLowerCase().split(/\s+/).filter(Boolean);const hay=(t.name+' '+t.description+' '+t.categories.join(' ')+' '+t.capabilities.join(' ')+' '+(t.inputs||[]).join(' ')+' '+(t.outputs||[]).join(' ')).toLowerCase();let s=0;for(const x of terms){if(t.name.toLowerCase().includes(x))s+=8;if(t.categories.join(' ').toLowerCase().includes(x))s+=6;if(t.capabilities.join(' ').toLowerCase().includes(x))s+=5;if((t.inputs||[]).join(' ').toLowerCase().includes(x))s+=4;if((t.outputs||[]).join(' ').toLowerCase().includes(x))s+=3;if(t.description.toLowerCase().includes(x))s+=2}return s}
function render(){const q=document.querySelector('#search').value.trim();let arr=tools.filter(t=>selected==='All'||t.categories.includes(selected));if(q)arr=arr.map(t=>({...t,_score:score(t,q)})).filter(t=>t._score>0).sort((a,b)=>b._score-a._score);document.querySelector('#resultCount').textContent=arr.length;document.querySelector('#results').innerHTML=arr.map(t=>`<article class="card"><div class="card-top"><div><h3><a href="${safe(t.url)}" target="_blank" rel="noopener">${safe(t.name)}</a></h3><div class="desc">${safe(t.description)}</div></div><span class="risk">${safe(t.risk||'unknown')} scope</span></div><div class="meta">${t.categories.map(x=>`<span class="tag">${safe(x)}</span>`).join('')}${(t.capabilities||[]).slice(0,5).map(x=>`<span class="tag">${safe(x)}</span>`).join('')}</div>${q?`<div class="why">Match score: ${t._score} · Open tool →</div>`:''}</article>`).join('')||'<div class="card"><strong>No matching tools.</strong><div class="desc">Try a broader task such as “email”, “domain”, “image verification”, or add a new tool.</div></div>';renderCategories()}
function renderCategories(){const counts={};tools.forEach(t=>t.categories.forEach(c=>counts[c]=(counts[c]||0)+1));const cats=['All',...Object.keys(counts).sort()];document.querySelector('#categories').innerHTML=cats.map(c=>`<button class="cat ${selected===c?'active':''}" data-cat="${safe(c)}">${safe(c)} <span>${c==='All'?tools.length:counts[c]}</span></button>`).join('');document.querySelectorAll('.cat').forEach(b=>b.onclick=()=>{selected=b.dataset.cat;render()})}
function safe(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
document.querySelector('#search').oninput=render;document.querySelector('#clear').onclick=()=>{document.querySelector('#search').value='';render()};document.querySelector('#themeBtn').onclick=()=>document.body.classList.toggle('light');document.querySelector('#addBtn').onclick=()=>document.querySelector('#addDialog').showModal();document.querySelector('#addForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);const t=normalize({name:f.get('name'),url:f.get('url'),description:f.get('description'),categories:[],capabilities:[],inputs:[],outputs:[],risk:'unknown'});tools.unshift(t);e.target.reset();document.querySelector('#addDialog').close();render();alert('Tool added for this browser session. To make it permanent, add it to tools.json.');};load();
