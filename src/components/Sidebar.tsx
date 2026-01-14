import {
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  Drawer,
  Button,
  Hamburger,
  Nav,
  NavItem,
} from "@fluentui/react-components";
import {
  DismissRegular,
  HomeRegular,
  PanelLeftRegular,
  SettingsRegular,
} from "@fluentui/react-icons";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useScreenSize } from "../hooks/useScreenSize";

export default function Sidebar() {
  const isMobile = useScreenSize("xs");
  const [isOpen, setIsOpen] = useState(!isMobile);

  const location = useLocation();
  const navigate = useNavigate();

  const onNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {isMobile && (
        <Hamburger
          style={{ position: "fixed", top: 0, left: 0, zIndex: 1000 }}
          size="large"
          aria-label="Open"
          onClick={() => setIsOpen(true)}
        />
      )}

      <Drawer
        type={isMobile ? "overlay" : "inline"}
        separator
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
        size="small"
        open={isOpen || !isMobile}
        onOpenChange={(_, { open }) => setIsOpen(open)}
      >
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              isMobile ? (
                <Button
                  appearance="subtle"
                  aria-label="Close"
                  icon={<DismissRegular />}
                  onClick={() => setIsOpen(false)}
                />
              ) : null
            }
          >
            KMM
          </DrawerHeaderTitle>
        </DrawerHeader>

        <DrawerBody>
          <Nav style={{
            height: '100%'
          }} selectedValue={location.pathname}>
            <NavItem
              value="/"
              icon={<HomeRegular />}
              onClick={() => onNavigate("/")}
            >
              Home
            </NavItem>

            <NavItem
              value="/models"
              icon={<PanelLeftRegular />}
              onClick={() => onNavigate("/models")}
            >
              Models
            </NavItem>

            <NavItem
              value="/settings"
              icon={<SettingsRegular />}
              onClick={() => onNavigate("/settings")}
            >
              Settings
            </NavItem>
          </Nav>
        </DrawerBody>
      </Drawer>
    </>
  );
}
