import { Outlet } from "react-router";
import Sidebar from "./components/Sidebar";
import { Toaster } from "@fluentui/react-components";

export default function App() {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        position: "relative",
      }}
    >
      <Sidebar />
      <div
        style={{
          flex: "1 1 auto",
          minHeight: "0",
          padding: "1rem",
          overflow: "auto",
        }}
      >
        <Outlet />
      </div>
      <Toaster toasterId="main" />
    </div>
  );
}
