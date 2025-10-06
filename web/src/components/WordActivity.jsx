import React, { useState } from "react";

export default function WordActivity({ word, finish }) {
  const phases = ["Fonemas", "Sílabas", "Palavra inteira"];
  const [currentPhase, setCurrentPhase] = useState(0);

  const splitWord = (w) => {
    if (currentPhase === 0) return w.split(""); // fonemas
    if (currentPhase === 1) return w.match(/.{1,2}/g) || [w]; // sílabas simples
    return [w]; // palavra inteira
  };

  const handleNext = () => {
    if (currentPhase < phases.length - 1) {
      setCurrentPhase(currentPhase + 1);
    } else {
      finish(); // concluiu a palavra
    }
  };

  const playSound = (text) => {
    const synth = window.speechSynthesis;
    const utterThis = new SpeechSynthesisUtterance(text);
    synth.speak(utterThis);
  };

  return (
    <div className="mt-8 text-center">
      <h2 className="text-3xl font-bold text-cyan-400 mb-6">{word} - {phases[currentPhase]}</h2>
      
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        {splitWord(word).map((part, index) => (
          <button 
            key={index} 
            onClick={() => playSound(part)}
            className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-transform transform hover:scale-110"
          >
            {part}
          </button>
        ))}
      </div>

      <button 
        onClick={handleNext}
        className="bg-green-500 hover:bg-green-600 px-8 py-3 rounded-xl text-white font-bold shadow-lg transition-transform transform hover:scale-105"
      >
        Próxima fase
      </button>
    </div>
  );
}
