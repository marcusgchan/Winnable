import React, { useEffect, useState } from "react";
import { useWebSocket } from "@/lib/websocket/useWebSocket";
import { SERVER_URL } from "/src/lib/common/constants.js";
import { useParams, useLoaderData, Link } from "react-router-dom";

// mui
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { Button } from "@/lib/ui/button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";

const mockLobby = {
  teamOne: {
    captain: [],
    members: [{ id: "66132ce8e79579329e960e6e", username: "kyl1699" }],
  },
  teamTwo: {
    captain: [],
    members: [{ id: "66135c4e5e31aaefbe08130c", username: "lyk9473" }],
  },
  _id: "66136923c954f8ba9993c505",
  lobbyName: "lobby bryant2",
  description: "kobeey",
  maxPlayers: 4,
  numGames: 3,
  isOpen: true,
  games: [
    {
      id: 241,
      cover: "images.igdb.com/igdb/image/upload/t_1080p/co7ms5.jpg",
      name: "Counter-Strike",
      description: "first to 16",
    },
    {
      id: 242408,
      cover: "images.igdb.com/igdb/image/upload/t_1080p/co7989.jpg",
      name: "Counter-Strike 2",
      description: "this and that",
    },
    {
      id: 16957,
      cover: "images.igdb.com/igdb/image/upload/t_1080p/co7wqu.jpg",
      name: "Counter-Strike Nexon: Studio",
    },
    {
      id: 152291,
      cover: "images.igdb.com/igdb/image/upload/t_1080p/co39sk.jpg",
      name: "Counter Attack",
    },
  ],
  dateCreated: "2024-04-08T03:48:51.778Z",
  lastUpdated: "2024-04-08T03:49:03.122Z",
  host: "65fa33d0b39ee489c2a0ad79",
  __v: 0,
};

export function GamePage({ ...props }) {
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [lobbyObj, setLobbyObj] = useState();
  const [teamOneScore, setTeamOneScore] = useState(0);
  const [teamTwoScore, setTeamTwoScore] = useState(0);

  const { user } = useLoaderData();
  const { lobbyId } = useParams();

  /* -------------------------------- useEffect ------------------------------- */
  useEffect(() => {
    setLobbyObj(mockLobby);
  }, []);

  useEffect(() => {
    console.log(lobbyObj);
  }, [lobbyObj]);

  /* ----------------------------------- ws ----------------------------------- */
  // const ws = useWebSocket({
  //   socketUrl: `ws://localhost:8080?lobby=${lobbyId}`,
  //   onMessage(e) {
  //     if (!e.data) {
  //       return;
  //     }

  //     console.log("received", JSON.parse(e.data));

  //     const { lobbyState, redirectUrl } = JSON.parse(e.data);
  //     if (redirectUrl) {
  //       console.log(redirectUrl);
  //     }
  //     setLobbyObj(lobbyState);
  //   },
  //   onClose() {
  //     console.log("closed");
  //   },
  // });

  /* --------------------------------- Containers --------------------------------- */
  function gameDisplay() {
    const gameArr = lobbyObj.games;
    const currentGame = gameArr[currentGameIndex];
    const nextGame = gameArr[currentGameIndex + 1];

    return (
      <div className="flex flex-col gap-y-2">
        {currentGame && (
          <Card>
            <CardMedia
              component="img"
              alt={currentGame.name}
              height="140"
              image={`https://${currentGame.cover}`}
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                {currentGame.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentGame.description}
              </Typography>
            </CardContent>
            <CardActions className="flex justify-between">
              <Button variant="team1" onClick={() => setGameWinner("teamOne")}>
                &lt;&lt; Team One Wins
              </Button>
              <Button variant="team2" onClick={() => setGameWinner("teamTwo")}>
                Team Two Wins &gt;&gt;
              </Button>
            </CardActions>
          </Card>
        )}
        {nextGame && (
          <Card>
            <CardMedia
              component="img"
              alt={nextGame.name}
              height="140"
              image={`https://${nextGame.cover}`}
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                {nextGame.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {nextGame.description}
              </Typography>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // team is either "teamOne" or "teamTwo"
  function teamDisplay(team) {
    let members;
    let label;
    if (team === "teamOne") {
      label = "Team One";
      members = lobbyObj.teamOne.members;
    }
    if (team === "teamTwo") {
      label = "Team Two";
      members = lobbyObj.teamTwo.members;
    }

    return (
      <div className="flex min-w-60 flex-col justify-start gap-y-3">
        <div className="rounded-lg bg-card p-4 shadow-lg">
          <h2 className="mb-2 text-2xl">{label}</h2>
          <h3 className="text-lg">
            Score: {team === "teamOne" ? teamOneScore : teamTwoScore}
          </h3>
          <h3 className="mb-2 mt-4">Players Competing</h3>
          {members.map((member, index) => (
            <Stack direction="row">
              <Chip label={member.username} className="mb-1 mr-1" />
            </Stack>
          ))}
          <h3 className="mb-2 mt-4">Member List</h3>
          {members.map((member, index) => (
            <Stack direction="row">
              <Chip label={member.username} className="mb-1 mr-1" />
            </Stack>
          ))}
        </div>
      </div>
    );
  }

  /* --------------------------------- Helpers -------------------------------- */
  function setGameWinner(team) {
    // increment scores
    if (team === "teamOne") setTeamOneScore(teamOneScore + 1);
    if (team === "teamTwo") setTeamTwoScore(teamTwoScore + 1);

    // update lobbyobj game array to have the winner
    let updatedGamesArr = lobbyObj.games;
    updatedGamesArr[currentGameIndex].winnerTeam = team;
    const newLobbyObj = { ...lobbyObj, games: updatedGamesArr };

    // set the new states
    setLobbyObj(newLobbyObj);
    setCurrentGameIndex(currentGameIndex + 1);

    ws.send(JSON.stringify({ event: "setGameState", data: lobbyObj }));
  }

  return (
    <div className="flex min-h-screen flex-row flex-col items-center justify-start gap-x-6 bg-gray-900 p-4 text-white">
      {lobbyObj && (
        <div className="flex gap-x-6">
          <div className="min-w-60">{teamDisplay("teamOne")}</div>
          {gameDisplay()}

          {teamDisplay("teamTwo")}
        </div>
      )}
    </div>
  );
}
