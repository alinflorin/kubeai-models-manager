import { Outlet } from "react-router";
import Sidebar from "./components/Sidebar";

export default function App() {
  return <div style={{
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    position: 'relative',
  }}>
    <Sidebar />
    <div style={{
      flex: '1 1 auto',
      minHeight: '0',
      padding: '1rem',
      overflow: 'auto'
    }}>
      <Outlet />
    </div>
  </div>
}