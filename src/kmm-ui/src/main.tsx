import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./routes/Home.tsx";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "./config/theme.ts";
import NotificationsProvider from "./providers/notifications-provider.tsx";
import { ConfirmProvider } from "./hooks/useConfirmDialog.tsx";
import NotFound from "./routes/NotFound.tsx";

createRoot(document.getElementById("root")!).render(
  <NotificationsProvider>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ConfirmProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<App />}>
              <Route index element={<Home />} />

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ConfirmProvider>
    </ThemeProvider>
  </NotificationsProvider>
);
