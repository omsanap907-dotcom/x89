let tools=[], selected='All', queryTimer=null;
const categoryRules={
 'Username':['username','handle','user name','account name'],
 'Email Addresses':['email','e-mail','mail address'],
 'People Search':['person','people','identity','name search','profile'],
 'Social Networks':['social','instagram','facebook','twitter','linkedin','tiktok'],
 'Domains & Infrastructure':['domain','subdomain','dns','host','ip address','certificate','infrastructure','whois'],
 'Images / Videos / Docs':['image','photo','video','document','pdf','visual'],
 'Verification':['verify','verification','fact check','reverse image','authentic','validate'],
 'Search Engines':['search engine','search','indexed','public records'],
 'Business Records':['company','business','corporate','organization'],
 'Geolocation Tools / Maps':['geolocation','location','map','coordinates','geo'],
 'Archives':['archive','historical','wayback','cached'],
 'Automation':['automation','automated','recon','crawler','scraper','collect'],
 'Dark Web':['dark web','onion','tor'],
 'Breach Awareness':['breach','leaked','compromised'],
 'Blockchain & Cryptocurrency':['bitcoin','crypto','blockchain','wallet','transaction'],
 'AI Tools':['ai ','artificial intelligence','machine learning','llm'],
 'Code / Development':['api','sdk','developer','code','github','programming'],
 'Metadata / File Analysis':['metadata','exif','file analysis','hash'],
 'Public Records':['records','registry','government','filing'],
 'Phone Numbers':['phone','telephone','mobile number','number lookup']
};
function inferCategories(t){const text=(t.name+' '+t.description+' '+(t.capabilities||[]).join(' ')+' '+(t.inputs||[]).join(' ')+' '+(t.outputs||[]).join(' ')).toLowerCase();const out=[];for(const [cat,words] of Object.entries(categoryRules))if(words.some(w=>text.includes(w)))out.push(cat);return out.length?out:['Other']}
function normalize(t){t.categories=[...new Set([...(t.categories||[]),...inferCategories(t)].filter(Boolean))];t.capabilities=[...new Set(t.capabilities||[])];t.inputs=[...new Set(t.inputs||[])];t.outputs=[...new Set(t.outputs||[])];return t}
async function load(){try{const r=await fetch('tools.json?'+Date.now());if(!r.ok)throw new Error('tools.json failed');tools=(await r.json()).map(normalize)}catch(e){console.error(e);tools=[]}render()}
function tokenize(q){return q.toLowerCase().replace(/[^a-z0-9@._-]+/g,' ').split(/\s+/).filter(Boolean)}
function score(t,q){if(!q)return {score:0,matched:[]};const terms=tokenize(q),name=t.name.toLowerCase(),cats=t.categories.join(' ').toLowerCase(),caps=t.capabilities.join(' ').toLowerCase(),inputs=t.inputs.join(' ').toLowerCase(),outputs=t.outputs.join(' ').toLowerCase(),desc=t.description.toLowerCase();let score=0,matched=[];for(const x of terms){let hit=false;if(name.includes(x)){score+=12;hit=true}if(caps.includes(x)){score+=9;hit=true}if(inputs.includes(x)){score+=8;hit=true}if(outputs.includes(x)){score+=6;hit=true}if(cats.includes(x)){score+=5;hit=true}if(desc.includes(x)){score+=3;hit=true}if(hit)matched.push(x)}const phrase=terms.join(' ');if(terms.length>1&&desc.includes(phrase))score+=10;return {score,matched:[...new Set(matched)]}}
function render(){const q=document.querySelector('#search').value.trim();let arr=tools.filter(t=>selected==='All'||t.categories.includes(selected));if(q)arr=arr.map(t=>({...t,_match:score(t,q)})).filter(t=>t._match.score>0).sort((a,b)=>b._match.score-a._match.score);document.querySelector('#resultCount').textContent=arr.length;document.querySelector('#results').innerHTML=arr.map(t=>`<article class="card"><div class="card-top"><div><h3><a href="${safe(t.url)}" target="_blank" rel="noopener noreferrer">${safe(t.name)}</a></h3><div class="desc">${safe(t.description)}</div></div><span class="risk">${safe(t.risk||'unknown')} scope</span></div><div class="meta">${t.categories.map(x=>`<span class="tag">${safe(x)}</span>`).join('')}${t.capabilities.slice(0,5).map(x=>`<span class="tag">${safe(x)}</span>`).join('')}</div>${q?`<div class="why">Matched: ${t._match.matched.slice(0,5).map(safe).join(', ')} · Score ${t._match.score}</div>`:''}</article>`).join('')||'<div class="card"><strong>No matching tools.</strong><div class="desc">Describe the task rather than the tool name: “find an email”, “investigate a domain”, or “verify an image”.</div></div>';renderCategories()}
function renderCategories(){const counts={};tools.forEach(t=>t.categories.forEach(c=>counts[c]=(counts[c]||0)+1));const cats=['All',...Object.keys(counts).sort()];document.querySelector('#categories').innerHTML=cats.map(c=>`<button class="cat ${selected===c?'active':''}" data-cat="${safe(c)}">${safe(c)} <span>${c==='All'?tools.length:counts[c]}</span></button>`).join('');document.querySelectorAll('.cat').forEach(b=>b.onclick=()=>{selected=b.dataset.cat;render()})}
function safe(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
document.querySelector('#search').oninput=()=>{clearTimeout(queryTimer);queryTimer=setTimeout(render,80)};
document.querySelector('#clear').onclick=()=>{document.querySelector('#search').value='';render()};
document.querySelector('#themeBtn').onclick=()=>document.body.classList.toggle('light');
document.querySelector('#addBtn').onclick=()=>document.querySelector('#addDialog').showModal();
document.querySelector('#addForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);const t=normalize({name:f.get('name'),url:f.get('url'),description:f.get('description'),categories:[],capabilities:[],inputs:[],outputs:[],risk:'unknown'});tools.unshift(t);e.target.reset();document.querySelector('#addDialog').close();render();alert('Tool added for this browser session. Permanent storage will require the backend tool-registry API.')};
load();