import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./routes/Home.tsx";
import NotFound from "./routes/NotFound.tsx";
import {
  FluentProvider,
} from "@fluentui/react-components";
import { kmmLightTheme } from "./config/themes.ts";

createRoot(document.getElementById("root")!).render(
  <FluentProvider theme={kmmLightTheme}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </FluentProvider>
);
