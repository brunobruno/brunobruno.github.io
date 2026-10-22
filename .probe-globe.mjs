const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const PORT = 9684
const { spawn } = await import('node:child_process')
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', `--remote-debugging-port=${PORT}`, '--user-data-dir=' + process.env.TEMP + '/devin-probe19', 'about:blank'], { stdio: 'ignore' })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
await sleep(2500)
const t = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()
const ws = new WebSocket(t.find((x) => x.type === 'page').webSocketDebuggerUrl)
await new Promise((r) => (ws.onopen = r))
let id = 0
const pend = new Map()
const logs = []
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id) }
  if (m.method === 'Runtime.exceptionThrown') logs.push('EXC: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text || '').slice(0, 300)) }
const send = (me, pa = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method: me, params: pa })) })
const ev = (x) => send('Runtime.evaluate', { expression: `(function(){${x}})()`, returnByValue: true, awaitPromise: true }).then((m) => m.result?.result?.value ?? JSON.stringify(m.result?.exceptionDetails))
const shot = async (f) => { const d = await send('Page.captureScreenshot', { format: 'jpeg', quality: 70 }); (await import('node:fs')).writeFileSync(f, Buffer.from(d.result.data, 'base64')) }
await send('Runtime.enable'); await send('Page.enable'); await send('Emulation.setDeviceMetricsOverride', { width: 1400, height: 900, deviceScaleFactor: 1, mobile: false })
const BASE = process.argv[2] || 'http://localhost:5173'
await send('Page.navigate', { url: BASE + '/?view=tech' })
await sleep(9000)
await ev('document.querySelectorAll(".switcher button")[2]?.click();return true')
for (let i = 0; i < 10; i++) { await sleep(3000); if (await ev('return !!document.querySelector(".jobs__frame")')) break }
await ev('const t2=document.documentElement.scrollHeight-innerHeight;window.scrollTo({top:Math.round(t2*0.27),behavior:"instant"});return "ok"')
await sleep(3000)
await shot('.shot-globe-fix.jpg')
console.log('round trip...')
await ev('document.querySelectorAll(".switcher button")[1]?.click();return true')
await sleep(6000)
await ev('document.querySelectorAll(".switcher button")[2]?.click();return true')
for (let i = 0; i < 10; i++) { await sleep(3000); if (await ev('return !!document.querySelector(".jobs__frame")')) break }
await ev('const t3=document.documentElement.scrollHeight-innerHeight;window.scrollTo({top:Math.round(t3*0.27),behavior:"instant"});return "ok"')
await sleep(3000)
await shot('.shot-globe-fix2.jpg')
console.log(logs.slice(0, 6).join('\n') || 'no exceptions')
chrome.kill()
process.exit(0)
