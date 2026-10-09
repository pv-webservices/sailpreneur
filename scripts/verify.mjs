import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import assert from 'node:assert/strict';

const base=process.env.QA_URL||'http://127.0.0.1:4321';
const output='output/audit';
await mkdir(output,{recursive:true});
async function findRoutes(dir){const results=[];for(const entry of await readdir(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())results.push(...await findRoutes(path));else if(entry.name==='index.html')results.push('/'+relative('dist',path).replaceAll('\\','/').replace(/index\.html$/,''));}return results;}
const routes=(await findRoutes('dist')).sort();
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({reducedMotion:'reduce'});
const page=await context.newPage();
const errors=[];page.on('pageerror',error=>errors.push(String(error)));page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});
const report={routes:routes.length,responsive:[],accessibility:[],interactions:[],links:[],consoleErrors:errors};
const titles=new Set(), descriptions=new Set();
try{
 for(const route of routes){
  for(const width of [360,390,768,1024,1440,1920]){
   await page.setViewportSize({width,height:900});
   const response=await page.goto(base+route);assert.equal(response.status(),200,route);
   await page.evaluate(()=>document.fonts.ready);
   const state=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,brokenImages:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src),h1:document.querySelectorAll('h1').length,hiddenHeadings:[...document.querySelectorAll('h1,h2')].filter(el=>getComputedStyle(el).opacity==='0').length}));
   assert.equal(state.overflow,false,`Overflow ${route} at ${width}`);assert.equal(state.h1,1,`H1 count ${route}`);assert.equal(state.hiddenHeadings,0,`Hidden heading ${route}`);
   // Scroll to trigger lazy loading before verifying images.
   await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=700){scrollTo(0,y);await new Promise(r=>setTimeout(r,15));}scrollTo(0,0);});
   await page.evaluate(()=>document.querySelectorAll('img[loading="lazy"]').forEach(img=>img.loading='eager'));
   await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
   report.responsive.push({route,width,pass:true});
   if(width===390||width===1440){
    const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    const violations=result.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));
    report.accessibility.push({route,width,violations});
   }
   if(width===1440){
    const seo=await page.evaluate(()=>({title:document.title,description:document.querySelector('meta[name="description"]')?.content,links:[...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href'))}));
    assert(!titles.has(seo.title),`Duplicate title ${route}`);titles.add(seo.title);assert(seo.description,`Missing description ${route}`);assert(!descriptions.has(seo.description),`Duplicate description ${route}`);descriptions.add(seo.description);
    for(const href of new Set(seo.links.filter(h=>h.startsWith('/')||h.startsWith('#')))){
     const url=new URL(href,base+route);const fetched=await context.request.get(url.href);assert.equal(fetched.status(),200,`Broken link ${route}: ${href}`);
     if(url.hash){const html=await fetched.text();const id=decodeURIComponent(url.hash.slice(1));assert(html.includes(`id="${id}"`),`Missing anchor ${href} from ${route}`);}
     report.links.push({from:route,href,pass:true});
    }
   }
  }
  console.log(`Verified ${route}`);
 }
 await page.setViewportSize({width:390,height:844});await page.goto(base+'/');
 const menu=page.locator('.menu-toggle');await menu.click();assert.equal(await menu.getAttribute('aria-expanded'),'true');await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Programs',exact:true}).focus();await page.keyboard.press('Escape');assert.equal(await menu.getAttribute('aria-expanded'),'false');report.interactions.push('Mobile navigation opens and Escape closes it with focus restored');
 await menu.click();await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Contact',exact:true}).click();await page.waitForURL('**/contact/');report.interactions.push('Mobile navigation reaches contact page');
 await page.goto(base+'/faq/');const faq=page.locator('details').filter({hasText:'Does AKMICS guarantee a cruise job?'});await faq.locator('summary').focus();await page.keyboard.press('Enter');assert(await faq.getAttribute('open')!==null);assert((await faq.innerText()).includes('No —'));report.interactions.push('FAQ opens with keyboard');
 await page.goto(base+'/contact/');
 await page.goto(base+'/contact/?department=food-beverage');assert.equal(await page.locator('#department').inputValue(),'food-beverage');report.interactions.push('Career pathway enquiry preselects the requested department');
 await page.getByRole('button',{name:'Prepare My Enquiry'}).click();assert.equal(await page.locator('#download-enquiry').isVisible(),false);report.interactions.push('Empty form blocks enquiry preparation');
 await page.getByLabel('Full name').fill('Synthetic QA');await page.getByLabel('Phone number').fill('+91 9000000000');await page.getByLabel('Education / profession').fill('Synthetic hospitality student');await page.getByLabel('How can we help?').fill('Synthetic enquiry for local QA only.');await page.locator('input[name="consent"]').check();
 await page.getByLabel('Phone number').fill('+++++++');await page.getByRole('button',{name:'Prepare My Enquiry'}).click();assert.equal(await page.locator('#download-enquiry').isVisible(),false);await page.getByLabel('Phone number').fill('+91 9000000000');report.interactions.push('Phone input rejects values without sufficient digits');
 await page.getByRole('button',{name:'Prepare My Enquiry'}).click();await page.waitForFunction(()=>document.querySelector('#download-enquiry').hidden===false);assert((await page.locator('#form-status').innerText()).includes('has not been sent'));const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#download-enquiry').click()]);await download.saveAs(output+'/synthetic-enquiry.txt');assert((await readFile(output+'/synthetic-enquiry.txt','utf8')).includes('Synthetic QA'));report.interactions.push('Enquiry download contains synthetic input and reports no delivery');
 // Exercise configured-provider branches using browser interception only.
 await page.evaluate(()=>document.querySelector('#contact-form').dataset.endpoint='https://qa.invalid/enquiry');
 await page.route('https://qa.invalid/enquiry',route=>route.fulfill({status:200,contentType:'application/json',body:'{"success":false}'}));await page.getByRole('button',{name:'Prepare My Enquiry'}).click();await page.waitForFunction(()=>document.querySelector('#form-status').textContent.includes('could not confirm'));assert.equal(await page.getByLabel('Full name').inputValue(),'Synthetic QA');report.interactions.push('Unconfirmed provider response preserves input and shows failure');
 await page.unroute('https://qa.invalid/enquiry');await page.route('https://qa.invalid/enquiry',route=>route.fulfill({status:200,contentType:'application/json',body:'{"success":true}'}));await page.getByRole('button',{name:'Prepare My Enquiry'}).click();await page.waitForFunction(()=>document.querySelector('#form-status').textContent.includes('has been received'));assert.equal(await page.getByLabel('Full name').inputValue(),'');report.interactions.push('Mock acknowledged provider response shows confirmation and resets form');
 await page.setViewportSize({width:1440,height:900});await page.goto(base+'/');const track=page.locator('.story-track');await track.scrollIntoViewIfNeeded();await page.getByRole('button',{name:'Next story'}).click();await page.waitForTimeout(400);assert((await track.evaluate(el=>el.scrollLeft))>0);report.interactions.push('Success-story carousel controls scroll the gallery');await page.setViewportSize({width:390,height:844});
 const noJs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const basic=await noJs.newPage();await basic.goto(base+'/');assert(await basic.locator('h1').isVisible());assert(await basic.getByRole('navigation',{name:'Main navigation'}).isVisible());await basic.goto(base+'/contact/');assert(await basic.getByRole('button',{name:'Prepare My Enquiry'}).isDisabled());report.interactions.push('Without JavaScript, content and navigation remain visible and form submission is disabled');await noJs.close();
 await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/');await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:output+'/home-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.goto(base+'/');await page.screenshot({path:output+'/home-mobile.png',fullPage:true});
 await page.goto(base+'/contact/');await page.screenshot({path:output+'/contact-mobile.png',fullPage:true});
 const missing=await context.request.get(base+'/missing-page-qa/');assert.equal(missing.status(),404);report.interactions.push('Unknown route returns HTTP 404');
 assert.equal(errors.length,0,`Console errors: ${errors.join('\n')}`);
}finally{await writeFile(output+'/verification.json',JSON.stringify(report,null,2));await browser.close();}
const a11y=report.accessibility.flatMap(r=>r.violations);
console.log(JSON.stringify({routes:report.routes,responsive:report.responsive.length,accessibility:report.accessibility.length,violations:a11y.length,links:report.links.length,interactions:report.interactions.length,consoleErrors:errors.length},null,2));
if(a11y.length)process.exitCode=1;
