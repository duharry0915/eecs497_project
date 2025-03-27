import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NUM_CARDS = 21;
const backImage = "/static/assets/back.png"; // ensure this file exists

const cardNames = [
  "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor",
  "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit",
  "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance",
  "The Devil", "The Tower", "The Star", "The Moon", "The Sun",
  "Judgement", "The World"
  // ... continue for 78 names if desired
];

// Original deck in a fixed order
const baseCards = Array.from({ length: NUM_CARDS }, (_, i) => ({
  id: i + 1,
  name: cardNames[i] || `Card ${i + 1}`,
  frontImage: `/static/assets/card${i + 1}.png`,
  backImage,
}));

// Moves the first card to the end
function shiftDeckOne(deck) {
  const newDeck = [...deck];
  newDeck.push(newDeck.shift());
  return newDeck;
}

export default function CardSelection() {
  const navigate = useNavigate();
  const [selectedCards, setSelectedCards] = useState([]);
  const [displayDeck, setDisplayDeck] = useState(baseCards);

  /**
   * Each time we land on /tarot/selection, increment a shift counter in localStorage,
   * then shift the deck that many times.
   */
  useEffect(() => {
    // 1. Read the old shift count from localStorage
    const oldCount = parseInt(localStorage.getItem("shiftCount") || "0", 10);
    const newCount = oldCount + 1;

    // 2. Shift the deck newCount times
    let deck = [...baseCards];
    for (let i = 0; i < newCount; i++) {
      deck = shiftDeckOne(deck);
    }

    // 3. Save deck to state
    setDisplayDeck(deck);

    // 4. Store the updated shift count
    localStorage.setItem("shiftCount", newCount.toString());
  }, []);

  const toggleCard = (card) => {
    if (selectedCards.includes(card.id)) {
      setSelectedCards(selectedCards.filter((id) => id !== card.id));
    } else if (selectedCards.length < 5) {
      setSelectedCards([...selectedCards, card.id]);
    }
  };

  const goToReading = () => {
    const chosen = displayDeck.filter((c) => selectedCards.includes(c.id));
    sessionStorage.setItem("selectedCards", JSON.stringify(chosen));
    navigate("/tarot/reading");
  };

  return (
    <div style={styles.container}>
      <p style={styles.title}>Pick 5 Cards</p>
      <div style={styles.grid}>
        {displayDeck.map((card) => (
          <button
            key={card.id}
            onClick={() => toggleCard(card)}
            style={{
              ...styles.cardButton,
              opacity: selectedCards.includes(card.id) ? 0.5 : 1,
              border: selectedCards.includes(card.id)
                ? "3px solid #FF6F61"
                : "1px solid #ccc",
            }}
          >
            <img
              src={card.backImage}
              alt={`Card ${card.id}`}
              style={styles.cardImage}
            />
          </button>
        ))}
      </div>

      {selectedCards.length === 5 && (
        <button style={styles.button} onClick={goToReading}>
          See Reading
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    color: "#000",
    marginTop: "50px",
    backgroundColor: "#f3e5f5",
    minHeight: "100vh",
    paddingTop: "20px",
  },
  title: { fontSize: "24px", marginBottom: "20px" },
  grid: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "15px",
    marginBottom: "20px",
  },
  cardButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  cardImage: {
    width: "200px",
    height: "240px",
    objectFit: "cover",
    borderRadius: "15px",
  },
  button: {
    marginTop: "20px",
    padding: "10px 20px",
    backgroundColor: "#FF6F61",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  },
};
