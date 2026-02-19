import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { JsonView } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneLight,
  oneDark,
} from "react-syntax-highlighter/dist/esm/styles/prism";

export default function App() {
  const [input, setInput] = useState("");
  const [parsedJSON, setParsedJSON] = useState<any>(null);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);

  // Dark mode toggle
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  // Load requests + listen for updates
  useEffect(() => {
    if (chrome?.storage?.local) {
      chrome.storage.local.get({ requests: [] }, (result) => {
        //@ts-ignore
        setRequests(result.requests || []);
      });
    }

    const listener = (changes: any, area: string) => {
      if (area === "local" && changes.requests) {
        setRequests(changes.requests.newValue || []);
      }
    };

    chrome.storage.onChanged.addListener(listener);

    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(input);
      setParsedJSON(parsed);
      setInput(JSON.stringify(parsed, null, 2));
      setError("");
    } catch (err: any) {
      setError(err.message);
      setParsedJSON(null);
    }
  };

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(input);
      setParsedJSON(parsed);
      setInput(JSON.stringify(parsed));
      setError("");
    } catch (err: any) {
      setError(err.message);
      setParsedJSON(null);
    }
  };

  const clearJSON = () => {
    setInput("");
    setParsedJSON(null);
    setError("");
  };

  const copyToClipboard = () => navigator.clipboard.writeText(input);

  return (
    <div className="max-w-5xl min-w-96 mx-auto p-4 bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          FLab
        </h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          {darkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 flex-wrap mb-4 justify-center">
        <button onClick={formatJSON} className="btn">
          Format
        </button>
        <button onClick={minifyJSON} className="btn">
          Minify
        </button>
        <button onClick={copyToClipboard} className="btn">
          Copy
        </button>
        <button onClick={clearJSON} className="btn bg-red-500 text-white">
          Clear
        </button>
      </div>

      {/* Textarea */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste your JSON here..."
        className="w-full h-64 p-3 font-mono text-sm border rounded-lg resize-none
                   bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
      />

      {error && <p className="text-red-500 mt-2 text-center">{error}</p>}

      {/* JSON Tree */}
      {parsedJSON && (
        <div className="mt-4 p-2 border rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700">
          <JsonView data={parsedJSON} />
        </div>
      )}

      {/* Syntax Highlighted JSON */}
      {parsedJSON && (
        <SyntaxHighlighter
          language="json"
          style={darkMode ? oneDark : oneLight}
          wrapLongLines
          customStyle={{
            padding: "12px",
            fontFamily: "monospace",
            marginTop: "12px",
          }}
        >
          {JSON.stringify(parsedJSON, null, 2)}
        </SyntaxHighlighter>
      )}

      {/* Network Requests */}
      {requests.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Network Requests
          </h2>

          {requests.map((req, idx) => {
            let parsedResponse = null;

            try {
              parsedResponse =
                typeof req.response === "string"
                  ? JSON.parse(req.response)
                  : req.response;
            } catch {
              parsedResponse = null;
            }

            return (
              <div
                key={idx}
                className="mb-3 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
              >
                <p className="text-sm font-bold text-gray-900 dark:text-white break-words">
                  {req.method} - {req.url}
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Status: {req.status}
                </p>

                {parsedResponse ? (
                  <div className="mt-2">
                    <JsonView data={parsedResponse} />
                  </div>
                ) : (
                  req.response && (
                    <SyntaxHighlighter
                      language="json"
                      style={darkMode ? oneDark : oneLight}
                      wrapLongLines
                      customStyle={{
                        padding: "8px",
                        fontFamily: "monospace",
                        marginTop: "8px",
                      }}
                    >
                      {req.response}
                    </SyntaxHighlighter>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
