import { JSDOM } from 'jsdom';

const URL = 'http://127.0.0.1:5500/test.html';
(async ()=>{
  try{
    const dom = await JSDOM.fromURL(URL, {
      runScripts: 'dangerously',
      resources: 'usable',
      pretendToBeVisual: true
    });

    // Wait for DOM to populate results
    const win = dom.window;
    await new Promise((res, rej)=>{
      const timeout = setTimeout(()=>{
        res();
      }, 5000);
      // wait for 'All scripted checks finished' text or until timeout
      function check(){
        const r = win.document.getElementById('results');
        if(r){
          const items = Array.from(r.children).map(c=>c.textContent || '');
          if(items.some(t => t.includes('All scripted checks finished'))){
            clearTimeout(timeout);
            res();
            return;
          }
        }
        setTimeout(check, 120);
      }
      check();
    });

    const resultsEl = dom.window.document.getElementById('results');
    const lines = Array.from(resultsEl.children).map(el => el.textContent.trim());
    console.log('TEST RESULTS:');
    lines.forEach(l=>console.log(l));
    // Exit
    process.exit(0);
  }catch(err){
    console.error('Error running tests:', err);
    process.exit(2);
  }
})();