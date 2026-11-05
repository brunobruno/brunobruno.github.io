import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'

const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--remote-debugging-port=9336', '--window-size=1500,950', '--no-first-run', '--enable-unsafe-swiftshader', 'about:blank',
], { stdio: 'ignore' })
await new Promise((r) => setTimeout(r, 1500))
const list = await (await fetch('http://127.0.0.1:9336/json')).json()
const ws = new WebSocket(list.find((t) => t.type === 'page').webSocketDebuggerUrl)
await new Promise((r) => (ws.onopen = r))
let id = 0
const pending = new Map()
const errors = []
ws.onmessage = (e) => {
  const m = JSON.parse(e.data)
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id) }
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text)
}
const send = (method, params = {}) => new Promise((res) => { pending.set(++id, res); ws.send(JSON.stringify({ id, method, params })) })
const ev = (expression) => send('Runtime.evaluate', { expression, returnByValue: true }).then((r) => r?.result?.value)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const shot = async (name) => writeFileSync(`scripts/${name}.png`, Buffer.from((await send('Page.captureScreenshot', { format: 'png' })).data, 'base64'))

await send('Runtime.enable'); await send('Page.enable')
for (const [url, sel, name] of [
  ['http://localhost:5173/?view=experimental', '#icons', 'icons'],
  ['http://localhost:5173/?view=tech', '#backend', 'backend'],
]) {
  await send('Page.navigate', { url })
  await sleep(6000)
  await ev(`window.scrollTo({ top: document.querySelector('${sel}').offsetTop + innerHeight * 0.3, behavior: 'instant' })`)
  await sleep(3500)
  console.log(name, await ev(`JSON.stringify({ canvas: !!document.querySelector('${sel} canvas'), svgNodes: document.querySelectorAll('${sel} svg rect').length, errors: document.querySelector('${sel} .error')?.textContent })`))
  await shot(name)
}
console.log('errors:', errors.length ? errors.slice(0, 5) : 'none')
ws.close(); chrome.kill()
