chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    let body: string | null = null;

    if (details.requestBody?.raw?.length) {
      try {
        const buffer = details.requestBody.raw[0].bytes;
        if (buffer) {
          const bytes = new Uint8Array(buffer);
          body = new TextDecoder("utf-8").decode(bytes);
        }
      } catch {
        body = null;
      }
    }

    const newRequest = {
      url: details.url,
      method: details.method,
      body,
      time: details.timeStamp,
    };

    chrome.storage.local.get({ requests: [] }, (result) => {
      const prevRequests = result.requests as any[];
      chrome.storage.local.set({ requests: [newRequest, ...prevRequests] });
    });

    return undefined;
  },
  { urls: ["<all_urls>"] },
  ["requestBody"],
);
