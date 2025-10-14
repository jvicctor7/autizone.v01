// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Agora tudo vem de ./components
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import MainScreen from "./components/MainScreen.jsx"; // sua tela de atividades

export default function App() {
  return (
    <Router>
      <Routes>
        {/* redireciona a raiz para /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* após login, navegue para /activities (MainScreen) */}
        <Route path="/activities" element={<MainScreen />} />

        {/* 404 simples */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}