import { StrictOmit } from "@/lib/types";
import * as React from "react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Text } from "~/components/ui/text";

interface PromptModalProps {
  open: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  setOpen: (v: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  hideCancelBtn?: boolean;
}

export function PromptModal({
  open,
  onCancel,
  onConfirm,
  setOpen,
  title,
  description,
  confirmText,
  cancelText,
  hideCancelBtn,
}: PromptModalProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <DialogFooter className="flex-row gap-4 justify-end items-end">
          {!hideCancelBtn && (
            <Button variant="secondary" onPress={onCancel ? onCancel : () => setOpen(false)}>
              <Text>{cancelText ? cancelText : "Cancel"}</Text>
            </Button>
          )}

          <Button onPress={onConfirm ? onConfirm : () => setOpen(false)}>
            <Text>{confirmText ? confirmText : "Confirm"}</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface UsePromptModalProps extends StrictOmit<PromptModalProps, "open" | "setOpen"> {
  open?: boolean;
}
export const usePromptModal = ({ open: isOpenProp, ...restProps }: UsePromptModalProps) => {
  const [open, setOpen] = useState(isOpenProp || false);

  const Modal = () => <PromptModal open={open} setOpen={setOpen} {...restProps} />;

  return {
    Modal,
    openModal: () => setOpen(true),
    closeModal: () => setOpen(false),
    isModalOpen: open,
  };
};
