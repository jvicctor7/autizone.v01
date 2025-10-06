import React, { useState } from "react";
import LoginScreen from "./components/LoginScreen.jsx";
import MainScreen from "./components/MainScreen.jsx";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [completedBlocks, setCompletedBlocks] = useState([]);

  return loggedIn ? (
    <MainScreen 
      logout={() => setLoggedIn(false)} 
      completedBlocks={completedBlocks}
      setCompletedBlocks={setCompletedBlocks}
    />
  ) : (
    <LoginScreen login={() => setLoggedIn(true)} />
  );
}
