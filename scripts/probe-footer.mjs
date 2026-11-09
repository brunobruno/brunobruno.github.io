import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--remote-debugging-port=9337', '--window-size=1500,950', '--no-first-run', '--enable-unsafe-swiftshader', 'about:blank',
], { stdio: 'ignore' })
await new Promise((r) => setTimeout(r, 1500))
const list = await (await fetch('http://127.0.0.1:9337/json')).json()
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
await send('Page.navigate', { url: 'http://localhost:5173/' })
await sleep(5000)
await ev(`document.querySelector('#contact').scrollIntoView()`)
await sleep(4000)
console.log(await ev(`JSON.stringify({
  gl: !!document.querySelector('.footer__gl canvas'),
  canvasCount: document.querySelectorAll('canvas').length,
  footerH: document.querySelector('.footer').offsetHeight,
})`))
await shot('footer')
console.log('errors:', errors.length ? errors.slice(0, 5) : 'none')
ws.close(); chrome.kill()
