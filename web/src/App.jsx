import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Agora tudo vem de ./components
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import MainScreen from "./components/MainScreen.jsx";
import UserAccount from "./components/UserAccount.jsx";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* redireciona a raiz para /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/activities" element={<MainScreen />} />

        {/* nova rota para informações do usuário */}
        <Route path="/account" element={<UserAccount />} />

        {/* 404 simples */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}