import { Card, CardContent, CardHeader, CardTitle } from "@/lib/ui/card";
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

const createLobbySchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  maxPlayers: z.coerce.number().int().min(1).max(10),
  numGames: z.coerce.number().int().min(1).max(10),
});

export function HomePage() {
  return (
    <section className="space-y-8">
      <Card className="max-h-[500px] min-h-80 overflow-y-auto">
        <CardHeader>
          <CardTitle>Lobby</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex justify-between">
              <span>Lobby 1</span>
              <span>3/10</span>
            </li>
            <li className="flex justify-between">
              <span>Lobby 1</span>
              <span>3/10</span>
            </li>
          </ul>
        </CardContent>
      </Card>
      <div className="text-center">
        <CreateLobbyModal />
      </div>
    </section>
  );
}

function CreateLobbyModal() {
  const form = useForm({
    resolver: zodResolver(createLobbySchema),
    defaultValues: {
      name: "",
      description: "",
      maxPlayers: 10,
      numGames: 5,
    },
  });
  const handleSubmit = form.handleSubmit((values) => {
    console.log(values);
  });
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create Lobby</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Lobby</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-2">
            <FormField
              control={form.control}
              name="name"
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
