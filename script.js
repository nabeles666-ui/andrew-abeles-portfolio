const carousel = document.getElementById('project-carousel');
const previousButton = document.querySelector('.carousel-arrow.previous');
const nextButton = document.querySelector('.carousel-arrow.next');
const allCards = carousel ? Array.from(carousel.querySelectorAll('.selected-card')) : [];
let cards = [...allCards];
let currentIndex = 0;

function goToProject(index, behavior='smooth') {
  if (!carousel || !cards.length) return;
  currentIndex = (index + cards.length) % cards.length;
  const card = cards[currentIndex];
  carousel.scrollTo({left: card.offsetLeft - carousel.offsetLeft, behavior});
}
previousButton?.addEventListener('click', () => goToProject(currentIndex - 1));
nextButton?.addEventListener('click', () => goToProject(currentIndex + 1));
carousel?.addEventListener('scroll', () => {
  if (!cards.length) return;
  const left = carousel.scrollLeft;
  let best = 0, dist = Infinity;
  cards.forEach((card,i) => {
    const d = Math.abs((card.offsetLeft - carousel.offsetLeft) - left);
    if (d < dist) { dist = d; best = i; }
  });
  currentIndex = best;
}, {passive:true});

function clearProjectFilter(){
  allCards.forEach(card => card.hidden = false);
  cards=[...allCards]; currentIndex=0;
  document.getElementById('category-context')?.setAttribute('hidden','');
}
function showProjectGroup(idList, label='Selected category'){
  const wanted=idList.map(id=>document.getElementById(id)).filter(Boolean);
  if(!wanted.length) return;
  allCards.forEach(card => card.hidden = !wanted.includes(card));
  cards=wanted; currentIndex=0;
  const ctx=document.getElementById('category-context');
  if(ctx){ctx.removeAttribute('hidden'); const t=ctx.querySelector('.category-context-label'); if(t)t.textContent=`${label}: ${wanted.length} projects`;}
  requestAnimationFrame(()=>goToProject(0,'auto'));
  document.getElementById('portfolio')?.scrollIntoView({behavior:'smooth',block:'start'});
}
document.querySelector('.show-all-projects')?.addEventListener('click',()=>{clearProjectFilter(); requestAnimationFrame(()=>goToProject(0,'auto'));});

function focusProject(id) {
  clearProjectFilter();
  const card = document.getElementById(id);
  if (!card || !carousel) return;
  const idx = cards.indexOf(card);
  if (idx >= 0) goToProject(idx);
  document.querySelectorAll('.selected-card.is-targeted').forEach(el => el.classList.remove('is-targeted'));
  card.classList.add('is-targeted');
  setTimeout(() => card.classList.remove('is-targeted'), 1800);
}
document.querySelectorAll('[data-project-target]').forEach(link => {
  link.addEventListener('click', event => {
    const id = link.dataset.projectTarget;
    if (!id || !document.getElementById(id)) return;
    event.preventDefault();
    focusProject(id);
    history.replaceState(null, '', `#${id}`);
  });
});
document.querySelectorAll('[data-project-group]').forEach(link=>{
  link.addEventListener('click',event=>{
    event.preventDefault();
    const ids=(link.dataset.projectGroup||'').trim().split(/\s+/).filter(Boolean);
    const label=(link.getAttribute('aria-label')||link.querySelector('strong')?.textContent||'Selected category').replace(/ projects?$/i,'');
    showProjectGroup(ids,label);
    history.replaceState(null,'','#portfolio');
  });
});
if (location.hash) {
  const id = location.hash.slice(1);
  if (document.getElementById(id)) setTimeout(() => focusProject(id), 120);
}
