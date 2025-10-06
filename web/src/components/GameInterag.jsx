import React from "react";

export default function GameInterag({ unlocked }) {
  return (
    <div style={{ margin: "30px 0", padding: "20px", backgroundColor: "#33FF57", borderRadius: "10px" }}>
      <h2>GameInterag</h2>
      {unlocked ? <p>Jogo desbloqueado! (Pac-Man em breve)</p> : <p>Complete pelo menos 1 bloco para desbloquear o jogo</p>}
      <button 
        disabled={!unlocked} 
        style={{ marginTop: "10px", padding: "10px 20px", backgroundColor: unlocked ? "#FF5733" : "#ccc", color: "#fff", border: "none", borderRadius: "5px", cursor: unlocked ? "pointer" : "not-allowed" }}
      >
        Iniciar Jogo
      </button>
    </div>
  );
}
