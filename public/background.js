chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== "NETWORK_LOG") return;

  const requestData = {
    url: message.url,
    method: message.method,
    status: message.status,
    response: message.response,
    source: message.source, // fetch or xhr
    tabId: sender.tab ? sender.tab.id : null,
    time: message.timestamp,
  };

  chrome.storage.local.get({ requests: [] }, function (result) {
    const prev = Array.isArray(result.requests) ? result.requests : [];

    chrome.storage.local.set({
      requests: [requestData].concat(prev),
    });
  });
});
