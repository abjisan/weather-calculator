🌦️ Project Idea: Weather Calculator

Repo name: weather-calculator
Purpose: Show weather info + “feels like” calculations based on temperature and humidity.

📁 Folder Structure
weather-calculator/
│
├── index.html
├── style.css
└── script.js


🧱 1. index.html

Paste this:  

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Weather Calculator</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="container">
    <h1>🌤️ Weather Calculator</h1>
    <input type="text" id="city" placeholder="Enter city name" />
    <button onclick="getWeather()">Get Weather</button>

    <div id="result"></div>
  </div>

  <script src="script.js"></script>
</body>
</html>

🎨 2. style.css

Make it look clean:
body {
  font-family: Arial, sans-serif;
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.container {
  background: rgba(255, 255, 255, 0.1);
  padding: 30px;
  border-radius: 16px;
  text-align: center;
  width: 300px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

input {
  width: 80%;
  padding: 8px;
  border: none;
  border-radius: 6px;
  text-align: center;
}

button {
  margin-top: 10px;
  padding: 8px 15px;
  border: none;
  background: #fff;
  color: #333;
  border-radius: 6px;
  cursor: pointer;
}

#result {
  margin-top: 15px;
}


⚙️ 3. script.js

Use this code:

async function getWeather() {
  const city = document.getElementById('city').value;
  const apiKey = "https://api.open-meteo.com/v1/forecast?latitude=24.9&longitude=91.8&current_weather=true"; // Example fallback for Sylhet

  const result = document.getElementById('result');
  result.innerHTML = "Fetching weather...";

  try {
    // Use Open-Meteo API (no API key required!)
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?current_weather=true&timezone=auto&city=${city}`);
    const data = await response.json();

    if (data.current_weather) {
      const temp = data.current_weather.temperature;
      const wind = data.current_weather.windspeed;
      const feelsLike = (temp - (wind * 0.2)).toFixed(1);

      result.innerHTML = `
        🌍 City: ${city} <br>
        🌡️ Temperature: ${temp}°C <br>
        💨 Wind Speed: ${wind} km/h <br>
        😊 Feels Like: ${feelsLike}°C
      `;
    } else {
      result.innerHTML = "❌ Could not fetch weather data.";
    }
  } catch (error) {
    result.innerHTML = "⚠️ Error fetching weather.";
  }
}

🚀 Steps to Upload to GitHub

Go to GitHub → New repository → name it weather-calculator

Upload these 3 files

Add a README.md (optional)

Go to Settings → Pages → Branch: main → /root → Save
→ You’ll get a live link like:
https://yourusername.github.io/weather-calculator
