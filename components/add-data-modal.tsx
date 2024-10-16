import * as React from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Text } from "~/components/ui/text";

interface AddDataModalProps {
  open: boolean;
  onYes: () => void;
  setOpen: (v: boolean) => void;
}
function AddDataModal({ open, setOpen, onYes }: AddDataModalProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Initial Data</DialogTitle>
          <DialogDescription>
            Do you want to add some initial data? you can reset it later.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">
              <Text>No</Text>
            </Button>
          </DialogClose>
          <Button onPress={onYes}>
            <Text>Yes</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddDataModal;
