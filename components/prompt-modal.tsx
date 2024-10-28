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
  onConfirm: () => void;
  onCancel?: () => void;
  setOpen: (v: boolean) => void;
  title: string;
  description?: string;
}

export function PromptModal({
  open,
  onCancel,
  onConfirm,
  setOpen,
  title,
  description,
}: PromptModalProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <DialogFooter className="flex-row gap-4 justify-end items-end">
          <Button variant="secondary" onPress={onCancel ? onCancel : () => setOpen(false)}>
            <Text>Cancel</Text>
          </Button>

          <Button onPress={onConfirm}>
            <Text>Confirm</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface UsePromptModalProps {
  onConfirm: () => void;
  onCancel?: () => void;
  title: string;
  description?: string;
}
export const usePromptModal = ({
  title,
  description,
  onConfirm,
  onCancel,
}: UsePromptModalProps) => {
  const [open, setOpen] = useState(false);

  const Modal = () => (
    <PromptModal
      title={title}
      description={description}
      open={open}
      setOpen={setOpen}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );

  return {
    Modal,
    openModal: () => setOpen(true),
    closeModal: () => setOpen(false),
    isModalOpen: open,
  };
};
