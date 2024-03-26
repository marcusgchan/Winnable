import React from "react";

const teamOne = {
  name: "Team 1",
  score: 10,
  membersCompeting: ["Marcus"],
  memberList: ["Kyle", "Juan", "Pritam"],
};

const teamTwo = {
  name: "Team 2",
  score: -5,
  membersCompeting: ["Stephen"],
  memberList: ["Jeffery", "iShowMeat", "Epstein"],
};

const gameInfo = {
  currentGame: {
    name: "CS:GO",
    rules: "1v1, no showing meat, no racial slurs (exceptions applied)",
  },
};

const nextgameInfo = {
  nextGame: {
    name: "Survival of the Fittest",
    rules: "Same",
  },
};

export function GamePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4 text-white">
      <header className="my-4 text-4xl">Winnable</header>
      <main className="flex-grow">
        <div className="grid grid-cols-1 gap-8 px-4 md:grid-cols-3 md:px-0">
          <TeamColumn team={teamOne} />
          <CurrentGameColumn gameInfo={gameInfo.currentGame} />
          <NextGameColumn nextgameInfo={nextgameInfo.nextGame} />
          <TeamColumn team={teamTwo} />
        </div>
      </main>
      <div className="flex items-center justify-center space-x-10">
        {/* Center align items and space-x-2 for spacing */}
        <button className="flex gap-4 rounded bg-gray-500 px-2 py-1 text-white hover:bg-gray-600">
          Team 1 Wins
        </button>
        <button className="m-5 flex gap-4 rounded bg-yellow-500 px-2 py-1 text-white hover:bg-yellow-600">
          Randomize Players
        </button>
        <button className="flex gap-4 rounded bg-gray-500 px-2 py-1 text-white hover:bg-gray-600">
          {" "}
          Team 2 Wins
        </button>
      </div>
    </div>
  );
}

function TeamColumn({ team }) {
  return (
    <div className="rounded-lg bg-card p-4 shadow-lg">
      <h2 className="mb-2 text-2xl">{team.name}</h2>
      <h3 className="text-lg">Score: {team.score}</h3>
      <h3 className="mb-2 mt-4">Players Competing</h3>
      {team.membersCompeting.map((member, index) => (
        <Player key={index} name={member} />
      ))}
      <h3 className="mb-2 mt-4">Member List</h3>
      {team.memberList.map((member, index) => (
        <Player key={index} name={member} pick />
      ))}
    </div>
  );
}

function Player({ name, pick }) {
  return (
    <div className="my-4 flex w-full max-w-6xl items-center justify-between px-4">
      <span>{name}</span>
      {pick ? (
        <button className="rounded bg-green-500 px-2 py-1 text-white hover:bg-green-600">
          Pick
        </button>
      ) : (
        <button className="rounded bg-red-500 px-2 py-1 text-white hover:bg-red-600">
          Remove
        </button>
      )}
    </div>
  );
}

function CurrentGameColumn({ gameInfo }) {
  const currentGameImageURL = "https://wallpapercave.com/wp/wp8709769.jpg";

  return (
    <div className="rounded-lg bg-card p-4 shadow-lg md:col-span-1">
      <h2 className="mb-4 text-2xl">Current Game</h2>
      <img
        src={currentGameImageURL}
        alt="Current Game"
        className="my-2 h-auto w-full rounded-lg object-cover"
      />

      <h3 className="text-lg">{gameInfo.name}</h3>
      <p className="mt-2">{gameInfo.rules}</p>
    </div>
  );
}
function NextGameColumn({ nextgameInfo }) {
  const nextGameImageURL =
    "https://seeklogo.com/images/V/valorant-logo-FAB2CA0E55-seeklogo.com.png";
  return (
    <div className="rounded-lg bg-card p-4 shadow-lg md:col-span-1">
      <h1 className="mb-4 mt-4 text-2xl">Next Game</h1>
      <img
        src={nextGameImageURL}
        alt="Next Game"
        className="my-2 h-auto w-full rounded-lg object-cover"
      />
      <h2 className="text-lg">{nextgameInfo.nextGame}</h2>
      <p className="mt-2">{nextgameInfo.rules}</p>
    </div>
  );
}
