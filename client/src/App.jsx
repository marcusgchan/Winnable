import "./App.css";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { HomePage } from "./lib/lobby/home/home.page";
import { DraftMembersPage } from "./lib/lobby/draft/draft-members.page";
import { DraftGamesPage } from "./lib/lobby/draft/draft-games.page";
import { GamePage } from "./lib/lobby/game/game.page";
import { Button } from "./lib/ui/button";
import {
  initializeWebSocket,
  sendMessage,
  closeWebSocket,
  updateLobby,
} from "./lib/websocket/websocket";
import uniqid from "uniqid";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "", // Lobby
        element: <HomePage />,
      },
      {
        path: ":lobbyId/draft-members",
        element: <DraftMembersPage />,
      },
      {
        path: ":lobbyId/draft-games",
        element: <DraftGamesPage />,
      },
      {
        path: ":lobbyId/game",
        element: <GamePage />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router}></RouterProvider>;
}

function Root() {
  return (
    <Base>
      <Header />
      <Outlet />
    </Base>
  );
}

/**
 * @param {{ children: React.ReactNode }} props
 */
function Base({ children }) {
  return (
    <div className="mx-auto max-w-screen-lg space-y-4 p-4">{children}</div>
  );
}

function Header() {
  return (
    <header className="flex justify-between">
      <span>Winnable</span>
      <span>Login</span>
      <Button onClick={() => initializeWebSocket()}>Connect Websocket</Button>
      <Button onClick={() => sendMessage("this is a test")}>
        Send message
      </Button>
      <Button
        onClick={() =>
          updateLobby({ id: "65fa26c5e0f19bd948896b78", lobbyName: uniqid() })
        }
      >
        Update lobby
      </Button>
    </header>
  );
}

export default App;
