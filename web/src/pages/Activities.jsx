import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";

export default function Activities() {
  const [items, setItems] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    api("/activities").then(setItems).catch(console.error);
  }, []);

  async function markAttempt(id, correct) {
    try {
      await api(`/activities/${id}/attempts`, { method: "POST", body: { correct, score: correct ? 100 : 40 }, token });
      alert("Tentativa registrada!");
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Atividades</h1>
      <ul className="space-y-3">
        {items.map(a => (
          <li key={a.id} className="border rounded p-3">
            <div className="font-semibold">{a.title}</div>
            <div className="text-sm opacity-80">{a.description}</div>
            <button className="mt-2 bg-green-600 text-white px-3 py-1 rounded" onClick={() => markAttempt(a.id, true)}>Marcar acerto</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
