(function(){
  const KEY = 'pidey_theme_v1';
  function applyTheme(t){
    if(t && t !== 'default') document.body.setAttribute('data-theme', t);
    else document.body.removeAttribute('data-theme');
    // update button state
    document.querySelectorAll('.theme-toggle').forEach(b=>{
      b.setAttribute('aria-pressed', t && t !== 'default' ? 'true' : 'false');
    });
  }

  function toggle(){
    const cur = localStorage.getItem(KEY) || 'default';
    const next = cur === 'default' ? 'alt' : 'default';
    localStorage.setItem(KEY, next);
    applyTheme(next);
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const saved = localStorage.getItem(KEY) || 'default';
    applyTheme(saved);
    document.querySelectorAll('.theme-toggle').forEach(btn=>{
      btn.addEventListener('click', (e)=>{ toggle(); });
    });
  });
})();