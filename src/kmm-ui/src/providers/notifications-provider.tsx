import { Close } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { SnackbarKey, SnackbarProvider } from "notistack";
import { PropsWithChildren, useCallback, useRef } from "react";

export default function NotificationsProvider({ children }: PropsWithChildren) {
  const nRef = useRef<SnackbarProvider>(null);

  const onClickDismiss = useCallback((k: SnackbarKey) => {
    nRef.current?.closeSnackbar(k);
  }, [nRef]);

  return (
    <SnackbarProvider
      autoHideDuration={5000}
      ref={nRef}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      action={(k) => (
        <IconButton
          size="small"
          aria-label="close"
          color="inherit"
          onClick={() => onClickDismiss(k)}
        >
          <Close fontSize="small" />
        </IconButton>
      )}
    >
      {children}
    </SnackbarProvider>
  );
}
