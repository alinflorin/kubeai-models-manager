import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./routes/Home.tsx";
import NotFound from "./routes/NotFound.tsx";
import {
  FluentProvider,
  webLightTheme,
} from "@fluentui/react-components";

createRoot(document.getElementById("root")!).render(
  <FluentProvider theme={webLightTheme}>
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
