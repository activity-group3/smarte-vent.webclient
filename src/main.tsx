import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Polyfill (if needed for certain environments)
// import * as process from "process";
// (window as any).global = window;
// (window as any).process = process;
// (window as any).Buffer = [];

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
    <App />
);

// Optional: measure performance
