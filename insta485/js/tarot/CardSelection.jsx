import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Show all cards as "back of card"
const NUM_CARDS = 21;
const backImage = "/static/assets/back.png"; // this should exist in insta485/assets/back.png

const cardNames = [
  "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor",
  "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit",
  "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance",
  "The Devil", "The Tower", "The Star", "The Moon", "The Sun",
  "Judgement", "The World"
  // ... continue until all 78 names
];

// Updated paths (place images in insta485/static/assets/)
const cards = Array.from({ length: NUM_CARDS }, (_, i) => ({
  id: i + 1,
  name: cardNames[i] || `Card ${i + 1}`,  // fallback name
  frontImage: `/static/assets/card${i + 1}.png`,
  backImage,
}));

export default function CardSelection() {
  const history = useNavigate();
  const [selectedCard, setSelectedCard] = useState(null);  // optional, maybe remove if unused
  const [selectedCards, setSelectedCards] = useState([]);  // 💥 this line was missing

  const toggleCard = (card) => {
    if (selectedCards.includes(card.id)) {
      setSelectedCards(selectedCards.filter((id) => id !== card.id));
    } else if (selectedCards.length < 5) {
      setSelectedCards([...selectedCards, card.id]);
    }
  };

  const goToReading = () => {
    const selected = cards.filter(card => selectedCards.includes(card.id));
    console.log("Saving to session:", selected); // Optional debug
    sessionStorage.setItem("selectedCards", JSON.stringify(selected));
    history("/tarot/reading");
  };

  return (
    <div style={styles.container}>
      <p style={styles.title}>Pick 5 Cards</p>
      <div style={styles.grid}>
        {cards.map((card) => (
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
            <img src={card.backImage} alt={`Card ${card.id}`} style={styles.cardImage} />
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
    color: "#000", // dark text for light background
    marginTop: "50px",
    backgroundColor: "#f3e5f5", // 🌸 soft purple
    minHeight: "100vh",         // fill the full page
    paddingTop: "20px",
  },
  title: { fontSize: "24px", marginBottom: "20px" },
  cardGrid: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "15px",
    marginBottom: "20px",
  },
  card: {
    width: "80px",
    height: "120px",
    objectFit: "cover", // ⭐ NEW: constrain inside the box
    borderRadius: "6px",
  },
  cardImage: {
    width: "200px",       // ✅ smaller width
    height: "240px",     // ✅ smaller height
    objectFit: "cover",  // ensures it fills the space properly
    borderRadius: "15px",
  },
  cardWrapper: {
    textAlign: "center",
  },
  cardName: {
    fontSize: "16px",
    color: "#fff",
    marginTop: "8px",
  },
  interpretation: {
    fontSize: "18px",
    color: "#fff",
    marginBottom: "20px",
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
