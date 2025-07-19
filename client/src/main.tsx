import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
// Removed server-side route import and usage

createRoot(document.getElementById("root")!).render(<App />);
