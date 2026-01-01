import { JSDOM } from 'jsdom';
import fs from 'fs';

(async ()=>{
  const html = fs.readFileSync('index.html', 'utf8');
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    resources: 'usable',
    url: 'file://' + process.cwd() + '/'
  });
  const win = dom.window;

  // Inject data.js and script.js inline so they run under the same document
  const dataSrc = fs.readFileSync('data.js', 'utf8');
  const scriptSrc = fs.readFileSync('script.js', 'utf8');
  const s1 = win.document.createElement('script'); s1.textContent = dataSrc; win.document.head.appendChild(s1);
  const s2 = win.document.createElement('script'); s2.textContent = scriptSrc; win.document.head.appendChild(s2);

  // Allow scripts to run
  await new Promise(r=> setTimeout(r, 500));

  // Wait for game list to render
  const select = win.document.querySelector('.select-game');
  if(!select){
    console.log('NO_SELECT');
    process.exit(1);
  }
  select.click();
  await new Promise(r=> setTimeout(r, 200));
  const grid = win.document.getElementById('productGrid');
  console.log('GRID_COUNT', grid ? grid.children.length : 0);
  process.exit(0);
})();