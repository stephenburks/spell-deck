import { useEffect, useState } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { getAllSpells } from "./api";
import SpellCard from "./spellCard";
import "./App.css";
import "./style.css";

// Your main App component
function AppContent() {
  const [spells, setSpells] = useState([]);

  useEffect(() => {
    const savedSpells = localStorage.getItem("spells");
    if (savedSpells){
      setSpells(JSON.parse(savedSpells));
    } else {
      getAllSpells().then((spells) => {
        setSpells(spells);
        localStorage.setItem("spells", JSON.stringify(spells));
      });
    }
  }, []);

  return (
    <div className="App">
      {spells.length === 0 && <span className="loading">Loading...</span>}
      <div className="spell-list">
        {spells.map((spell) => (
          <SpellCard key={spell.index} spell={spell} />
        ))}
      </div>
    </div>
  );
}

// Root component with providers
export default function App() {
  return (
    <ChakraProvider>
      <AppContent />
    </ChakraProvider>
  );
}