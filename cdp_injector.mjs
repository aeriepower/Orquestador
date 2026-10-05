// Test CDP message injection into Antigravity chat input

async function injectPrompt(promptText) {
  const res = await fetch('http://127.0.0.1:63500/json');
  const tabs = await res.json();
  const activeTab = tabs.find(t => t.type === 'page' && t.url && t.url.includes('cbdce638-2b8c-42f9-8b26-559d0b57e89c')) || tabs.find(t => t.type === 'page');

  if (!activeTab) {
    console.error('No active tab found');
    return false;
  }

  return new Promise((resolve) => {
    const ws = new WebSocket(activeTab.webSocketDebuggerUrl);
    let step = 0;

    ws.onopen = () => {
      // Step 1: Focus editor and click inside
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
          expression: `(() => {
            const editor = document.querySelector('div[aria-label="Message input"]');
            if (!editor) return false;
            editor.focus();
            const range = document.createRange();
            range.selectNodeContents(editor);
            range.collapse(false);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            return true;
          })()`
        }
      }));
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id === 1) {
        // Step 2: Insert text via CDP
        ws.send(JSON.stringify({
          id: 2,
          method: 'Input.insertText',
          params: { text: promptText }
        }));
      } else if (msg.id === 2) {
        // Step 3: Dispatch Enter key
        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 3,
            method: 'Input.dispatchKeyEvent',
            params: {
              type: 'keyDown',
              key: 'Enter',
              code: 'Enter',
              windowsVirtualKeyCode: 13,
              nativeVirtualKeyCode: 13
            }
          }));
          ws.send(JSON.stringify({
            id: 4,
            method: 'Input.dispatchKeyEvent',
            params: {
              type: 'keyUp',
              key: 'Enter',
              code: 'Enter',
              windowsVirtualKeyCode: 13,
              nativeVirtualKeyCode: 13
            }
          }));
        }, 100);
      } else if (msg.id === 4) {
        console.log('Injected successfully!');
        ws.close();
        resolve(true);
      }
    };

    ws.onerror = (err) => {
      console.error('WS Error:', err);
      resolve(false);
    };
  });
}

export { injectPrompt };
