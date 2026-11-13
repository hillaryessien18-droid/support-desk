'use strict';
const $=id=>document.getElementById(id);
const key='support-desk-v1';
const blank=()=>({jobs:[],answers:{}});
let state;
try{state=JSON.parse(localStorage.getItem(key))||blank()}catch{state=blank()}
let page='pipeline',editing=null,filters={query:'',mode:'',status:''};
const statuses=['Saved','Preparing','Applied','Interview','Offer','Rejected','Withdrawn'];
const modes=['Remote','Hybrid','Onsite','Unspecified'];
const channels=['Customer service representative','Customer support','Chat support','Email support','Phone support','Trading support'];
const specs=[
 ['title','Role title','text',true],['employer','Employer','text',true],['location','City / country','text',true],['mode','Work arrangement',modes],['channel','Role type',channels],['salary','Salary and currency','text'],['url','Application link','url'],['deadline','Deadline','date'],['eligibility','Nigeria eligibility / sponsorship','text'],['status','Status',statuses],['applied','Date applied','date'],['interview','Interview date and time (Lagos)','datetime-local'],['followup','Follow-up date','date'],['nextDate','Next action date','date'],['next','Next action','text'],['description','Job description','textarea'],['notes','Interview, follow-up and application notes','textarea']
];
const profile='Environmental Chemistry graduate · NYSC completed October 2026 · Entry-level candidate based in Lagos, Nigeria · Available across time zones';
const skills=[
 ['Basic computer literacy',/computer literacy|computer skills|computer proficiency|digital literacy/i,'Match','Use a concrete example of learning or using a digital tool.'],
 ['Customer-service mindset',/customer.service|customer support|patience|empathy|customer focus/i,'Transferable','Prepare an example of listening, clarifying a problem and following through.'],
 ['Issue documentation',/document|record.keep|ticket notes|attention to detail/i,'Transferable','Use a real university or software project example to demonstrate accurate record keeping.'],
 ['CRM and ticketing',/\bcrm\b|zendesk|freshdesk|salesforce|hubspot|ticketing/i,'Practice gap','Practice creating, tagging, escalating and closing tickets in a demo.'],
 ['Call management',/call management|call cent(?:er|re)|phone support|inbound calls|outbound calls/i,'Practice gap','Rehearse a mock call and write a concise call summary.'],
 ['Chat and email support',/live chat|chat support|email support|written communication/i,'Practice gap','Write sample responses for an account access issue and a delayed request.'],
 ['Formal experience',/\b(?:\d+\+?\s*(?:years?|yrs?)|prior experience|previous experience|professional experience)\b/i,'Review requirement','Check whether experience is mandatory or whether early-career applicants qualify.'],
 ['Trading platform familiarity',/trading|brokerage|forex|crypto|wallet/i,'Transferable','Describe your personal demo and live account use. Confirm your actual markets and platforms.'],
 ...[['HTML/CSS',/\bhtml\b|\bcss\b/i],['JavaScript',/javascript/i],['React',/\breact\b/i],['Python',/\bpython\b/i],['Django',/\bdjango\b/i],['Git/GitHub',/\bgit\b|github/i]].map(([label,pattern])=>[label,pattern,'Match','Point to a relevant project or GitHub example.'])
];
const questions=[
 ['Why customer support?','I enjoy helping people understand what to do next. My Environmental Chemistry studies and software projects helped me approach problems methodically and learn digital tools. I’m ready to apply that approach to customer support and develop hands-on CRM and call-management skills.'],
 ['How would you handle an upset customer?','I would listen, acknowledge the frustration and ask a focused question to confirm the issue. I’d explain what I can do, give a realistic update time, document the interaction and escalate through the right channel if needed.'],
 ['How do you prioritize multiple requests?','I would follow the team’s service rules, prioritizing urgent or high-impact issues. I’d acknowledge each request, keep clear notes and communicate expected response times.'],
 ['How familiar are you with trading?','I have practiced placing trades using a demo account, so I’m familiar with the basic steps involved in placing a trade. My experience is personal. I can share the markets, platforms and length of time I’ve actually traded.'],
 ['How many requests did you handle per shift or at once?','I’m applying for my first formal support role, so I don’t have a measured ticket volume per shift or concurrent ticket count to report.'],
 ['Which B2C products have you supported?','I’m applying for my first formal B2C support role. I’ve used trading platforms personally and can explain basic platform workflows from a user’s perspective.'],
 ['How would you handle a trading account issue?','I would confirm the issue, follow the platform’s identity verification process and check the available account or order details. I’d document what I found, explain the next step and escalate when required.']
];
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Lagos',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const day=value=>value?new Date(value.slice(0,10)+'T12:00:00Z').toLocaleDateString('en-NG',{day:'numeric',month:'short',timeZone:'Africa/Lagos'}):'—';
const safeUrl=value=>{try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}};
function persist(next){
 try{localStorage.setItem(key,JSON.stringify(next));state=next;return true}catch{alert('Could not save. Check your browser storage and try again.');return false}
}
function matches(description){return skills.filter(([,pattern])=>pattern.test(description||''))}
function options(items,selected='',placeholder=''){return (placeholder?'<option value="">'+placeholder+'</option>':'')+items.map(item=>'<option '+(item===selected?'selected':'')+'>'+esc(item)+'</option>').join('')}
function action(job){
 if(['Rejected','Withdrawn'].includes(job.status))return null;
 const candidates=[
  [job.nextDate,job.next||'Next action'],[job.interview,'Interview'+(job.interview?' at '+job.interview.slice(11):'')],[job.followup,'Follow up'],[!job.applied&&['Saved','Preparing'].includes(job.status)?job.deadline:'','Application deadline']
 ].filter(([date])=>date).sort(([a],[b])=>a.localeCompare(b));
 return candidates[0]|| (job.next?['',job.next]:null);
}
function list(){
 const visible=state.jobs.filter(j=>(!filters.mode||j.mode===filters.mode)&&(!filters.status||j.status===filters.status)&&[j.title,j.employer,j.location,j.channel,j.next].join(' ').toLowerCase().includes(filters.query.trim().toLowerCase()));
 $('count').textContent=visible.length+' '+(visible.length===1?'role':'roles');
 $('list').innerHTML=visible.length?'<div class="table"><table><thead><tr><th>Role / employer</th><th>Location</th><th>Status</th><th>Deadline</th><th>Next action</th></tr></thead><tbody>'+visible.map(j=>{
 const next=action(j),url=safeUrl(j.url);
 return '<tr><td><button class="rowbutton" data-job="'+esc(j.id)+'">'+esc(j.title)+'</button><span class="sub">'+esc(j.employer)+' · '+esc(j.channel)+'</span>'+(url?'<a class="sub link" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">Application link ↗</a>':'')+'</td><td>'+esc(j.location)+'<span class="sub">'+esc(j.mode)+(j.salary?' · '+esc(j.salary):'')+'</span></td><td><span class="pill">'+esc(j.status)+'</span></td><td>'+day(j.deadline)+'</td><td>'+(next?esc(next[1])+'<span class="sub '+(next[0]&&next[0].slice(0,10)<today()?'overdue':'')+'">'+(next[0]?day(next[0]):'')+'</span>':'—')+'</td></tr>';
 }).join('')+'</tbody></table></div>':'<div class="empty"><i aria-hidden="true">▤</i><h3>'+ (state.jobs.length?'No matching roles':'Your application list is empty')+'</h3><p>'+(state.jobs.length?'Change the search or filters to see more roles.':'Add a vacancy to track its deadline, requirements and next step.')+'</p><button data-empty>'+(state.jobs.length?'Clear filters':'Add your first role')+'</button></div>';
}
function render(){
 const copy={pipeline:['Applications','Application tracker','Organize your roles, prepare your applications, and keep follow-ups on track.'],gaps:['Skills gaps','Skills gaps','Compare saved job descriptions with your skills and identify what to practice.'],answers:['Answer bank','Answer bank','Edit and copy reusable answers for applications and interviews.']}[page];
 ['crumb','heading','intro'].forEach((id,i)=>$(id).textContent=copy[i]);
 document.querySelectorAll('nav button').forEach(button=>{const active=button.dataset.page===page;button.classList.toggle('active',active);button.setAttribute('aria-pressed',active)});
 if(page==='pipeline'){
  const now=today(), monday=new Date(now+'T12:00Z');
  monday.setUTCDate(monday.getUTCDate()-(monday.getUTCDay()+6)%7);
  const start=monday.toISOString().slice(0,10),end=new Date(monday.getTime()+6*86400000).toISOString().slice(0,10);
  const inWeek=value=>value&&value.slice(0,10)>=start&&value.slice(0,10)<=end;
  const counts=[['Roles added',state.jobs.filter(j=>inWeek(j.created)).length],['Applications sent',state.jobs.filter(j=>inWeek(j.applied)).length],['Interviews scheduled',state.jobs.filter(j=>inWeek(j.interview)).length],['Follow-ups scheduled',state.jobs.filter(j=>inWeek(j.followup)&&!['Rejected','Withdrawn'].includes(j.status)).length]];
  $('view').innerHTML='<section class="panel"><div class="top"><h2>This week</h2><span class="sub">'+day(start)+' – '+day(end)+' · Lagos time</span></div><div class="stats">'+counts.map(([label,n])=>'<div class="card"><span>'+label+'</span><strong>'+n+'</strong></div>').join('')+'</div></section><section class="panel"><div class="top"><h2>Saved roles</h2><span class="pill" id="count"></span></div><div class="filters"><input id="query" type="search" aria-label="Search roles" placeholder="Search roles, employers or locations" value="'+esc(filters.query)+'"><select id="mode" aria-label="Work arrangement">'+options(modes,filters.mode,'All arrangements')+'</select><select id="status" aria-label="Application status">'+options(statuses,filters.status,'All statuses')+'</select></div><div id="list"></div></section>';
  ['query','mode','status'].forEach(id=>$(id).addEventListener('input',event=>{filters[id]=event.target.value;list()}));
  list();
 }else if(page==='gaps'){
  $('view').innerHTML='<section class="panel"><h2>Your baseline</h2><p>'+esc(profile)+'</p><p>Basic computer literacy, customer-service mindset, CRM and call-management interests, HTML/CSS, JavaScript, React, Python, Django and Git/GitHub.</p><p>Comparison flags phrases for review. Check the full posting for context and requirements the checker misses.</p></section>'+ (state.jobs.length?state.jobs.map(j=>'<section class="panel"><div class="top"><h2>'+esc(j.title)+'</h2><button data-job="'+esc(j.id)+'">Open role</button></div><p>'+esc(j.employer)+'</p>'+comparison(j.description)+'</section>').join(''):'<section class="panel"><p>Add a role with its job description to see relevant skills and practice areas here.</p></section>');
 }else{
  $('view').innerHTML='<div class="answers">'+questions.map(([q,a],i)=>'<section class="panel"><h3><label for="answer'+i+'">'+esc(q)+'</label></h3><textarea id="answer'+i+'">'+esc(state.answers[i]??a)+'</textarea><button data-save-answer="'+i+'">Save edit</button> <button data-copy="answer'+i+'">Copy</button></section>').join('')+'</div>';
 }
}
function comparison(description){
 const found=matches(description);
 return found.length?'<ul>'+found.map(([name,,kind,note])=>'<li><strong>'+name+'</strong> · '+kind+'. '+note+'</li>').join('')+'</ul>':'<p>'+(description?'No supported phrases found. Review the posting manually.':'Paste a job description to compare requirements.')+'</p>';
}
function openRole(id){
 editing=state.jobs.find(j=>j.id===id)||null;
 const j=editing||{mode:'Unspecified',status:'Saved'};
 $('formtitle').textContent=editing?'Edit role':'Add role';
 $('remove').hidden=!editing;
 $('fields').innerHTML='<div class="grid">'+specs.map(([name,label,type,required])=>{
 const field=Array.isArray(type)?'<select name="'+name+'">'+options(type,j[name])+'</select>':type==='textarea'?'<textarea name="'+name+'">'+esc(j[name])+'</textarea>':'<input name="'+name+'" type="'+type+'" value="'+esc(j[name])+'" '+(required?'required':'')+'>';
 return '<label class="'+(type==='textarea'?'wide':'')+'">'+label+field+'</label>';
 }).join('')+'</div>';
 $('comparison').innerHTML='<section class="panel"><h3>Skills comparison</h3><div id="roleMatch">'+comparison(j.description)+'</div></section>';
 $('drafts').innerHTML='<section class="panel"><div class="top"><h3>Application drafts</h3><button type="button" id="generate">Create missing drafts</button></div><div class="grid"><label class="wide">Tailored CV summary and skills<textarea name="cv" id="cv">'+esc(j.cv)+'</textarea></label><button type="button" data-copy="cv">Copy CV draft</button><label class="wide">Short cover letter<textarea name="letter" id="letter">'+esc(j.letter)+'</textarea></label><button type="button" data-copy="letter">Copy cover letter</button></div></section>';
 $('form').elements.description.oninput=event=>{$('roleMatch').innerHTML=comparison(event.target.value)};
 $('generate').onclick=()=>{
  const v=Object.fromEntries(new FormData($('form'))),technical=matches(v.description).filter(([, ,kind])=>kind==='Match').map(([label])=>label);
  const strength=technical.length?technical.join(', '):'basic computer literacy and the ability to learn digital tools';
  const role=v.title.trim()||'customer support role', employer=v.employer.trim()||'your team';
  if(!$('cv').value.trim())$('cv').value='Example Applicant | Lagos, Nigeria\n\nPROFILE\nEnvironmental Chemistry graduate seeking a '+role+' position. I bring a customer-service mindset, '+strength+' and an interest in CRM and call management. Available across time zones.\n\nEDUCATION & SERVICE\nDegree in Environmental Chemistry\nNYSC completed October 2026\n\nPROJECT EVIDENCE\nAdd one real university or software project that demonstrates a requirement from this posting.';
  if(!$('letter').value.trim())$('letter').value='Dear Hiring Team,\n\nI’m applying for the '+role+' position at '+employer+'. I’m an Environmental Chemistry graduate and completed NYSC on October 2026. I bring a customer-service mindset and '+strength+'. I’m interested in helping customers resolve issues and developing hands-on experience with your support tools and processes.\n\nThank you for considering my application.\n\nExample Applicant';
 };
 $('editor').showModal();
}
$('form').onsubmit=event=>{
 event.preventDefault();
 const data=Object.fromEntries(new FormData(event.target));
 for(const name of ['title','employer','location']){data[name]=data[name].trim();if(!data[name]){event.target.elements[name].focus();return}}
 if(data.url&&!safeUrl(data.url)){alert('Enter an HTTP or HTTPS application link.');return}
 if(!data.applied&&['Applied','Interview','Offer'].includes(data.status)) data.applied=today();
 const job={...editing,...data,id:editing?.id||crypto.randomUUID(),created:editing?.created||today()};
 const jobs=editing?state.jobs.map(j=>j.id===job.id?job:j):[job,...state.jobs];
 if(persist({...state,jobs})){$('editor').close();render()}
};
$('close').onclick=()=>$('editor').close();
$('remove').onclick=()=>{if(editing&&confirm('Delete this role and its drafts?')&&persist({...state,jobs:state.jobs.filter(j=>j.id!==editing.id)})){$('editor').close();render()}};
$('add').onclick=()=>openRole();
document.addEventListener('click',async event=>{
 const button=event.target.closest('button');
 if(!button)return;
 const d=button.dataset;
 if(d.page){page=d.page;render()}
 if(d.job)openRole(d.job);
 if('empty' in d){if(state.jobs.length){filters={query:'',mode:'',status:''};render()}else openRole()}
 if(d.saveAnswer!==undefined&&persist({...state,answers:{...state.answers,[d.saveAnswer]:$('answer'+d.saveAnswer).value}}))button.textContent='Saved';
 if(d.copy){const field=$(d.copy);try{await navigator.clipboard.writeText(field.value);button.textContent='Copied'}catch{field.focus();field.select();button.textContent='Text selected'}}
});
$('export').onclick=()=>{
 const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'})),a=document.createElement('a');
 a.href=url;a.download='support-desk-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
$('import').onchange=async event=>{
 const file=event.target.files[0];if(!file)return;
 try{
  const backup=JSON.parse(await file.text());
  if(!Array.isArray(backup.jobs)||!backup.answers||typeof backup.answers!=='object'||Array.isArray(backup.answers)||!Object.values(backup.answers).every(a=>typeof a==='string')||!backup.jobs.every(j=>j&&typeof j.id==='string'&&typeof j.created==='string'&&typeof j.title==='string'&&Object.values(j).every(v=>typeof v==='string'))||new Set(backup.jobs.map(j=>j.id)).size!==backup.jobs.length)throw Error();
  if(confirm('Replace the records and answer edits in this browser with this backup?')&&persist({jobs:backup.jobs,answers:backup.answers})){$('notice').textContent='Backup restored.';render()}
 }catch{$('notice').textContent='Could not read this backup.'}finally{event.target.value=''}
};
$('date').textContent=new Intl.DateTimeFormat('en-NG',{timeZone:'Africa/Lagos',weekday:'short',month:'short',day:'numeric',year:'numeric'}).format(new Date());
render();
