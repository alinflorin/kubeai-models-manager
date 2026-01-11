import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  Home,
} from "@mui/icons-material";
import { Link } from "react-router";
import { version } from "../version";

const drawerWidth = 240;

type SlideProps = {
  open: boolean;
  onToggle: () => void;
  isMobile: boolean;
};

export default function Sidebar({ open, onToggle, isMobile }: SlideProps) {
  const drawerContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: open ? drawerWidth : 64,
        transition: "width 0.3s",
        overflowX: "hidden",
      }}
    >
      <Box
        sx={{
          flex: "auto",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: open ? "space-between" : "center",
            p: 1,
          }}
        >
          {open && <span>kmm {version}</span>}
          <IconButton onClick={onToggle}>
            {open ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        </Box>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/">
              <ListItemIcon>
                <Home />
              </ListItemIcon>
              {open && <ListItemText primary="Home" />}
            </ListItemButton>
          </ListItem>
         
        </List>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onToggle}
        ModalProps={{ keepMounted: true }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      open
      sx={{
        width: open ? drawerWidth : 64,
        flexShrink: 0,
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
