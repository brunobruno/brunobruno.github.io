import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const PORT = 9666
const url = process.argv[2], stops = (process.argv[3]||'0').split(',').map(Number)
const chrome = spawn(CHROME, ['--headless=new','--disable-gpu','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader',`--remote-debugging-port=${PORT}`,'--window-size=1400,900','--user-data-dir='+process.env.TEMP+'/devin-shots4','about:blank'],{stdio:'ignore'})
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms))
await sleep(2500)
const targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()
const ws = new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl)
await new Promise(r=>ws.onopen=r)
let id=0; const pending=new Map(); const logs=[]
ws.onmessage=(e)=>{const m=JSON.parse(e.data); if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id)}
 if(m.method==='Runtime.consoleAPICalled'&&!['log','debug','info'].includes(m.params.type))logs.push(m.params.type+': '+m.params.args.map(a=>a.value??a.description).join(' ').slice(0,300))
 if(m.method==='Runtime.exceptionThrown')logs.push('EXC: '+(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text||'').slice(0,500))
 if(m.method==='Network.responseReceived'&&m.params.response.status>=400)logs.push('HTTP '+m.params.response.status+' '+m.params.response.url)}
const send=(method,params={})=>new Promise(r=>{const i=++id;pending.set(i,r);ws.send(JSON.stringify({id:i,method,params}))})
const ev=(expression)=>send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true}).then(m=>m.result?.result?.value)
await send('Runtime.enable'); await send('Page.enable'); await send('Network.enable')
await send('Page.navigate',{url}); await sleep(9000)
const total = await ev('document.documentElement.scrollHeight-innerHeight')
console.log('scrollable px:', total)
for (const s of stops) {
  await ev(`window.scrollTo({top:${Math.round(total*s)},behavior:'instant'});true`)
  await sleep(2500)
  console.log(s, 'dial:', await ev(`document.querySelector('.gears__dial-value')?.textContent`), 'globe canvas:', await ev(`!!document.querySelector('.jobs__frame canvas')`), 'first gear transform:', await ev(`document.querySelector('.gears__svg g g')?.getAttribute('transform')`))
  const {result} = await send('Page.captureScreenshot',{format:'jpeg',quality:70})
  writeFileSync(`.shot-${String(Math.round(s*100)).padStart(2,'0')}.jpg`, Buffer.from(result.data,'base64'))
}
console.log(logs.slice(0,20).join('\n')||'clean')
ws.close(); chrome.kill(); process.exit(0)
