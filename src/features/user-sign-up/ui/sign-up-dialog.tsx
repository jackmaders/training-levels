import { Button } from "@/shared/ui/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/shadcn/dialog";

import { SignUpForm } from "./sign-up-form";

export function SignUpDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button />}>Sign up</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign Up</DialogTitle>
          <DialogDescription>
            Create an account to start the Dog Training Levels curriculum
          </DialogDescription>
        </DialogHeader>
        <SignUpForm />
      </DialogContent>
    </Dialog>
  );
}
