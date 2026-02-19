(function () {
  // ---- FETCH INTERCEPT ----
  const originalFetch = window.fetch;

  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args);

    try {
      const cloned = response.clone();
      const responseBody = await cloned.text();

      chrome.runtime.sendMessage({
        type: "NETWORK_LOG",
        source: "fetch",
        url: args[0],
        method: (args[1] && args[1].method) || "GET",
        status: response.status,
        response: responseBody,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.warn("Fetch capture error:", err);
    }

    return response;
  };

  // ---- XHR INTERCEPT ----
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url) {
    this._method = method;
    this._url = url;
    return originalOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function (body) {
    this.addEventListener("load", function () {
      try {
        chrome.runtime.sendMessage({
          type: "NETWORK_LOG",
          source: "xhr",
          url: this._url,
          method: this._method,
          status: this.status,
          response: this.responseText,
          timestamp: Date.now(),
        });
      } catch (err) {
        console.warn("XHR capture error:", err);
      }
    });

    return originalSend.apply(this, arguments);
  };
})();
