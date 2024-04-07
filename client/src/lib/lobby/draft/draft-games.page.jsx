import { Button } from "@/lib/ui/button";
import { Input } from "@/lib/ui/input";
import { Textarea } from "@/lib/ui/textarea";
import { GAME_INFO_SERVER_URL } from "/src/lib/common/constants.js";
import React, { useEffect, useState } from "react";
import axios from "axios";

// mui
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { debounce } from "@mui/material/utils";

export function DraftGamesPage() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  async function searchGame(searchString) {
    const GAME_INFO_SERVER_URL =
      "https://game-info-server-hfythhryta-uw.a.run.app";
    console.log("searchString", searchString);
    console.log(GAME_INFO_SERVER_URL);
    const results = await axios.post(`${GAME_INFO_SERVER_URL}/game-list`, {
      searchString: searchString,
    });
    console.log(results);
    setSearchResults(results);
    return searchResults;
  }

  const top100Films = [
    { label: "The Shawshank Redemption", year: 1994 },
    { label: "The Godfather", year: 1972 },
    { label: "The Godfather: Part II", year: 1974 },
    { label: "The Dark Knight", year: 2008 },
    { label: "12 Angry Men", year: 1957 },
    { label: "Schindler's List", year: 1993 },
    { label: "Pulp Fiction", year: 1994 },
  ];

  const handleInputChange = debounce((event, value) => {
    console.log(event, value);
    searchGame(value);
  }, 400); // 400ms delay

  return (
    <div className="flex flex-col space-y-16 bg-card bg-gray-900 p-4">
      <div className="flex flex-1">
        {/* Sidebar for game search */}
        <div className="w-1/4 space-y-2 p-2">
          <Autocomplete
            disablePortal
            id="combo-box-demo"
            options={searchResults}
            renderInput={(params) => <TextField {...params} label="name" />}
            onInputChange={handleInputChange}
          />
          {/* description */}
          <Textarea
            placeholder="Description/Rules"
            className="h-52  bg-gray-800"
          ></Textarea>
          <button className="w-full rounded bg-blue-500 p-2 text-white hover:bg-blue-600">
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
              <span className="text-sm">3/10</span>
            </div>
            {/* Placeholder for selected games for Team 1 */}
            <div className="mb-4 flex flex-wrap rounded bg-gray-800 p-2">
              {/* Mockup of game slots */}
              <div className="m-1 flex h-10 w-1/4 items-center justify-center rounded bg-team1">
                Game 1
              </div>
              <div className="m-1 flex h-10 w-1/4 items-center justify-center rounded bg-team1">
                Game 2
              </div>
              <div className="m-1 flex h-10 w-1/4 items-center justify-center rounded bg-team1">
                Game 3
              </div>

              {/* More game slots */}
            </div>

            <div className="mb-2 flex items-center justify-between rounded bg-gray-800 p-2">
              <h3>Games Team 2</h3>
              <span className="text-sm">3/10</span>
            </div>
            {/* Placeholder for selected games for Team 2 */}
            <div className="mb-4 flex flex-wrap rounded bg-gray-800 p-2">
              {/* Mockup of game slots */}
              <div className="m-1 flex h-10 w-1/4 items-center justify-center rounded bg-team2">
                Game 1
              </div>
              <div className="m-1 flex h-10 w-1/4 items-center justify-center rounded bg-team2">
                Game 2
              </div>
              <div className="m-1 flex h-10 w-1/4 items-center justify-center rounded bg-team2">
                Game 3
              </div>
              {/* More game slots */}
            </div>
          </div>

          {/* Members list */}
          <div className="m-2 flex-1">
            <div className="rounded bg-gray-800 p-2 shadow">
              <h2 className="text-lg font-semibold">Team 1 Member list</h2>
              {/* Placeholder for Team 1 members */}
              <ul className="list-inside list-disc">
                {/* Mockup list items */}
                <li>Marcus</li>
                <li>Kyle</li>
                <li>Juan</li>
                <li>Pritam</li>
                {/* More list items */}
              </ul>
            </div>
            <div className="mt-4 rounded bg-gray-800 p-2 shadow">
              <h2 className="text-lg font-semibold">Team 2 Member list</h2>
              {/* Placeholder for Team 2 members */}
              <ul className="list-inside list-disc">
                {/* Mockup list items */}
                <li>Stephen</li>
                <li>Jeffery</li>
                <li>iShowMeat</li>
                <li>Epstein</li>
                {/* More list items */}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Start button */}
      <div className="text-center">
        <Button>START</Button>
      </div>
    </div>
  );
}
