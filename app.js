let tools = [], selected = 'All';

const categoryRules = {
  'AI & Automation':['ai','artificial intelligence','machine learning','llm','automation','automated','workflow'],
  'Developer Tools':['code','developer','programming','api','sdk','debug','git','repository','json','database'],
  'Design & Graphics':['design','graphic','ui','ux','logo','illustration','vector','photo editor'],
  'Video & Audio':['video','audio','music','podcast','editing','subtitle','transcription','voice'],
  'Writing & Research':['writing','writer','research','paper','citation','grammar','summarize','literature'],
  'Productivity':['productivity','notes','calendar','task','project management','document','spreadsheet'],
  'Data & Analytics':['data','analytics','statistics','visualization','dashboard','csv','excel'],
  'Marketing & SEO':['marketing','seo','keyword','advertising','social media','content'],
  'Business & Finance':['business','finance','accounting','invoice','sales','crm','company'],
  'Security & Privacy':['security','privacy','password','encryption','vulnerability','malware'],
  'OSINT & Investigation':['osint','investigation','recon','username','email','people search','domain','whois','geolocation'],
  'Education & Learning':['education','learning','course','study','tutor','flashcard'],
  'Maps & Geolocation':['map','maps','location','geolocation','coordinates','route'],
  'Images & Media Search':['image','photo','reverse image','visual search','media'],
  'Files & Utilities':['file','pdf','converter','compress','download','utility','calculator'],
  'Web & Internet':['website','web','browser','search engine','internet','url','domain'],
  'Communication':['email','chat','messaging','video call','communication'],
  'Other':['tool','directory','platform']
};

const stop = new Set(['the','a','an','for','to','of','and','or','with','my','this','that','i','need','want','find','get','make','use','on','in','it','is']);

function textOf(t){
  return [t.name,t.description,...(t.categories||[]),...(t.capabilities||[]),...(t.inputs||[]),...(t.outputs||[]),...(t.tags||[])].join(' ').toLowerCase();
}

function inferCategories(t){
  const text = textOf(t);
  const scored = Object.entries(categoryRules).map(([cat, words]) => {
    let score = 0;
    for (const word of words) if (text.includes(word)) score += word.includes(' ') ? 3 : 1;
    return [cat, score];
  }).filter(([,score]) => score > 0).sort((a,b) => b[1]-a[1]);
  return scored.length ? scored.slice(0,4).map(([cat]) => cat) : ['Other'];
}

function normalize(t){
  const explicit = Array.isArray(t.categories) ? t.categories : [];
  t.categories = [...new Set([...explicit, ...inferCategories(t)])];
  t.capabilities = t.capabilities || [];
  t.inputs = t.inputs || [];
  t.outputs = t.outputs || [];
  t.tags = t.tags || [];
  return t;
}

async function load(){
  try {
    const response = await fetch('tools.json?' + Date.now(), {cache:'no-store'});
    if (!response.ok) throw new Error('Tool registry unavailable');
    tools = (await response.json()).map(normalize);
  } catch(e) {
    tools = [];
    document.querySelector('#results').innerHTML = '<div class="card"><strong>Tool registry unavailable.</strong><div class="desc">Please try again later.</div></div>';
  }
  render();
}

function tokenize(q){
  return q.toLowerCase().replace(/[^a-z0-9+#.-]+/g,' ').split(/\s+/).filter(x => x && !stop.has(x));
}

function score(t,q){
  if(!q) return 0;
  const terms = tokenize(q), text = textOf(t);
  let score = 0;
  for(const term of terms){
    if(t.name.toLowerCase().includes(term)) score += 12;
    if((t.categories||[]).join(' ').toLowerCase().includes(term)) score += 8;
    if((t.capabilities||[]).join(' ').toLowerCase().includes(term)) score += 7;
    if((t.inputs||[]).join(' ').toLowerCase().includes(term)) score += 5;
    if((t.outputs||[]).join(' ').toLowerCase().includes(term)) score += 4;
    if((t.tags||[]).join(' ').toLowerCase().includes(term)) score += 5;
    if(t.description.toLowerCase().includes(term)) score += 3;
  }
  return score;
}

function render(){
  const q = document.querySelector('#search').value.trim();
  let arr = tools.filter(t => selected === 'All' || t.categories.includes(selected));
  if(q) arr = arr.map(t => ({...t,_score:score(t,q)})).filter(t => t._score > 0).sort((a,b) => b._score-a._score);
  document.querySelector('#resultCount').textContent = arr.length;
  document.querySelector('#results').innerHTML = arr.map(t => `
    <article class="card">
      <div class="card-top"><div><h3><a href="${safe(t.url)}" target="_blank" rel="noopener noreferrer">${safe(t.name)}</a></h3><div class="desc">${safe(t.description)}</div></div><span class="risk">${safe(t.risk||'unknown')}</span></div>
      <div class="meta">${t.categories.map(x=>`<span class="tag">${safe(x)}</span>`).join('')}${(t.capabilities||[]).slice(0,4).map(x=>`<span class="tag">${safe(x)}</span>`).join('')}</div>
      ${q ? `<div class="why">Relevance score: ${t._score}</div>` : ''}
    </article>`).join('') || '<div class="card"><strong>No matching tools.</strong><div class="desc">Try describing the task differently.</div></div>';
  renderCategories();
}

function renderCategories(){
  const counts = {};
  tools.forEach(t => t.categories.forEach(c => counts[c]=(counts[c]||0)+1));
  const cats = ['All', ...Object.keys(counts).sort()];
  document.querySelector('#categories').innerHTML = cats.map(c => `<button class="cat ${selected===c?'active':''}" data-cat="${safe(c)}">${safe(c)} <span>${c==='All'?tools.length:counts[c]}</span></button>`).join('');
  document.querySelectorAll('.cat').forEach(b => b.onclick = () => {selected=b.dataset.cat;render();});
}

function safe(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}

document.querySelector('#search').oninput = render;
document.querySelector('#clear').onclick = () => {document.querySelector('#search').value='';render();};
document.querySelector('#themeBtn').onclick = () => document.body.classList.toggle('light');
load();
