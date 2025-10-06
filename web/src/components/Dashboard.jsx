import React from "react";

export default function Dashboard({ completedBlocks }) {
  const xp = completedBlocks.length * 100;
  return (
    <div style={{ padding: "20px", backgroundColor: "#FF33AA", borderRadius: "10px" }}>
      <h2>Dashboard de Pontuação</h2>
      <p>XP: {xp}</p>
      <p>Blocos concluídos: {completedBlocks.join(", ") || "Nenhum"}</p>
    </div>
  );
}
