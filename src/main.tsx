import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import LodziarniaPistacja from "./LodziarniaPistacja";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LodziarniaPistacja />
  </StrictMode>
);
