import React from "react";
import ReactDOM from "react-dom/client";
import { SharingDemo } from "./SharingDemo";
import "./src/index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <SharingDemo />
  </React.StrictMode>
);
