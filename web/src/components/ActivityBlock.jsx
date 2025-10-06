import React, { useState } from "react";
import WordActivity from "./WordActivity.jsx";

export default function ActivityBlock({ level, words, completedBlocks, setCompletedBlocks }) {
  const [selectedWord, setSelectedWord] = useState(null);

  const handleComplete = () => {
    if (!completedBlocks.includes(level)) {
      setCompletedBlocks([...completedBlocks, level]);
    }
    setSelectedWord(null); // fecha a atividade ao concluir
  };

  return (
    <div style={{ backgroundColor: "#FFDD00", padding: "20px", borderRadius: "10px", width: "200px" }}>
      <h2>Nível {level}</h2>
      {selectedWord ? (
        <WordActivity 
          word={selectedWord} 
          finish={() => handleComplete()}
        />
      ) : (
        <div>
          {words.map((w) => (
            <button 
              key={w} 
              onClick={() => setSelectedWord(w)}
              style={{ display: "block", margin: "5px 0", padding: "5px 10px", cursor: "pointer", backgroundColor: "#FF5733", color: "#fff", border: "none", borderRadius: "5px" }}
            >
              {w}
            </button>
          ))}
          <p>{completedBlocks.includes(level) ? "Concluído!" : "Clique em uma palavra"}</p>
        </div>
      )}
    </div>
  );
}
