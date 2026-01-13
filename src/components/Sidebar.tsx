import {
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  Drawer,
  Button,
  Hamburger,
} from "@fluentui/react-components";
import { DismissRegular } from "@fluentui/react-icons";
import { useState } from "react";
import { useScreenSize } from "../hooks/useScreenSize";

export default function Sidebar() {
  const isMobile = useScreenSize("xs");
  const [isOpen, setIsOpen] = useState(!isMobile);

  return (
    <>
      {isMobile && (
        <Hamburger
          style={{
            position: 'fixed',
            top: '0',
            left: '0'
          }}
          size="large"
          aria-label="Open"
          onClick={() => setIsOpen(true)}
        />
      )}
      <Drawer
        type={isMobile ? "overlay" : "inline"}
        separator={true}
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
          <p>Drawer content</p>
        </DrawerBody>
      </Drawer>
    </>
  );
}
