import { useRouteLoaderData } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/lib/ui/dialog";
import { Button } from "@/lib/ui/button";
import { Input } from "@/lib/ui/input";
import { Textarea } from "@/lib/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/lib/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SERVER_URL } from "/src/lib/common/constants.js";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const createLobbySchema = z.object({
  lobbyName: z.string().min(1),
  description: z.string(),
  maxPlayers: z.coerce.number().int().min(1).max(10),
  numGames: z.coerce.number().int().min(1).max(10),
});

export function HomePage() {
  const { user } = useRouteLoaderData("root");

  return (
    <section className="space-y-8">
      {user && (
        <div className="space-x-2 text-center">
          <JoinLobbyModal />
          <CreateLobbyModal />
        </div>
      )}
      {!user && (
        <p className="text-center text-lg">Login to join or create a lobby</p>
      )}
    </section>
  );
}

function JoinLobbyModal() {
  const form = useForm({
    resolver: zodResolver(z.object({ lobbyId: z.string().min(1) })),
    defaultValues: {
      lobbyId: "",
    },
  });
  const navigate = useNavigate();
  const handleSubmit = form.handleSubmit(async (values) => {
    navigate(`/${values.lobbyId}/draft-members`);
  });
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-28">Join Lobby</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join Lobby</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-2">
            <FormField
              control={form.control}
              name="lobbyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lobby ID</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button className="mt-4" type="submit">
                Join Lobby
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function CreateLobbyModal() {
  const form = useForm({
    resolver: zodResolver(createLobbySchema),
    defaultValues: {
      lobbyName: "",
      description: "",
      maxPlayers: 10,
      numGames: 5,
    },
  });
  const navigate = useNavigate();
  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      const res = await fetch(SERVER_URL + "/api/lobby", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        toast("Unable to create lobby");
        return;
      }
      const lobby = await res.json();
      // redirect to inside the lobby
      navigate(`/${lobby._id}/draft-members`);
    } catch (err) {
      toast("Unable to create lobby");
    }
  });
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create Lobby</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="w-28">Create Lobby</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-2">
            <FormField
              control={form.control}
              name="lobbyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="maxPlayers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="maxPlayers">Max Players</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numGames"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Games</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button className="mt-4" type="submit">
                Create Lobby
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
