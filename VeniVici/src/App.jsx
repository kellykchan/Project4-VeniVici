import { useState } from "react";
import "./App.css";
import Gallery from "./components/Gallery";

const API_KEY = import.meta.env.VITE_APP_ACCESS_KEY;

function App() {
  const [currentAPOD, setCurrentAPOD] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [bannedMonths, setBannedMonths] = useState(new Set());
  const [bannedYears, setBannedYears] = useState(new Set());
  const [bannedCreators, setBannedCreators] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isBanned = (apod) => {
    if (!apod?.date) return false;
    const year = apod.date.slice(0, 4);
    const month = apod.date.slice(5, 7);
    const creator = apod.copyright || "Unknown";
    return (
      bannedYears.has(year) ||
      bannedMonths.has(month) ||
      bannedCreators.has(creator)
    );
  };

  const fetchAPOD = async (attempt = 0) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&count=1&thumbs=true`
      );
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();
      const apod = data[0];

      if (isBanned(apod)) {
        if (attempt < 5) {
          fetchAPOD(attempt + 1);
        } else {
          setError("Could not find APOD matching your ban list after 5 tries.");
          setLoading(false);
        }
      } else {
        setCurrentAPOD(apod);
        setGallery((prev) => [apod, ...prev]);
        setLoading(false);
      }
    } catch (err) {
      setError("Failed to fetch APOD: " + err.message);
      setLoading(false);
    }
  };

  const toggleBan = (type, value) => {
    const updateSet = (setFn) =>
      setFn((prev) => {
        const newSet = new Set(prev);
        newSet.has(value) ? newSet.delete(value) : newSet.add(value);
        return newSet;
      });

    if (type === "month") updateSet(setBannedMonths);
    if (type === "year") updateSet(setBannedYears);
    if (type === "creator") updateSet(setBannedCreators);
  };

  const getYear = (dateStr) => (dateStr ? dateStr.slice(0, 4) : "Unknown");
  const getMonth = (dateStr) => (dateStr ? dateStr.slice(5, 7) : "Unknown");

  return (
    <div className="whole-page">
      <header className="page-header">
        <h1>🌌 NASA APOD Discoverer</h1>
        <h3>Discover the universe from your own home!</h3>
        <button onClick={() => fetchAPOD()} className="fetch-button">
          Get Random APOD
        </button>
      </header>

      <div className="sideNav">
        <h2>Ban List</h2>

        <h4>Months:</h4>
        {[...bannedMonths].length === 0 && <p>None</p>}
        <ul>
          {[...bannedMonths].map((m) => (
            <li key={m} onClick={() => toggleBan("month", m)} className="banned-item">
              {m}
            </li>
          ))}
        </ul>

        <h4>Years:</h4>
        {[...bannedYears].length === 0 && <p>None</p>}
        <ul>
          {[...bannedYears].map((y) => (
            <li key={y} onClick={() => toggleBan("year", y)} className="banned-item">
              {y}
            </li>
          ))}
        </ul>

        <h4>Creators:</h4>
        {[...bannedCreators].length === 0 && <p>None</p>}
        <ul>
          {[...bannedCreators].map((c) => (
            <li key={c} onClick={() => toggleBan("creator", c)} className="banned-item">
              {c}
            </li>
          ))}
        </ul>
      </div>

      <div className="history-sidebar">
        <h2>Past Images</h2>
        <Gallery images={gallery} />
      </div>

      <div className="current-apod">
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {currentAPOD && (
          <>
            <h2>{currentAPOD.title}</h2>
            <p>{currentAPOD.date}</p>

            <div className="buttons">
              <button
                className="attribute-button"
                type="button"
                onClick={() =>
                  toggleBan("creator", currentAPOD.copyright || "Unknown")
                }
              >
                Creator: {currentAPOD.copyright || "Unknown"}
              </button>

              <button
                className="attribute-button"
                type="button"
                onClick={() =>
                  toggleBan("month", getMonth(currentAPOD.date))
                }
              >
                Month: {getMonth(currentAPOD.date)}
              </button>

              <button
                className="attribute-button"
                type="button"
                onClick={() => toggleBan("year", getYear(currentAPOD.date))}
              >
                Year: {getYear(currentAPOD.date)}
              </button>
            </div>

            {currentAPOD.media_type === "image" ? (
              <img
                src={currentAPOD.url}
                alt={currentAPOD.title}
                width="500"
              />
            ) : currentAPOD.media_type === "video" ? (
              currentAPOD.thumbnail_url ? (
                <img
                  src={currentAPOD.thumbnail_url}
                  alt={`Video thumbnail for ${currentAPOD.title}`}
                  width="500"
                />
              ) : (
                <p>No video thumbnail available.</p>
              )
            ) : null}

            {currentAPOD.copyright && (
              <p style={{ fontStyle: "italic" }}>
                © {currentAPOD.copyright}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;