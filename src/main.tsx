
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";

  console.log("🚀 [main.tsx] Starting application...");
  console.log("🔍 [main.tsx] React version:", import.meta.env.DEV ? 'development' : 'production');

  try {
    console.log("🔍 [main.tsx] Finding root element...");
    const rootElement = document.getElementById("root");

    if (!rootElement) {
      console.error("❌ [main.tsx] Root element not found!");
      throw new Error("Root element not found");
    }

    console.log("✅ [main.tsx] Root element found:", rootElement);
    console.log("🔍 [main.tsx] Creating React root...");

    const root = createRoot(rootElement);
    console.log("✅ [main.tsx] React root created successfully");

    console.log("🔍 [main.tsx] Rendering App component...");
    root.render(<App />);
    console.log("✅ [main.tsx] App component rendered");

  } catch (error) {
    console.error("❌ [main.tsx] Error during initialization:", error);
    console.error("❌ [main.tsx] Error stack:", error instanceof Error ? error.stack : 'No stack trace');

    // Show error on page
    document.body.innerHTML = `
      <div style="padding: 20px; background: #1a1a1a; color: white; font-family: monospace;">
        <h1 style="color: #ff4444;">❌ Application Error</h1>
        <pre style="background: #000; padding: 10px; border-radius: 5px;">
${error instanceof Error ? error.message : String(error)}

Stack trace:
${error instanceof Error ? error.stack : 'No stack trace available'}
        </pre>
        <p>Check console for more details (F12)</p>
      </div>
    `;
  }
  