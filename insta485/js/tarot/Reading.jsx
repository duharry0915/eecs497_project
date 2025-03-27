import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const OPENAI_API_KEY = "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"; // ⚠️ Keep in frontend ONLY for local testing

export default function Reading() {
  const history = useNavigate();
  const selectedCards = JSON.parse(sessionStorage.getItem("selectedCards")) || [];

  const [interpretation, setInterpretation] = useState("Loading interpretation...");
  const [hasFetched, setHasFetched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hasFetched || selectedCards.length === 0) return;

    const cardNames = selectedCards.map((card) => card.name).join(", ");
    const prompt = `You are a tarot expert. Interpret the following three cards.
Explain what they represent in the past, present, and future. Give a short piece of advice.

Cards: ${cardNames}`;

    async function fetchInterpretation() {
      if (loading) return;
      setLoading(true);

      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo-0125",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 300,       // ✅ cost control
            temperature: 0.7,
          }),
        });

        const data = await response.json();
        const message = data.choices?.[0]?.message?.content || "No interpretation available.";
        setInterpretation(message);
        setHasFetched(true);
      } catch (error) {
        console.error("Tarot reading error:", error);
        setInterpretation("Sorry, the tarot spirits are unavailable right now.");
      } finally {
        setLoading(false);
      }
    }

    fetchInterpretation();
  }, [JSON.stringify(selectedCards), hasFetched, loading]);

  return (
    <div style={styles.container}>
      <p style={styles.title}>Your Reading</p >

      <div style={styles.cardGrid}>
        {selectedCards.map((card) => (
          <div key={card.id} style={styles.cardWrapper}>
            < img src={card.frontImage} alt={card.name} style={styles.card} />
            <p style={styles.cardName}>{card.name}</p >
          </div>
        ))}
      </div>

      <p style={styles.interpretation}>{interpretation}</p >

      <button style={styles.button} onClick={() => history("/tarot/shuffling")}>
        Shuffle Again
      </button>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    color: "#000",
    margin: 0,
    backgroundColor: "#f3e5f5",
    minHeight: "100vh",
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
    objectFit: "cover",
    borderRadius: "6px",
  },
  cardWrapper: {
    textAlign: "center",
  },
  cardName: {
    fontSize: "14px",
    color: "#000",
    marginTop: "5px",
  },
  interpretation: {
    fontSize: "18px",
    color: "#000",
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