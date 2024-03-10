import "./App.css";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { HomePage } from "./lib/lobby/home/home.page";
import { DraftMembersPage } from "./lib/lobby/draft/draft-members.page";
import { DraftGamesPage } from "./lib/lobby/draft/draft-games.page";
import { GamePage } from "./lib/lobby/game/game.page";

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
    </header>
  );
}

export default App;
