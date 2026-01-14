import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
} from "@fluentui/react-components";

type ConfirmOptions = {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
};

type ConfirmContextType = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmContextType | null>(null);

function useConfirm(): ConfirmContextType {
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

      <Dialog modalType="modal" open={open} onOpenChange={(_, data) => {
        if (!data.open) {
            handleClose(false);
        }
      }}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{options.title ?? "Confirm"}</DialogTitle>
            <DialogContent>{options.message ?? "Are you sure?"}</DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary" onClick={() => handleClose(false)}>
                  {options.cancelText ?? "No"}
                </Button>
              </DialogTrigger>
              <Button appearance="primary" onClick={() => handleClose(true)}>
                {options.confirmText ?? "Yes"}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </ConfirmContext.Provider>
  );
};

export default useConfirm;