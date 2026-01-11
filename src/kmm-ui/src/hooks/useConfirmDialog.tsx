import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

type ConfirmOptions = {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
};

type ConfirmContextType = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export const useConfirm = (): ConfirmContextType => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
};

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});
  const [resolver, setResolver] = useState<(result: boolean) => void>();

  const confirm = (opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setOpen(true);
    return new Promise((resolve) => setResolver(() => resolve));
  };

  const handleClose = (result: boolean) => {
    setOpen(false);
    resolver?.(result);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {/* The dialog is rendered once here */}
      <Dialog open={open} onClose={() => handleClose(false)}>
        <DialogTitle>{options.title ?? "Confirm"}</DialogTitle>
        <DialogContent>
          <Typography>{options.message ?? "Are you sure?"}</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => handleClose(false)}
            color="inherit"
            variant="outlined"
          >
            {options.cancelText ?? "No"}
          </Button>
          <Button
            onClick={() => handleClose(true)}
            color="primary"
            variant="contained"
          >
            {options.confirmText ?? "Yes"}
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmContext.Provider>
  );
};
