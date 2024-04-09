import { Button } from "@/lib/ui/button";
import { Input } from "@/lib/ui/input";
import { Textarea } from "@/lib/ui/textarea";
import { ScrollArea, ScrollBar } from "@/lib/ui/scrollarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/lib/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/lib/ui/dialog";
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
import React, { useState, useEffect } from "react";
import { SERVER_URL } from "/src/lib/common/constants.js";
import { useWebSocket } from "@/lib/websocket/useWebSocket";
import { useParams, useLoaderData, Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const createGameSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  imageUrl: z.string().min(1),
  description: z.string().min(1),
});

export function DraftGamesPage() {
  const navigate = useNavigate();
  const { user } = useLoaderData();
  const selectGameForm = useForm({
    resolver: zodResolver(createGameSchema),
    defaultValues: {
      id: "",
      name: "",
      imageUrl: "",
      description: "",
    },
  });
  const [lobby, setLobby] = useState(null);
  const { lobbyId } = useParams();
  const ws = useWebSocket({
    socketUrl: `ws://localhost:8080?lobby=${lobbyId}`,
    onMessage(e) {
      if (!e.data) {
        return;
      }

      // console.log("received", JSON.parse(e.data));

      const { lobbyState, redirectUrl } = JSON.parse(e.data);
      lobbyState.pickingPlayerId =
        lobbyState.pickingPlayerId || lobbyState.host;
      // console.log("pickingPlayerId", lobbyState.pickingPlayerId);
      if (redirectUrl) {
        navigate(redirectUrl, { replace: true });
        return;
      }
      setLobby(lobbyState);
    },
    onClose() {
      console.log("closed");
    },
  });

  const handleSubmitGameForm = selectGameForm.handleSubmit(async (values) => {
    selectGameForm.reset();
    addGame(values);
  });

  function addGame(game) {
    // console.log("Adding Game", game);
    ws.send(JSON.stringify({ event: "addGame", data: game }));
  }

  function startGame() {
    // console.log("Game Draft Ended");
    ws.send(JSON.stringify({ event: "endGameDraft" }));
  }

  if (!user) {
    <p>Login to join a lobby</p>;
  }

  if (!lobby) return <div>Loading...</div>;

  if (lobby.isOpen === true)
    return (
      <div>
        Team Draft has not ended.{" "}
        <Link className='text-team2 underline decoration-team2' to={`/${lobbyId}/draft-members`}>
          Go back to Team Draft
        </Link>
      </div>
    );

  if (lobby.teamOne.score + lobby.teamTwo.score >= lobby.games.length) return <div>This game has ended already! <Link className='text-team2 underline decoration-team2' to='/'>Go to main page</Link></div>

  return (
    <div className="flex flex-col space-y-16 bg-card bg-gray-900 p-4">
      <div className="flex flex-1">
        {/* Sidebar for game search */}
        <div className="w-1/4 space-y-2 p-2">
          <Form {...selectGameForm}>
            <form onSubmit={handleSubmitGameForm} className="space-y-2">
              {selectGameForm.watch("name") && (
                <div className="flex flex-row items-center gap-2">
                  <img
                    src={`https://${selectGameForm.getValues("imageUrl")}`}
                    alt={selectGameForm.getValues("name")}
                    className="h-24 w-24 rounded-sm"
                  />
                  <div className="font-semibold">
                    {selectGameForm.getValues("name")}
                  </div>
                </div>
              )}
              <SearchGameModal selectGameForm={selectGameForm} />
              <FormField
                control={selectGameForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Description/Rules"
                        className="h-52 bg-gray-800"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={(lobby.pickingPlayerId !== user.id) || lobby.numGames <= lobby.games.length}
              >
                Add Game
              </Button>
            </form>
          </Form>
        </div>

        {/* Selected games and members list */}
        <div className="flex w-3/4 flex-1 flex-col p-2 md:flex-row">
          <Card className="w-1/2">
            <CardHeader className="flex flex-row items-center justify-between p-4">
              <CardTitle className="text-lg">Selected Games</CardTitle>
              <span className="text-sm">
                {lobby.games.length}/{lobby.numGames}
              </span>
            </CardHeader>
            <CardContent>
              <SelectedGames games={lobby?.games} />
            </CardContent>
          </Card>

          {/* Members list */}
          <div className="mx-2 flex w-1/2 flex-col gap-2">
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-lg">Team 1</CardTitle>
              </CardHeader>
              <CardContent>
                <MembersList
                  members={lobby?.teamOne.members}
                  pickingPlayerId={lobby.pickingPlayerId}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-lg">Team 2</CardTitle>
              </CardHeader>
              <CardContent>
                <MembersList
                  members={lobby?.teamTwo.members}
                  pickingPlayerId={lobby.pickingPlayerId}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Start button */}
      <div className="text-center">
        <Button
          disabled={user.id !== lobby.host || lobby.games.length === 0}
          onClick={() => startGame()}
        >
          START
        </Button>
      </div>
    </div>
  );
}

function SearchGameModal({ selectGameForm }) {
  const searchGameForm = useForm({
    resolver: zodResolver(z.object({ gameName: z.string().min(1) })),
    defaultValues: {
      gameName: "",
    },
  });
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const [games, setGames] = useState([]);
  const handleSubmit = searchGameForm.handleSubmit(async (values) => {
    try {
      setIsLoadingGames(true);
      const res = await fetch(
        `${SERVER_URL}/api/game/search-games/${values.gameName}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      const data = await res.json();
      setGames(data);
      setTimeout(() => setIsLoadingGames(false), 3000);
      // console.log("data", data);
    } catch (err) {
      toast("No games found");
    }
  });
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Search Game</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="w-28">Search Game</DialogTitle>
        </DialogHeader>
        <Form {...searchGameForm}>
          <form onSubmit={handleSubmit} className="space-y-2">
            <FormField
              control={searchGameForm.control}
              name="gameName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Game Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Search Game</Button>
          </form>
        </Form>
        <h3>Search Results</h3>
        {isLoadingGames && <div>Loading...</div>}
        {games?.length > 0 && !isLoadingGames && (
          <ScrollArea className="h-72">
            {games.map((game) => (
              <div
                key={game.id}
                className="flex w-11/12 flex-row items-center justify-between gap-2"
              >
                <div className="flex flex-row items-center justify-between gap-2">
                  <img
                    src={`https://${game.cover}`}
                    alt={game.name}
                    className="h-12 w-12"
                  />
                  <div className="text-sm">{game.name}</div>
                </div>
                <DialogClose>
                  <Button
                    variant={
                      selectGameForm.getValues("id") === game.id
                        ? "outline"
                        : ""
                    }
                    onClick={() => {
                      selectGameForm.setValue("id", game.id);
                      selectGameForm.setValue("name", game.name);
                      selectGameForm.setValue("imageUrl", game.cover);
                      setIsLoadingGames(true);
                      setTimeout(() => setIsLoadingGames(false), 100);
                    }}
                  >
                    {selectGameForm.getValues("id") === game.id
                      ? "Selected"
                      : "Select"}
                  </Button>
                </DialogClose>
              </div>
            ))}
            <ScrollBar />
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** @param {{ games: {id: string, name: string}[] }} */
function SelectedGames({ games }) {
  return (
    <div className="mb-4 flex flex-wrap rounded bg-gray-800 p-2">
      {games?.map((game) => {
        return (
          <div
            key={game.id}
            className="m-1 flex items-center justify-center rounded bg-gray-900 px-2"
          >
            {game.name}
          </div>
        );
      })}
      {/* More game slots */}
    </div>
  );
}

/** @param {{ members: {id: string, username: string}[] }} */
function MembersList({ members, pickingPlayerId }) {
  return (
    <ul className="max-h-80 space-y-2 overflow-y-auto">
      {members?.map(({ id, username }) => (
        <li key={id} className="flex flex-row items-center gap-1">
          {pickingPlayerId === id ? (
            <span className="m-0 flex items-center justify-center rounded border-2 border-team2 px-1">
              {username}'s turn
            </span>
          ) : (
            <Member name={username} />
          )}
        </li>
      ))}
    </ul>
  );
}

/** @param {{ name: string }} */
function Member({ name }) {
  return <div className="">{name}</div>;
}
