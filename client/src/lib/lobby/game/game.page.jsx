import React from 'react';

const teamOne = {
  name: 'Team 1',
  score: 10,
  membersCompeting: ['Marcus'],
  memberList: ['Kyle', 'Juan', 'Pritam'],
  
};

const teamTwo = {
  name: 'Team 2',
  score: -5,
  membersCompeting: ['Stephen'],
  memberList: ['Jeffery', 'iShowMeat', 'Epstein']
};

const gameInfo = {
  currentGame: {
    name: 'CS:GO',
    rules: '1v1, no showing meat, no racial slurs (exceptions applied)'
  }};

const nextgameInfo = {
  nextGame:{
    name: 'Survival of the Fittest',
    rules: 'Same'
  }};


export function GamePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white">
      <header className="text-4xl my-4">Winnable</header>
      <main className="flex-grow">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-0">
        <TeamColumn team={teamOne} />
        <CurrentGameColumn gameInfo={gameInfo.currentGame} />
        <NextGameColumn nextgameInfo={nextgameInfo.nextGame} />
        <TeamColumn team={teamTwo} />
      </div>
      </main>
      <div className="flex justify-center items-center space-x-10"> {/* Center align items and space-x-2 for spacing */}
  <button className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-2 flex gap-4 rounded">
    Team 1 Wins
  </button>
  <button className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-2 m-5 flex gap-4 rounded">
    Randomize Players
  </button>
  <button className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-2 flex gap-4 rounded"> Team 2 Wins</button>
</div>

    </div>
  );
}

function TeamColumn({ team }) {
  
  return (
    <div className="bg-gray-900 rounded-lg p-4 shadow-lg">
      <h2 className="text-2xl mb-2">{team.name}</h2>
      <h3 className="text-lg">Score: {team.score}</h3>
      <h3 className="mt-4 mb-2">Players Competing</h3>
      {team.membersCompeting.map((member, index) => (
        <Player key={index} name={member} />
      ))}
      <h3 className="mt-4 mb-2">Member List</h3>
      {team.memberList.map((member, index) => (
        <Player key={index} name={member} pick />
      ))}
    </div>
  );
}

function Player({ name, pick }) {
  return (
    <div className="flex justify-between items-center w-full max-w-6xl px-4 my-4">
      <span>{name}</span>
      {pick ? (
        <button className="bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded">Pick</button>
      ) : (
        <button className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded">Remove</button>
      )}
    </div>
  );
}

function CurrentGameColumn({ gameInfo }) {
  const currentGameImageURL = 'https://wallpapercave.com/wp/wp8709769.jpg';

  return (
    <div className="md:col-span-1 bg-gray-900 rounded-lg p-4 shadow-lg">
      <h2 className="text-2xl mb-4">Current Game</h2>
      <img src={currentGameImageURL} alt="Current Game" className="w-full h-auto object-cover rounded-lg my-2" />
      
      <h3 className="text-lg">{gameInfo.name}</h3>
      <p className="mt-2">{gameInfo.rules}</p>
     
    </div>
  );}
  function NextGameColumn({ nextgameInfo}){
    const nextGameImageURL = 'https://seeklogo.com/images/V/valorant-logo-FAB2CA0E55-seeklogo.com.png'
    return (<div className="md:col-span-1 bg-gray-900 rounded-lg p-4 shadow-lg">
    
    <h1 className="text-2xl mt-4 mb-4">Next Game</h1>
    <img src={nextGameImageURL} alt="Next Game" className="w-full h-auto object-cover rounded-lg my-2" />
    <h2 className="text-lg">{nextgameInfo.nextGame}</h2>
    <p className="mt-2">{nextgameInfo.rules}</p>
  </div>

    );
  }
  
