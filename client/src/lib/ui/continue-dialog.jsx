import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/lib/ui/dialog";
import { useNavigate } from "react-router-dom";
import { Button } from "@/lib/ui/button";

export function ContinueDialog({ redirectUrl, isOpen }) {
  const navigate = useNavigate();
  return (
    <Dialog open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Continue?</DialogTitle>
        </DialogHeader>
        <p>
          This phase of the game is over. Click continue to go to the next phase.
        </p>
        <DialogFooter>
          <DialogClose>
            <Button
              onClick={() => {
                navigate(redirectUrl);
              }}
            >
              Continue
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
