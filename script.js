// script.js - Weather Calculator (Open-Meteo + Geocoding)
document.getElementById('btnSearch').addEventListener('click', getWeather);
document.getElementById('btnLocate').addEventListener('click', getWeatherByLocation);

async function getWeather(){
  const city = document.getElementById('city').value.trim();
  const out = document.getElementById('result');
  if(!city){ out.textContent = 'Please enter a city name.'; return; }
  out.textContent = 'Searching location…';

  try{
    const geoResp = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
    const geo = await geoResp.json();
    if(!geo.results || geo.results.length === 0){ out.textContent = 'City not found.'; return; }

    const place = geo.results[0];
    await fetchAndShow(place.latitude, place.longitude, place.name, place.country, place.timezone);
  } catch(err){
    console.error(err);
    out.textContent = 'Error fetching location.';
  }
}

async function getWeatherByLocation(){
  const out = document.getElementById('result');
  if(!navigator.geolocation){ out.textContent = 'Geolocation not supported.'; return; }
  out.textContent = 'Getting your location…';
  navigator.geolocation.getCurrentPosition(async (pos)=>{
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    await fetchAndShow(lat, lon, 'Your location', '', 'auto');
  }, (err)=>{
    out.textContent = 'Location permission denied or failed.';
  });
}

async function fetchAndShow(lat, lon, name, country, timezone){
  const out = document.getElementById('result');
  out.textContent = 'Fetching weather…';

  try{
    // Request current weather + hourly humidity. timezone param keeps times aligned.
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m&timezone=${encodeURIComponent(timezone || 'auto')}`;
    const resp = await fetch(url);
    const data = await resp.json();

    if(!data.current_weather){ out.textContent = 'Weather data unavailable.'; return; }

    const cw = data.current_weather;
    const temp = cw.temperature;            // °C
    const wind = cw.windspeed;              // km/h
    // attempt to get humidity for the current time
    let humidity = undefined;
    if(data.hourly && data.hourly.time && data.hourly.relativehumidity_2m){
      const idx = data.hourly.time.indexOf(cw.time);
      if(idx !== -1) humidity = data.hourly.relativehumidity_2m[idx];
      else humidity = data.hourly.relativehumidity_2m[0];
    }

    const feels = computeFeelsLike(temp, wind, humidity);

    out.innerHTML = `
      <strong>${name}${country ? ', '+country : ''}</strong><br>
      🌡️ Temp: ${temp.toFixed(1)}°C<br>
      ${humidity !== undefined ? '💧 Humidity: '+humidity+'%<br>' : ''}
      💨 Wind: ${wind.toFixed(1)} km/h<br>
      😊 Feels like: ${feels.toFixed(1)}°C
    `;
  } catch(err){
    console.error(err);
    out.textContent = 'Error fetching weather.';
  }
}

function computeFeelsLike(tempC, windKmh, humidity){
  // 1) Heat Index if hot & humidity available (approx via Rothfusz)
  if(humidity !== undefined && tempC >= 27){
    const T = tempC * 9/5 + 32; // to °F
    const R = humidity;
    let HI = -42.379 + 2.04901523*T + 10.14333127*R - 0.22475541*T*R - 0.00683783*T*T - 0.05481717*R*R
             + 0.00122874*T*T*R + 0.00085282*T*R*R - 0.00000199*T*T*R*R;
    // small empirical adjustments
    if (R < 13 && T >= 80 && T <= 112) {
      HI -= ((13 - R)/4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
    } else if (R > 85 && T >= 80 && T <= 87) {
      HI += ((R - 85)/10) * ((87 - T)/5);
    }
    return (HI - 32) * 5/9; // back to °C
  }

  // 2) Wind chill if cold and windy
  if(tempC <= 10 && windKmh > 4.8){
    const V = Math.pow(windKmh, 0.16);
    const WC = 13.12 + 0.6215*tempC - 11.37*V + 0.3965*tempC*V;
    return WC;
  }

  // 3) otherwise return actual temp
  return tempC;
}
