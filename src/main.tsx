import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

document.getElementById("app-loading")?.remove();
createRoot(document.getElementById("root")!).render(<App />);
