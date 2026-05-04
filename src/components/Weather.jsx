import React, { useEffect, useRef, useState } from "react";
import "./Weather.css";
import BackgroundAnimation from "./BackgroundAnimation";

import clouds from "../assets/clouds.png";
import drizzle from "../assets/drizzle.png";
import rain from "../assets/heavy-rain.png";
import humidityIcon from "../assets/humidity.png";
import searchicon from "../assets/search.png";
import snow from "../assets/snowflake.png";
import thunderstorm from "../assets/storm.png";
import sunny from "../assets/sunny.png";
import sunsetIcon from "../assets/sunset.png";
import temperatureIcon from "../assets/temperature.png";
import windIcon from "../assets/wind.png";
import sunriseIcon from "../assets/sunrise.png";
import clear from "../assets/clear.png";

const Weather = () => {
  const inputRef = useRef();
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourly, setHourly] = useState([]);
  const [time, setTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [theme, setTheme] = useState("sunny");
  const [timeOfDay, setTimeOfDay] = useState("day");
  const [selectedDay, setSelectedDay] = useState(null);

  const icons = {
    "01d": sunny, "01n": clear,
    "02d": clouds, "02n": clouds,
    "03d": clouds, "03n": clouds,
    "04d": drizzle, "04n": drizzle,
    "09d": rain, "09n": rain,
    "10d": rain, "10n": rain,
    "11d": thunderstorm, "11n": thunderstorm,
    "13d": snow, "13n": snow,
  };

  const getTheme = (icon) => {
    if (["11d", "11n"].includes(icon)) return "thunderstorm";
    if (["09d", "10d", "09n", "10n"].includes(icon)) return "rainy";
    if (["13d", "13n"].includes(icon)) return "snowy";
    if (["02d", "03d", "04d", "02n", "03n", "04n"].includes(icon)) return "cloudy";
    return "sunny";
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getWeather = async (city) => {
    if (!city) return;
    setLoading(true);
    setError(false);
    setSelectedDay(null); // Reset selection on new search
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${import.meta.env.VITE_APP_ID}`
      );
      
      if (!res.ok) throw new Error("City not found");

      const data = await res.json();
      const res2 = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${import.meta.env.VITE_APP_ID}`
      );
      const data2 = await res2.json();

      setTheme(getTheme(data.weather[0].icon));

      const currentTime = Math.floor(Date.now() / 1000);
      const sr = data.sys.sunrise;
      const ss = data.sys.sunset;
      
      let tod = "day";
      if (currentTime < sr || currentTime > ss) {
        tod = "night";
      } else if (currentTime >= sr && currentTime < sr + 3600) {
        tod = "sunrise";
      } else if (currentTime > ss - 3600 && currentTime <= ss) {
        tod = "sunset";
      }
      setTimeOfDay(tod);

      setWeather({
        city: data.name,
        temp: Math.floor(data.main.temp),
        humidity: data.main.humidity,
        wind: data.wind.speed,
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset,
        precipitation: Math.round(data2.list[0].pop * 100),
        seaLevel: data.main.sea_level ? `${data.main.sea_level} hPa` : "N/A",
        icon: icons[data.weather[0].icon] || sunny,
        desc: data.weather[0].description,
      });

      const nextDays = data2.list.filter((item) => item.dt_txt.includes("12:00:00"));
      setHourly(data2.list.slice(0, 8));
      setForecast(nextDays);

    } catch (err) {
      console.log("Error fetching data:", err);
      setError(true);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getWeather("Chennai");
  }, []);

  const getDisplayData = () => {
    if (!weather) return null;
    if (!selectedDay) return { ...weather, title: "Current Weather" };
    
    return {
      title: new Date(selectedDay.dt_txt).toLocaleString("en-US", { weekday: 'long', hour: 'numeric', minute: 'numeric' }),
      city: weather.city,
      temp: Math.floor(selectedDay.main.temp),
      humidity: selectedDay.main.humidity,
      wind: selectedDay.wind.speed,
      sunrise: weather.sunrise, 
      sunset: weather.sunset,
      precipitation: Math.round(selectedDay.pop * 100),
      seaLevel: selectedDay.main.sea_level ? `${selectedDay.main.sea_level} hPa` : "N/A",
      icon: icons[selectedDay.weather[0].icon] || sunny,
      desc: selectedDay.weather[0].description,
    };
  };

  const displayData = getDisplayData();

  return (
    <div className={`weather ${selectedDay ? getTheme(selectedDay.weather[0].icon) : theme} ${timeOfDay}`}>
      <BackgroundAnimation weatherType={selectedDay ? getTheme(selectedDay.weather[0].icon) : theme} timeOfDay={timeOfDay} />

      <div className="weather-content">
        <div className="top-bar slide-down">
          <div className="clock">
            <h1 className="digital-clock">{time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</h1>
            <p className="date-text">{time.toDateString()}</p>
          </div>

          <div className="search-bar">
            <input ref={inputRef} placeholder="Search city..." onKeyDown={(e) => e.key === 'Enter' && getWeather(inputRef.current.value)} />
            <img
              className="search-icon"
              src={searchicon}
              alt="search"
              onClick={() => getWeather(inputRef.current.value)}
            />
          </div>
        </div>

        {loading && <div className="loading-spinner fade-in">Loading weather data...</div>}
        {error && <div className="error-message fade-in">City not found. Please try again.</div>}

        {!loading && !error && displayData && (
          <div className="centered-layout fade-up">
            
            {/* Main Centered Display */}
            <div className="main-display-card">
              <div className="main-display-content">
                <div className="left-info-main">
                  <p className="detail-title">{displayData.title}</p>
                  <img className="main-icon float-anim" src={displayData.icon} alt="weather" />
                  <h3 className="city-name">{displayData.city}</h3>
                  <div className="temp-section">
                    <img src={temperatureIcon} alt="temp" className="stat-small-icon" />
                    <h2 className="main-temp">{displayData.temp}°C</h2>
                  </div>
                  <p className="detail-desc">{displayData.desc}</p>
                </div>
                
                <div className="stats-grid">
                  <div className="stat-item">
                    <img src={rain} alt="rain" />
                    <div><p>Precip</p><span>{displayData.precipitation}%</span></div>
                  </div>
                  <div className="stat-item">
                    <img src={humidityIcon} alt="humidity" />
                    <div><p>Humidity</p><span>{displayData.humidity}%</span></div>
                  </div>
                  <div className="stat-item">
                    <img src={windIcon} alt="wind" />
                    <div><p>Wind</p><span>{displayData.wind} km/h</span></div>
                  </div>
                  <div className="stat-item">
                    <img src={sunriseIcon} alt="sunrise" />
                    <div><p>Sunrise</p><span>{new Date(displayData.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                  </div>
                  <div className="stat-item">
                    <img src={sunsetIcon} alt="sunset" />
                    <div><p>Sunset</p><span>{new Date(displayData.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                  </div>
                  <div className="stat-item">
                    <span style={{ fontSize: '24px', marginRight: '5px' }}>🌊</span>
                    <div><p>Sea Level</p><span>{displayData.seaLevel}</span></div>
                  </div>
                </div>
              </div>
              
              {selectedDay && (
                <button className="reset-btn fade-in" onClick={() => setSelectedDay(null)}>
                  Back to Current Weather
                </button>
              )}
            </div>

            {/* Forecast Lists */}
            <div className="forecast-container">
              <h4 className="section-title">Hourly Forecast</h4>
              <div className="horizontal-list scroll fade-up-stagger-1">
                {hourly.map((item, i) => (
                  <div 
                    className={`card-item ${selectedDay === item ? "active" : ""}`} 
                    key={i}
                    onClick={() => setSelectedDay(item)}
                  >
                    <p className="card-time">{new Date(item.dt_txt).getHours()}:00</p>
                    <img src={icons[item.weather[0].icon] || sunny} alt="" />
                    <p className="card-temp">{Math.floor(item.main.temp)}°</p>
                  </div>
                ))}
              </div>

              <h4 className="section-title" style={{ marginTop: '30px' }}>7-Day Forecast</h4>
              <div className="horizontal-list scroll fade-up-stagger-2">
                {forecast.map((item, i) => (
                  <div 
                    className={`card-item ${selectedDay === item ? "active" : ""}`} 
                    key={i}
                    onClick={() => setSelectedDay(item)}
                  >
                    <p className="card-time">{new Date(item.dt_txt).toLocaleDateString("en-US", { weekday: "short" })}</p>
                    <img src={icons[item.weather[0].icon] || sunny} alt="" />
                    <p className="card-temp">{Math.floor(item.main.temp)}°</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Weather;