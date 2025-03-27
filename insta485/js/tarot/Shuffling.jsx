import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Shuffling() {
  const history = useNavigate();
  const [shuffleMethod, setShuffleMethod] = useState(null);
  const [shuffling, setShuffling] = useState(false);

  useEffect(() => {
    if (shuffleMethod) {
      const timer = setTimeout(() => setShuffling(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [shuffleMethod]);

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
  }, []);

  const handleShuffle = (method) => {
    setShuffleMethod(method);
    setShuffling(true);
  };

  return (
    <div
      style={{
        ...styles.container,
        backgroundImage: 'url("/static/assets/background.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
      }}
    >
      {!shuffleMethod && (
        <div style={styles.shuffleOptions}>
          <p style={styles.choose}>Choose a shuffling method:</p>
          <button style={styles.button} onClick={() => handleShuffle("Classic")}>Classic Shuffle</button>
          <button style={styles.button} onClick={() => handleShuffle("Cut")}>Cut Shuffle</button>
          <button style={styles.button} onClick={() => handleShuffle("Chaos")}>Chaos Shuffle</button>
        </div>
      )}

      {shuffleMethod && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", paddingRight: "300px" }}>
          <p style={styles.title}>Shuffling Method: {shuffleMethod}</p>
          <div style={styles.card}>
            <span className={shuffling ? "spin" : ""}>🔮</span>
          </div>
          {!shuffling && (
            <button style={styles.button} onClick={() => history("/tarot/selection")}>
              Pick 5 Cards
            </button>
          )}
        </div>
      )}
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
  title: { fontSize: "22px", marginBottom: "20px" },
  card: { fontSize: "50px" },
  button: {
    marginTop: "10px",
    padding: "10px 20px",
    backgroundColor: "#FF6F61",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  },
  shuffleOptions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    marginTop: "60px",
  },
  choose: {
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "10px",
  },
};
