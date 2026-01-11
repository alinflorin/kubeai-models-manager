import { useState } from "react";
import {
  Box,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from "./components/Sidebar";
import { Outlet } from "react-router";

export default function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = useState(!isMobile);


  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        width: "100%",
        overflow: "auto",  //hidden
      }}
    >
      <Sidebar
        open={open}
        onToggle={() => setOpen(!open)}
        isMobile={isMobile}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          transition: "margin 0.3s",
          marginLeft: 0,
          marginTop: 0,
          display: "flex",
          height: "100%",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <Box sx={{ width: "100%" }}>
          <IconButton
            sx={{
              display: { xs: "inline-flex", sm: "none" },
              mb: 0,
            }}
            onClick={() => setOpen(!open)}
          >
            <MenuIcon />
          </IconButton>
        </Box>

        <Box
          sx={{
            width: "100%",
            flex: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
