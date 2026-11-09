import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--remote-debugging-port=9339', '--window-size=1500,950', '--no-first-run', '--enable-unsafe-swiftshader', '--allow-file-access-from-files', 'about:blank',
], { stdio: 'ignore' })
await new Promise((r) => setTimeout(r, 1500))
const list = await (await fetch('http://127.0.0.1:9339/json')).json()
const ws = new WebSocket(list.find((t) => t.type === 'page').webSocketDebuggerUrl)
await new Promise((r) => (ws.onopen = r))
let id = 0
const pending = new Map()
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id) } }
const send = (method, params = {}) => new Promise((res) => { pending.set(++id, res); ws.send(JSON.stringify({ id, method, params })) })
const ev = (expression) => send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }).then((r) => r?.result?.value ?? JSON.stringify(r?.exceptionDetails ?? r))
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const shot = async (name) => writeFileSync(`scripts/${name}.png`, Buffer.from((await send('Page.captureScreenshot', { format: 'png' })).data, 'base64'))
await send('Runtime.enable'); await send('Page.enable')
await send('Page.navigate', { url: 'http://localhost:5173/' })
await sleep(5000)
await ev(`document.querySelector('#contact').scrollIntoView()`)
await sleep(5000)
await shot('magenta')
// analyze: load png, count magenta pixels
await send('Page.navigate', { url: 'file:///C:/Users/bruno/Desktop/portifolio/scripts/magenta.png' })
await sleep(1500)
console.log(await ev(`new Promise((res) => {
  const img = new Image()
  img.onload = () => {
    const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height
    const cx = cv.getContext('2d'); cx.drawImage(img, 0, 0)
    const d = cx.getImageData(0, 0, cv.width, cv.height).data
    let mag = 0, dark = 0
    for (let i = 0; i < d.length; i += 4) {
      if (d[i] > 200 && d[i+2] > 200 && d[i+1] < 100) mag++
      if (d[i] < 20 && d[i+1] < 40 && d[i+2] < 60) dark++
    }
    res(JSON.stringify({ magenta: mag, dark: dark, total: d.length / 4 }))
  }
  img.src = 'file:///C:/Users/bruno/Desktop/portifolio/scripts/magenta.png'
})`))
ws.close(); chrome.kill()
