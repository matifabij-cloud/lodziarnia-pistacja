import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import LodziarniaPistacja from "./LodziarniaPistacja";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LodziarniaPistacja />
  </StrictMode>
);

// Sygnał dla auto-naprawy w index.html: aplikacja zamontowała się poprawnie.
declare global {
  interface Window {
    __APP_MOUNTED__?: boolean;
  }
}
window.__APP_MOUNTED__ = true;
sessionStorage.removeItem("pistacja_reloaded");
