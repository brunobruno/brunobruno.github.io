import { spawn } from 'node:child_process'
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--remote-debugging-port=9340', '--window-size=1500,950', '--no-first-run', '--enable-unsafe-swiftshader', 'about:blank',
], { stdio: 'ignore' })
await new Promise((r) => setTimeout(r, 1500))
const list = await (await fetch('http://127.0.0.1:9340/json')).json()
const ws = new WebSocket(list.find((t) => t.type === 'page').webSocketDebuggerUrl)
await new Promise((r) => (ws.onopen = r))
let id = 0
const pending = new Map()
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id) } }
const send = (method, params = {}) => new Promise((res) => { pending.set(++id, res); ws.send(JSON.stringify({ id, method, params })) })
const ev = (expression) => send('Runtime.evaluate', { expression, returnByValue: true }).then((r) => r?.result?.value)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
await send('Runtime.enable'); await send('Page.enable')
await send('Page.navigate', { url: 'http://localhost:5173/' })
await sleep(5000)
await ev(`document.querySelector('#contact').scrollIntoView()`)
await sleep(4000)
console.log(await ev(`JSON.stringify(window.__cam)`))
ws.close(); chrome.kill()
