import React, { useEffect, useState } from "react";
import { useWebSocket } from "@/lib/websocket/useWebSocket";
import { SERVER_URL } from "/src/lib/common/constants.js";
import { useParams, useLoaderData, Link, useNavigate } from "react-router-dom";

// mui
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { Button } from "@/lib/ui/button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";

// const mockLobby = {
//   teamOne: {
//     captain: [],
//     members: [{ id: "66132ce8e79579329e960e6e", username: "kyl1699" }],
//   },
//   teamTwo: {
//     captain: [],
//     members: [{ id: "66135c4e5e31aaefbe08130c", username: "lyk9473" }],
//   },
//   _id: "66136923c954f8ba9993c505",
//   lobbyName: "lobby bryant2",
//   description: "kobeey",
//   maxPlayers: 4,
//   numGames: 3,
//   isOpen: true,
//   games: [
//     {
//       id: 241,
//       cover: "images.igdb.com/igdb/image/upload/t_1080p/co7ms5.jpg",
//       name: "Counter-Strike",
//       description: "first to 16",
//     },
//     {
//       id: 242408,
//       cover: "images.igdb.com/igdb/image/upload/t_1080p/co7989.jpg",
//       name: "Counter-Strike 2",
//       description: "this and that",
//     },
//     {
//       id: 16957,
//       cover: "images.igdb.com/igdb/image/upload/t_1080p/co7wqu.jpg",
//       name: "Counter-Strike Nexon: Studio",
//     },
//     {
//       id: 152291,
//       cover: "images.igdb.com/igdb/image/upload/t_1080p/co39sk.jpg",
//       name: "Counter Attack",
//     },
//   ],
//   dateCreated: "2024-04-08T03:48:51.778Z",
//   lastUpdated: "2024-04-08T03:49:03.122Z",
//   host: "65fa33d0b39ee489c2a0ad79",
//   __v: 0,
// };

export function GamePage({ ...props }) {
  const navigate = useNavigate();
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [lobbyObj, setLobbyObj] = useState();
  const [teamOneScore, setTeamOneScore] = useState(0);
  const [teamTwoScore, setTeamTwoScore] = useState(0);
  const [result, setResult] = useState();

  const { user } = useLoaderData();
  const { lobbyId } = useParams();

  /* -------------------------------- useEffect ------------------------------- */
  // useEffect(() => {
  //   setLobbyObj(mockLobby);
  // }, []);

  useEffect(() => {
    if (lobbyObj?.teamOne?.score) setTeamOneScore(lobbyObj?.teamOne?.score);
    if (lobbyObj?.teamTwo?.score) setTeamTwoScore(lobbyObj?.teamTwo?.score);

    if (
      lobbyObj?.teamOne?.score !== undefined &&
      lobbyObj?.teamTwo?.score !== undefined
    ) {
      console.log(lobbyObj.teamOne.score + lobbyObj.teamTwo.score);

      setCurrentGameIndex(lobbyObj.teamOne.score + lobbyObj.teamTwo.score);
    }
    console.log(lobbyObj);
  }, [lobbyObj]);

  /* ----------------------------------- ws ----------------------------------- */
  const ws = useWebSocket({
    socketUrl: `ws://localhost:8080?lobby=${lobbyId}`,
    onMessage(e) {
      if (!e.data) {
        return;
      }

      console.log("received", JSON.parse(e.data));

      const { lobbyState, redirectUrl } = JSON.parse(e.data);
      if (redirectUrl) {
        setResult(redirectUrl);
        console.log(redirectUrl);
        const redirectTimeOut = setTimeout(() => navigate("/"), 5000);
        return;
      }

      setLobbyObj(lobbyState);
    },
    onClose() {
      console.log("closed");
    },
  });

  /* --------------------------------- Containers --------------------------------- */
  function winnerScreen() {
    return (
      <div className="flex min-w-60 flex-col justify-start gap-y-3">
        <div className="shadow-l flex flex-col items-center justify-center rounded-lg bg-card p-4">
          <h1 className="mb-5 text-2xl uppercase">{result}</h1>
          <p>Return to main menu in 5 sec</p>
        </div>
      </div>
    );
  }

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
              image={`https://${currentGame.imageUrl}`}
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
              <Button
                variant="team1"
                onClick={() => setGameWinner("teamOne")}
                disabled={user.id !== lobbyObj.host}
              >
                &lt;&lt; Team One Wins
              </Button>
              <Button
                variant="team2"
                onClick={() => setGameWinner("teamTwo")}
                disabled={user.id !== lobbyObj.host}
              >
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
              image={`https://${nextGame.imageUrl}`}
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
    let membersCompeting;
    let showJoinBtn = false;
    let showLeaveBtn = false;
    if (team === "teamOne") {
      label = "Team One";
      members = lobbyObj.teamOne.members;
      membersCompeting = lobbyObj.games[currentGameIndex]?.teamOneCompetitor;
    }
    if (team === "teamTwo") {
      label = "Team Two";
      members = lobbyObj.teamTwo.members;
      membersCompeting = lobbyObj.games[currentGameIndex]?.teamTwoCompetitor;
    }

    // show join button if user is on the team
    members.forEach((member) => {
      if (member.id === user.id) {
        showJoinBtn = true;
      }
    });

    membersCompeting?.forEach((member) => {
      if (member.id === user.id) {
        showLeaveBtn = true;
      }
    });

    return (
      <div className="flex min-w-60 flex-col justify-start gap-y-3">
        <div className="rounded-lg bg-card p-4 shadow-lg">
          <h2 className="mb-2 text-2xl">{label}</h2>
          <h3 className="text-lg">
            Score: {team === "teamOne" ? teamOneScore : teamTwoScore}
          </h3>
          <div className="flex flex-row items-center">
            <h3 className="mr-2">Players Competing</h3>
            {showJoinBtn && !showLeaveBtn && (
              <Chip label="Join" onClick={() => joinGame(team)} />
            )}
            {showLeaveBtn && (
              <Chip label="Leave" onClick={() => leaveGame(team)} />
            )}
          </div>

          {membersCompeting?.map((member, index) => (
            <Stack direction="row">
              <Chip label={member.username} className="mb-1 mr-1" />
            </Stack>
          ))}
          <h3 className="mb-2 mt-4">Member List</h3>
          {getDifference(members, membersCompeting).map((member, index) => (
            <Stack direction="row">
              {<Chip label={member.username} className="mb-1 mr-1" />}
            </Stack>
          ))}
        </div>
      </div>
    );
  }

  /* --------------------------------- Helpers -------------------------------- */
  function joinGame(team) {
    const gameArr = lobbyObj.games;
    if (team === "teamOne") {
      if (gameArr[currentGameIndex].teamOneCompetitor === undefined) {
        gameArr[currentGameIndex].teamOneCompetitor = [user];
      } else {
        gameArr[currentGameIndex].teamOneCompetitor.push(user);
      }
      setLobbyObj({ ...lobbyObj, games: gameArr });
    }
    if (team === "teamTwo") {
      if (gameArr[currentGameIndex].teamTwoCompetitor === undefined) {
        gameArr[currentGameIndex].teamTwoCompetitor = [user];
      } else {
        gameArr[currentGameIndex].teamTwoCompetitor.push(user);
      }
      setLobbyObj({ ...lobbyObj, games: gameArr });
    }

    ws.send(JSON.stringify({ event: "setGameState", data: lobbyObj }));
  }

  function leaveGame(team) {
    const gameArr = lobbyObj.games;
    if (team === "teamOne") {
      let memberIndex;
      gameArr[currentGameIndex].teamOneCompetitor.forEach((member, index) => {
        if (member.id === user.id) memberIndex = index;
      });
      gameArr[currentGameIndex].teamOneCompetitor.splice(memberIndex, 1);
      setLobbyObj({ ...lobbyObj, games: gameArr });
    }
    if (team === "teamTwo") {
      let memberIndex;

      gameArr[currentGameIndex].teamTwoCompetitor.forEach((member, index) => {
        if (member.id === user.id) memberIndex = index;
      });
      gameArr[currentGameIndex].teamTwoCompetitor.splice(memberIndex, 1);
      setLobbyObj({ ...lobbyObj, games: gameArr });
    }

    ws.send(JSON.stringify({ event: "setGameState", data: lobbyObj }));
  }

  function setGameWinner(team) {
    // update score for ws
    let teamOne = lobbyObj.teamOne;
    let teamTwo = lobbyObj.teamTwo;
    teamOne.score = teamOneScore;
    teamTwo.score = teamTwoScore;

    // increment scores locally
    if (team === "teamOne") {
      teamOne.score = teamOneScore + 1;
      setTeamOneScore(teamOneScore + 1);
    }
    if (team === "teamTwo") {
      teamTwo.score = teamTwoScore + 1;
      setTeamTwoScore(teamTwoScore + 1);
    }

    // update lobbyobj game array to have the winner
    let updatedGamesArr = lobbyObj.games;
    updatedGamesArr[currentGameIndex].winnerTeam = team;
    const newLobbyObj = {
      ...lobbyObj,
      teamOne,
      teamTwo,
      games: updatedGamesArr,
    };
    setCurrentGameIndex(currentGameIndex + 1);

    // set the new states
    setLobbyObj(newLobbyObj);

    ws.send(JSON.stringify({ event: "setGameState", data: newLobbyObj }));
  }

  function getDifference(arr1, arr2) {
    if (arr2 === undefined || arr2.length === 0) {
      return arr1;
    }
    return arr1.filter((obj1) => {
      return !arr2.some((obj2) => {
        return obj1.id === obj2.id;
      });
    });
  }

  return (
    <div className="flex min-h-screen flex-row flex-col items-center justify-start gap-x-6 bg-gray-900 p-4 text-white">
      {lobbyObj && !result && (
        <div className="flex gap-x-6">
          <div className="min-w-60">{teamDisplay("teamOne")}</div>
          {gameDisplay()}

          {teamDisplay("teamTwo")}
        </div>
      )}
      {result && winnerScreen()}
    </div>
  );
}
