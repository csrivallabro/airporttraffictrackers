import React, { useState } from "react";

export default function App() {
  const [origin, setOrigin] = useState("");
  const [airport, setAirport] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://localhost:8080/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, airport }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", fontFamily: "Arial, sans-serif" }}>
      <h2>✈️ Airport Travel Time Estimator</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <div style={{ marginBottom: "0.5rem" }}>
          <label>Origin: </label>
          <input
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: "0.5rem" }}>
          <label>Airport Code: </label>
          <input
            type="text"
            value={airport}
            onChange={(e) => setAirport(e.target.value.toUpperCase())}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Calculating..." : "Get Estimate"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>⚠️ {error}</p>}

      {result && (
        <div>
          <h3>Results for {result.airport}</h3>
          <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
            <tbody>
              <tr>
                <td>Drive Time</td>
                <td>{(result.driveSeconds / 60).toFixed(1)} minutes</td>
              </tr>
              <tr>
                <td>Parking Transfer</td>
                <td>{(result.parkingTransferSeconds / 60).toFixed(1)} minutes</td>
              </tr>
              <tr>
                <td>Check-in</td>
                <td>{(result.checkInSeconds / 60).toFixed(1)} minutes</td>
              </tr>
              <tr>
                <td>TSA Wait</td>
                <td>{(result.tsaWaitSeconds / 60).toFixed(1)} minutes</td>
              </tr>
              <tr>
                <td>Walk to Gate</td>
                <td>{(result.walkSeconds / 60).toFixed(1)} minutes</td>
              </tr>
              <tr>
                <td><b>Total Time</b></td>
                <td><b>{(result.totalSeconds / 60).toFixed(1)} minutes</b></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
