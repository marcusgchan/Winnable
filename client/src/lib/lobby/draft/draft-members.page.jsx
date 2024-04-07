import { Button } from "@/lib/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/lib/ui/card";
import { useNavigate, useLoaderData, useParams } from "react-router-dom";
import { useState } from "react";
import { useWebSocket } from "@/lib/websocket/useWebSocket";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/lib/ui/tooltip";
import { Minus } from "lucide-react";
import { ContinueDialog } from "@/lib/ui/continue-dialog";

export function DraftMembersPage() {
  const navigate = useNavigate();
  const { user } = useLoaderData();
  const { lobbyId } = useParams();
  const [lobby, setLobby] = useState(null);
  const [isContinueDialogOpen, setIsContinueDialogOpen] = useState(false)
  const ws = useWebSocket({
    socketUrl: `ws://localhost:8080?lobby=${lobbyId}`,
    onMessage(e) {
      if (!e.data) {
        return;
      }

      console.log("received", JSON.parse(e.data));

      const { lobbyState, redirectUrl } = JSON.parse(e.data);
      if (redirectUrl) {
        navigate('/', { replace: true });
        return;
      }
      setLobby(lobbyState);
    },
    onClose() {
      if (lobby) {
        navigate("/");
      }
    },
  });
  const [tooltip, setTooltip] = useState(false);
  function handleTooltip(isOpen) {
    if (
      isOpen &&
      (lobby.teamOne.members.length == 0 ||
        lobby.teamTwo.members.length == 0 ||
        user.id !== lobby.host)
    ) {
      setTooltip(true);
      return;
    }
    setTooltip(false);
  }

  function joinTeam(teamNumber) {
    ws.send(JSON.stringify({ event: "joinTeam", data: teamNumber }));
  }

  function handleKick(id) {
    ws.send(JSON.stringify({ event: "kickPlayer", data: id }));
  }

  function handleStartGame() {
    ws.send(JSON.stringify({ event: "endTeamDraft" }));
    const navigateLink = `/6612dd03aa3cc8e6f1377254/draft-games/`;
    navigate(navigateLink, { replace: true });
    console.log('NAVIGATEINGINSDA')
  }

  if (!lobby) return <div>Lobby doesn&apos;t exist</div>;

  if (!user) {
    <p>Login to join a lobby</p>;
  }

  return (
    <div className="space-y-6">
      <ContinueDialog redirectUrl={`${lobbyId}/draft-games`} isOpen={isContinueDialogOpen} />
      <h1 className="text-center text-2xl font-bold ">
        Lobby {lobby.lobbyName}
      </h1>
      <div className="grid gap-2 [grid-template-areas:'btns''team1''team2'] md:grid-cols-[1fr_min-content_1fr] md:[grid-template-areas:'team1_btns_team2']">
        <Card className="flex min-h-96 flex-col [grid-area:team1]">
          <CardHeader>
            <CardTitle>Team 1</CardTitle>
          </CardHeader>
          <CardContent>
            <MemberList members={lobby.teamOne.members}>
              {({ id, username }) => (
                <div className="flex justify-between">
                  <span>{username}</span>
                  {lobby.host === user.id && lobby.host !== id && (
                    <button onClick={() => handleKick(id)}>
                      <Minus />
                    </button>
                  )}
                </div>
              )}
            </MemberList>
          </CardContent>
          <CardFooter className="mt-auto self-center">
            <Button variant="team1" onClick={() => joinTeam(1)}>
              Join Team
            </Button>
          </CardFooter>
        </Card>
        <div className="flex flex-row items-center gap-2 [grid-area:btns] md:flex-col md:items-start">
          <Button>Randomize</Button>
          <TooltipProvider delayDuration={300}>
            <Tooltip open={tooltip} onOpenChange={handleTooltip}>
              <TooltipTrigger asChild tabIndex={0}>
                <span>
                  <Button
                    className="md:w-full"
                    disabled={
                      user.id !== lobby.host ||
                      lobby.teamOne.members.length === 0 ||
                      lobby.teamTwo.members.length === 0
                    }
                    onClick={() => handleStartGame()}
                  >
                    Start Game
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent className="space-y-2">
                {user.id !== lobby.host && (
                  <p>Only the host can start the game</p>
                )}
                {(lobby.teamOne.members.length === 0 ||
                  lobby.teamTwo.members.length === 0) && (
                  <p>Each team must have at least one player</p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button variant="destructive" onClick={() => navigate("/")}>
            Leave Lobby
          </Button>
        </div>
        <Card className="flex min-h-96 flex-col [grid-area:team2]">
          <CardHeader>
            <CardTitle>Team 2</CardTitle>
          </CardHeader>
          <CardContent>
            <MemberList members={lobby.teamTwo.members}>
              {({ id, username }) => (
                <div className="flex justify-between">
                  <span>{username}</span>
                  {lobby.host === user.id && lobby.host !== id && (
                    <button onClick={() => handleKick(id)}>
                      <Minus />
                    </button>
                  )}
                </div>
              )}
            </MemberList>
          </CardContent>
          <CardFooter className="mt-auto self-center">
            <Button variant="team2" onClick={() => joinTeam(2)}>
              Join Team
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

/** @param {{ members: {id: string, username: string}[], children: ({ id, username }: { id: string, username: string }) => React.ReactNode }} */
function MemberList({ members, children }) {
  return (
    <ul className="max-h-80 space-y-2 overflow-y-auto">
      {members.map((member) => (
        <li key={member.id}>{children(member)}</li>
      ))}
    </ul>
  );
}
