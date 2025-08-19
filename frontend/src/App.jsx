import React, { useState } from "react"

function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("http://localhost:8080/api/estimate?origin=LAX&airport=SFO") 
      if (!response.ok) throw new Error("Failed to fetch data")
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1>✈️ Airport Traffic Tracker</h1>
      <button 
        onClick={fetchData} 
        style={{ padding: "10px 20px", marginBottom: "20px", cursor: "pointer" }}
      >
        Get Airport Data
      </button>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>❌ {error}</p>}
      {data && (
        <div style={{ marginTop: "20px" }}>
          <h2>API Response:</h2>
          <pre style={{ background: "#f4f4f4", padding: "10px" }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default App
