const res = await fetch('http://127.0.0.1:63500/json');
const tabs = await res.json();
const activeTab = tabs.find(t => t.type === 'page' && t.url && t.url.includes('cbdce638-2b8c-42f9-8b26-559d0b57e89c')) || tabs.find(t => t.type === 'page');

const ws = new WebSocket(activeTab.webSocketDebuggerUrl);
ws.onopen = () => {
  ws.send(JSON.stringify({
    id: 1,
    method: 'Runtime.evaluate',
    params: {
      expression: `(() => {
        const editor = document.querySelector('div[aria-label="Message input"]');
        let p = editor;
        for (let i = 0; i < 6; i++) {
          if (p.parentElement) p = p.parentElement;
        }
        const buttons = Array.from(p.querySelectorAll('button')).map(b => ({
          aria: b.getAttribute('aria-label'),
          text: b.innerText,
          disabled: b.disabled
        }));
        return { parentClass: p.className, buttons };
      })()`,
      returnByValue: true
    }
  }));
};

ws.onmessage = (event) => {
  console.log('Parent:', JSON.stringify(JSON.parse(event.data).result.result.value, null, 2));
  process.exit(0);
};
