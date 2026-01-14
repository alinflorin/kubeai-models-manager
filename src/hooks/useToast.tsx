import {
  useToastController,
  Toast,
  ToastTitle,
  ToastBody,
  type ToastIntent,
  Button,
  ToastTrigger,
} from "@fluentui/react-components";
import { DismissRegular } from "@fluentui/react-icons";
import { useCallback } from "react";

export default function useToast() {
  const { dispatchToast } = useToastController("main");

  const show = useCallback(
    (
      message: string,
      type: ToastIntent = "info",
      title: string | undefined = undefined
    ) => {
      dispatchToast(
        <Toast>
          <ToastTitle
            action={
              <ToastTrigger>
                <Button
                  appearance="subtle"
                  aria-label="Close"
                  icon={<DismissRegular />}
                />
              </ToastTrigger>
            }
          >
            {title || type.toUpperCase()}
          </ToastTitle>
          <ToastBody>{message}</ToastBody>
        </Toast>,
        {
          intent: type,
          timeout: 5000,
          pauseOnHover: true,
          pauseOnWindowBlur: true,
          position: "bottom-end",
        }
      );
    },
    [dispatchToast]
  );

  return show;
}
