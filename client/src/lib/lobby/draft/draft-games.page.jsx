import React from "react";
export function DraftGamesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-900 p-4">
      <div className="flex flex-1">
        {/* Sidebar for game search */}
        <div className="w-1/4 p-2">
          <input
            type="text"
            placeholder="Search Game"
            className="mb-2 w-full rounded bg-gray-800 p-2"
          />
          <textarea
            placeholder="Description/Rules"
            className="mb-2 h-52 w-full rounded bg-gray-800 p-2"
          ></textarea>
          <button className="w-full rounded bg-blue-500 p-2 text-white hover:bg-blue-600">
            Confirm
          </button>
        </div>

        {/* Selected games and members list */}
        <div className="flex flex-1 flex-col p-2 md:flex-row">
          <div className="m-2 flex-1">
            <h2 className="mb-2 rounded bg-gray-800 text-lg font-semibold">
              Selected Games
            </h2>
            <div className="mb-2 flex items-center justify-between rounded bg-gray-800">
              <h3>Games Team 1</h3>
              <span className="text-sm">3/10</span>
            </div>
            {/* Placeholder for selected games for Team 1 */}
            <div className="mb-4 flex flex-wrap rounded bg-gray-800 p-2">
              {/* Mockup of game slots */}
              <div className="m-1 flex h-10 w-1/4 items-center justify-center rounded bg-pink-300">
                Game 1
              </div>
              <div className="m-1 flex h-10 w-1/4 items-center justify-center rounded bg-pink-300">
                Game 2
              </div>
              <div className="m-1 flex h-10 w-1/4 items-center justify-center rounded bg-pink-300">
                Game 3
              </div>

              {/* More game slots */}
            </div>

            <div className="mb-2 flex items-center justify-between rounded bg-gray-800">
              <h3>Games Team 2</h3>
              <span className="text-sm">3/10</span>
            </div>
            {/* Placeholder for selected games for Team 2 */}
            <div className="mb-4 flex flex-wrap rounded bg-gray-800 p-2">
              {/* Mockup of game slots */}
              <div className="m-1 flex h-10 w-1/4 items-center justify-center rounded bg-blue-300">
                Game 1
              </div>
              <div className="m-1 flex h-10 w-1/4 items-center justify-center rounded bg-blue-300">
                Game 2
              </div>
              <div className="m-1 flex h-10 w-1/4 items-center justify-center rounded bg-blue-300">
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
      <div className="w-full p-80">
        <button className="w-30 mx-auto block rounded bg-yellow-400 p-3 text-white hover:bg-yellow-500">
          START
        </button>
      </div>
    </div>
  );
}
