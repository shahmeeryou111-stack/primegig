// ===== PrimeGig — interactions =====
document.getElementById('yr').textContent = new Date().getFullYear();

// Animated counters
const counters = document.querySelectorAll('.metric .num');
const animate = (el) => {
  const target = +el.dataset.count;
  const dur = 1400; const start = performance.now();
  const tick = (t) => {
    const p = Math.min((t - start) / dur, 1);
    el.textContent = Math.floor(p * target);
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  };
  requestAnimationFrame(tick);
};
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); }
  });
}, { threshold: 0.4 });
counters.forEach(c => io.observe(c));

// ===== Chat widget =====
const panel = document.getElementById('chatPanel');
const body  = document.getElementById('chatBody');
const form  = document.getElementById('chatInput');
const field = document.getElementById('chatField');

document.querySelectorAll('[data-open-chat]').forEach(b =>
  b.addEventListener('click', () => { openChat(); }));
document.querySelectorAll('[data-close-chat]').forEach(b =>
  b.addEventListener('click', () => panel.classList.remove('open')));

let step = 0;
const data = { goal:'', name:'', email:'', details:'' };
let started = false;

function openChat(){
  panel.classList.add('open');
  if (!started) { started = true; runStep(); }
  setTimeout(()=>field.focus(), 300);
}

function addMsg(text, who='bot', html=false){
  const el = document.createElement('div');
  el.className = `msg ${who}`;
  if (html) el.innerHTML = text; else el.textContent = text;
  body.appendChild(el);
  body.scrollTop = body.scrollHeight;
  return el;
}
function typing(){
  const t = document.createElement('div');
  t.className = 'typing';
  t.innerHTML = '<span></span><span></span><span></span>';
  body.appendChild(t); body.scrollTop = body.scrollHeight;
  return t;
}
function botSay(text, delay=600, cb){
  const t = typing();
  const isHtml = /<\w+/.test(text);
  setTimeout(() => { t.remove(); addMsg(text, 'bot', isHtml); cb && cb(); }, delay);
}

function runStep(){
  if (step === 0){
    botSay("👋 Welcome to PrimeGig. I'll grab a few details and email them straight to our team.", 400, () => {
      botSay("First — what's your primary goal?", 700, () => {
        const wrap = document.createElement('div');
        wrap.className = 'chat-quick';
        ['More Traffic','More Sales','Brand Awareness'].forEach(opt => {
          const b = document.createElement('button');
          b.textContent = opt;
          b.onclick = () => { pickGoal(opt); wrap.remove(); };
          wrap.appendChild(b);
        });
        body.appendChild(wrap); body.scrollTop = body.scrollHeight;
      });
    });
  }
}
function pickGoal(g){
  data.goal = g;
  addMsg(g, 'user');
  step = 1;
  botSay("Great choice. What's your name?", 500);
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const v = field.value.trim();
  if (!v) return;
  addMsg(v, 'user');
  field.value = '';

  if (step === 0){ // free-type goal fallback
    data.goal = v; step = 1;
    botSay("Got it. What's your name?", 500);
  } else if (step === 1){
    data.name = v; step = 2;
    botSay(`Nice to meet you, ${v}. What's the best email to reach you?`, 500);
  } else if (step === 2){
    if (!/^\S+@\S+\.\S+$/.test(v)){
      botSay("That email looks off — mind typing it again?", 400);
      return;
    }
    data.email = v; step = 3;
    botSay("Perfect. Briefly describe your project — what do you need built or written?", 500);
  } else if (step === 3){
    data.details = v; step = 4;
    botSay("Sending your brief now…", 400, submitChat);
  }
});

async function submitChat(){
  try{
    const fd = new FormData();
    fd.append('_subject', `New PrimeGig lead — ${data.name}`);
    fd.append('_captcha', 'false');
    fd.append('_template', 'table');
    fd.append('Goal', data.goal);
    fd.append('Name', data.name);
    fd.append('Email', data.email);
    fd.append('Details', data.details);
    fd.append('Source', 'PrimeGig Chat Widget');

    const res = await fetch('https://formsubmit.co/ajax/shahmeeryou111@gmail.com', {
      method:'POST',
      headers:{ 'Accept':'application/json' },
      body: fd
    });
    if (res.ok){
      botSay(`✅ Sent! We'll reply to <strong>${data.email}</strong> within 4 hours with a tailored plan.`, 500, () => {
        botSay("Meanwhile, feel free to browse the work below. Talk soon! 🚀", 800);
      });
    } else {
      throw new Error('send failed');
    }
  } catch(err){
    botSay(`⚠️ Couldn't send automatically. Please email us directly at <strong>shahmeeryou111@gmail.com</strong> — your brief is ready to copy.`, 500);
  }
}

