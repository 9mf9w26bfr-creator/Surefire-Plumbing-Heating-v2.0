const DEFAULT_SERVER_URL = 'http://localhost:3000';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'surefire-capture-selection',
    title: '🚀 发送到 Surefire 水暖工作台',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'surefire-capture-selection' && tab?.id) {
    const text = info.selectionText || '';
    if (!text) return;

    chrome.storage.sync.get(['serverUrl'], async (result) => {
      const server = result.serverUrl || DEFAULT_SERVER_URL;
      const group = tab.title || 'Facebook Group';
      const url = tab.url || '';

      try {
        const response = await fetch(`${server}/api/social-leads/webhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceType: 'CHROME_EXTENSION',
            groupName: group,
            postUrl: url,
            postText: text,
          }),
        });
        const data = await response.json();

        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (success, score, area) => {
            const toast = document.createElement('div');
            toast.style =
              'position:fixed;top:24px;right:24px;z-index:9999999;background:#15803d;color:#fff;padding:12px 20px;border-radius:12px;font-family:sans-serif;font-size:14px;font-weight:bold;box-shadow:0 10px 25px rgba(0,0,0,0.3);border:2px solid #86efac;';
            toast.innerHTML = success
              ? `✅ 已成功同步到 Surefire 工作台！<br><span style="font-size:12px;font-weight:normal;opacity:0.9;">区域: ${area} · 意向评分: ${score}/100</span>`
              : '❌ 同步失败，请检查工作台是否已启动。';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 4000);
          },
          args: [response.ok && data.success, data.lead?.leadScore || 80, data.lead?.areaStatus || 'IN_AREA'],
        });
      } catch (err) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (errMsg) => {
            alert(`无法连接到 Surefire 工作台: ${errMsg}\n请确保本地服务或 Vercel 服务正常运行。`);
          },
          args: [String(err)],
        });
      }
    });
  }
});
