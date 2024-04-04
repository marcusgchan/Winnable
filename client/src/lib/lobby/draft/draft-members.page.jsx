import { Button } from "@/lib/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/lib/ui/card";
import { useNavigate, useLoaderData, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

// function useWebSocket({ socketUrl, onMessage = () => {}, onClose = () => {} }) {
//   const wsRef = useRef(null);
//   console.log("hook");
//   useEffect(() => {
//     const ws = new WebSocket(socketUrl);
//     ws.onopen = (e) => {
//       onMessage(e);
//     };
//
//     ws.onclose = () => {
//       onClose();
//     };
//
//     ws.onmessage = (e) => {
//       onMessage(e);
//     };
//
//     wsRef.current = ws;
//     return () => {
//       if (ws.readyState === WebSocket.OPEN) {
//         console.log("closing");
//         ws.close(1000);
//       }
//     };
//   }, [socketUrl]);
//
//   return wsRef.current;
// }
//

function useWebSocket({ socketUrl, onMessage = () => {}, onClose = () => {} }) {
  const ws = useMemo(() => new WebSocket(socketUrl), [socketUrl]);

  ws.onclose = () => {
    onClose();
  };

  ws.onmessage = (e) => {
    onMessage(e);
  };

  useEffect(() => {
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close(1000);
      }
    };
  }, [ws]);
  return ws;
}

export function DraftMembersPage() {
  const navigate = useNavigate();
  const { user } = useLoaderData();
  const { lobbyId } = useParams();
  const [lobby, setLobby] = useState(null);
  const ws = useWebSocket({
    socketUrl: `ws://localhost:8080?lobby=${lobbyId}`,
    onMessage(e) {
      if (!e.data) {
        return;
      }

      console.log("received", JSON.parse(e.data));

      const lobbyState = JSON.parse(e.data);
      setLobby(lobbyState);
    },
  });

  function joinTeam(teamNumber) {
    ws.send(JSON.stringify({ event: "joinTeam", data: teamNumber }));
  }

  if (!lobby) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-center text-2xl font-bold ">
        Lobby {lobby.lobbyName}
      </h1>
      <div className="grid gap-2 [grid-template-areas:'btns''team1''team2'] md:grid-cols-[1fr_min-content_1fr] md:[grid-template-areas:'team1_btns_team2']">
        <Card className="flex min-h-96 flex-col [grid-area:team1]">
          <CardHeader>
            <CardTitle>Team 1</CardTitle>
          </CardHeader>
          <CardContent>
            <MemberList members={lobby.teamOne.members} />
          </CardContent>
          <CardFooter className="mt-auto self-center">
            <Button variant="team1" onClick={() => joinTeam(1)}>
              Join Team
            </Button>
          </CardFooter>
        </Card>
        <div className="flex flex-row items-center gap-2 [grid-area:btns] md:flex-col md:items-start">
          <Button>Randomize</Button>
          <Button>Start Game</Button>
          <Button variant="destructive" onClick={() => navigate("/")}>
            Leave Lobby
          </Button>
        </div>
        <Card className="flex min-h-96 flex-col [grid-area:team2]">
          <CardHeader>
            <CardTitle>Team 2</CardTitle>
          </CardHeader>
          <CardContent>
            <MemberList members={lobby.teamTwo.members} />
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

/** @param {{ members: {id: string, username: string}[] }} */
function MemberList({ members }) {
  return (
    <ul className="max-h-80 space-y-2 overflow-y-auto">
      {members.map(({ id, username }) => (
        <li key={id}>
          <Member name={username} />
        </li>
      ))}
    </ul>
  );
}

/** @param {{ name: string }} */
function Member({ name }) {
  return <div className="">{name}</div>;
}
