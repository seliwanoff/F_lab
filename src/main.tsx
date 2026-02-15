import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const originalFetch = window.fetch;

window.fetch = async (...args) => {
  const [resource, config] = args;

  const response = await originalFetch(...args);

  const clonedResponse = response.clone();

  try {
    const data = await clonedResponse.json(); // try parse JSON

    // Dispatch a custom event with request info
    window.dispatchEvent(
      new CustomEvent("network-request", {
        detail: {
          url: resource,
          method: config?.method || "GET",
          requestBody: config?.body || null,
          response: data,
        },
      }),
    );
  } catch (e) {}

  return response;
};

// ------------------------
// Render App
// ------------------------
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
