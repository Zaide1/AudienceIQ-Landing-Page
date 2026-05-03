import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import logoImg from "@assets/1Image_May_1,_2026,_03_54_49_PM_1777723358698.png";

/* Warm the browser cache for the AudienceIQ logo before any page mounts so it
   never pops in on first paint or route change. */
const _logoPreload = new Image();
_logoPreload.src = logoImg;

createRoot(document.getElementById("root")!).render(<App />);
