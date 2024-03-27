import { createContext, useContext } from "react";
import { useLoaderData } from "react-router-dom";

/** @type { id: string, name: string } User */

/** @type {React.Context<User>} */
const AuthContext = createContext();

/**
 * @param {{ children: React.ReactNode }} props
 */
function AuthProvider({ children }) {
  const user = useLoaderData();
  console.log(user);
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

function useAuth() {
  return useContext(AuthContext);
}

export { AuthProvider, useAuth };
