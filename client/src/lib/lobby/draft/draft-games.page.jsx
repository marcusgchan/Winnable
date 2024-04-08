import { Button } from "@/lib/ui/button";
import { Input } from "@/lib/ui/input";
import { Textarea } from "@/lib/ui/textarea";
import { SERVER_URL } from "/src/lib/common/constants.js";
import React, { useEffect, useState } from "react";
import axios from "axios";

// mui
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { debounce } from "@mui/material/utils";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";

export function DraftGamesPage() {
  // lobby obj
  const [lobbyObj, setLobbyObj] = useState({});
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  // Currently selected game
  const [selectedGame, setSelectedGame] = useState({});
  const [selectedGameDescription, setSelectedGameDescription] = useState("");
  // List of all the games selecte
  const [selectedGames, setSelectedGames] = useState([]);
  const [isStartBtnAvailable, setIsStartBtnAvailable] = useState(false);

  /* -------------------------------- useEffect ------------------------------- */
  useEffect(() => {
    let didCancel = false;

    const lobbyId = window.location.href.split("/")[3];
    async function fetchLobbyState() {
      const lobbyState = await axios.get(`${SERVER_URL}/api/lobby/${lobbyId}`);
      setLobbyObj(lobbyState.data);
      return lobbyState.data;
    }

    if (!didCancel) {
      fetchLobbyState();
    }

    return () => (didCancel = true);
  }, []);

  useEffect(() => {
    if (selectedGames.length === lobbyObj.numGames) {
      setIsStartBtnAvailable(true);
    }
    console.log(selectedGames);
  }, [selectedGames]);

  /* ---------------------------------- debug --------------------------------- */
  useEffect(() => {
    console.log(lobbyObj);
  }, [lobbyObj]);

  /* --------------------------------- Helpers -------------------------------- */
  async function searchGame(searchString) {
    // Change this fam
    const GAME_INFO_SERVER_URL = "http://localhost:8081";
    const results = await axios.post(`${GAME_INFO_SERVER_URL}/game-list`, {
      searchString: searchString,
    });
    setSearchResults(results.data);
  }

  // stagger search by a sec
  const handleInputChange = debounce((event, value) => {
    searchGame(value);
  }, 1000); // 1000ms delay

  // Add game to the selected list
  function addGameToList(game, description) {
    const gameObj = {
      id: game.id,
      name: game.name,
      imageUrl: game.cover,
      description,
      // selectedBy:
    };
    setSelectedGames([...selectedGames, gameObj]);
  }

  function startGame() {}

  return (
    <div className="flex flex-col space-y-16 bg-card bg-gray-900 p-4">
      <div className="flex flex-1">
        {/* Sidebar for game search */}
        <div className="w-1/4 space-y-2 p-2">
          <Autocomplete
            disablePortal
            id="combo-box-demo"
            getOptionLabel={(option) => option.name}
            options={searchResults}
            renderInput={(params) => <TextField {...params} label="Games" />}
            onInputChange={handleInputChange}
            onChange={(event, newValue) => {
              if (newValue) {
                setSelectedGame(newValue);
              }
            }}
          />
          {/* description */}
          <Textarea
            placeholder="Description/Rules"
            className="h-52 bg-gray-800"
            onChange={(event) => {
              setSelectedGameDescription(event.target.value);
            }}
          ></Textarea>
          <button
            className="w-full rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
            onClick={() => {
              addGameToList(selectedGame, selectedGameDescription);
            }}
          >
            Confirm
          </button>
        </div>

        {/* Selected games and members list */}
        <div className="flex flex-1 flex-col p-2 md:flex-row">
          <div className="m-2 flex-1">
            <h2 className="mb-2 rounded bg-gray-800 p-2 text-lg font-semibold">
              Selected Games
            </h2>
            <div className="mb-2 flex items-center justify-between rounded bg-gray-800 p-2">
              <h3>Games Team 1</h3>
              <span className="text-sm">
                {Math.ceil(selectedGames.length / 2)}/
                {Math.ceil(lobbyObj.numGames / 2)}
              </span>
            </div>
            {/* Placeholder for selected games for Team 1 */}
            <div className="mb-4 flex flex-wrap rounded bg-gray-800 p-2">
              {/* Mockup of game slots */}
              {selectedGames.map((game, index) => {
                if (index % 2 === 0) {
                  return (
                    <div className="m-1 flex items-center justify-center rounded bg-team1 p-2">
                      {game.name}
                    </div>
                  );
                }
              })}

              {/* More game slots */}
            </div>

            <div className="mb-2 flex items-center justify-between rounded bg-gray-800 p-2">
              <h3>Games Team 2</h3>
              <span className="text-sm">
                {Math.floor(selectedGames.length / 2)}/
                {Math.floor(lobbyObj.numGames / 2)}
              </span>
            </div>
            {/* Placeholder for selected games for Team 2 */}
            <div className="mb-4 flex flex-wrap rounded bg-gray-800 p-2">
              {selectedGames.map((game, index) => {
                if (index % 2 !== 0) {
                  return (
                    <div className="m-1 flex items-center justify-center rounded bg-team1 p-2">
                      {game.name}
                    </div>
                  );
                }
              })}
            </div>
          </div>

          {/* Members list */}
          <div className="m-2 max-w-72 flex-1">
            <div className="rounded bg-gray-800 p-2 shadow">
              <h2 className=" text-lg font-semibold">Team 1 Member list</h2>
              <Stack
                direction="row"
                className="flex-1 flex-wrap gap-x-1 gap-y-1 "
              >
                <Chip label="Kyle" />
                <Chip label="juantwotree" />
                <Chip label="Kyle" />
                <Chip label="Kyle" />
                <Chip label="Kyle" />
                <Chip label="Kyle" />
              </Stack>
            </div>
            <div className="mt-4 rounded bg-gray-800 p-2 shadow">
              <h2 className="text-lg font-semibold">Team 2 Member list</h2>
              <Stack
                direction="row"
                className="flex-1 flex-wrap gap-x-1 gap-y-1"
              >
                <Chip label="Kyle" />
                <Chip label="Kyle" />
                <Chip label="Kyle" />
                <Chip label="Kyle" />
                <Chip label="Kyle" />
                <Chip label="Kyle" />
              </Stack>
            </div>
          </div>
        </div>
      </div>

      {/* Start button */}
      <div className="text-center">
        <Button disabled={!isStartBtnAvailable} onClick={() => startGame()}>
          START
        </Button>
      </div>
    </div>
  );
}
