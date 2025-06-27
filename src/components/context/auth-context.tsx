import React, { createContext, useContext, useState } from "react";

export type User = {
  id: string;
  name?: string;
  nickname?: string;
  email: string;
};

interface SessionContextProps {
  session: { user: User; token: string } | null;
  setSession: React.Dispatch<
    React.SetStateAction<{ user: User; token: string } | null>
  >;
  signIn: (user: User, accessToken: string, refreshToken: string) => void;
  logOut: () => void;
}

const defaultSessionContext: SessionContextProps = {
  session: null,
  setSession: () => {},
  signIn: () => {},
  logOut: () => {},
};

const SessionContext = createContext<SessionContextProps>(
  defaultSessionContext
);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [session, setSession] = useState<{ user: User; token: string } | null>(
    () => {
      const storedAuth = localStorage.getItem("auth");
      return storedAuth ? JSON.parse(storedAuth) : null;
    }
  );

  const signIn = (user: User, accessToken: string, refreshToken: string) => {
    setSession({ user, token: accessToken });
    localStorage.setItem("auth", JSON.stringify({ user, token: accessToken }));
    localStorage.setItem("refreshToken", refreshToken);
  };

  const logOut = () => {
    setSession(null);
    localStorage.removeItem("auth");
    localStorage.removeItem("refreshToken");
  };

  return (
    <SessionContext.Provider value={{ session, setSession, signIn, logOut }}>
      {children}
    </SessionContext.Provider>
  );
};
