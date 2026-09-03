import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  const navigate = useNavigate();
  const { city: cityParam } = useParams();
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourly, setHourly] = useState([]);
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

  const getConditionLabel = (icon, description) => {
    if (["11d", "11n"].includes(icon)) return "Lightning";
    if (["09d", "09n"].includes(icon)) return "Rainy";
    if (["10d", "10n"].includes(icon)) return "Rainy";
    if (["13d", "13n"].includes(icon)) return "Snowy";
    if (["02d", "02n"].includes(icon)) return "Partly cloudy";
    if (["03d", "03n", "04d", "04n"].includes(icon)) return "Cloudy";
    if (["50d", "50n"].includes(icon)) return "Mist";
    return description ? description.charAt(0).toUpperCase() + description.slice(1) : "Clear";
  };

  const getWeatherCode = (code) => {
    if (code === 0) return "01d";
    if ([1, 2].includes(code)) return "02d";
    if (code === 3) return "03d";
    if ([45, 48].includes(code)) return "50d";
    if ([51, 53, 55, 56, 57].includes(code)) return "09d";
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "10d";
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "13d";
    if ([95, 96, 99].includes(code)) return "11d";
    return "01d";
  };

  const getWeather = async (city) => {
    if (!city) return;
    setLoading(true);
    setError(false);
    setSelectedDay(null); // Reset selection on new search
    try {
      const apiKey = import.meta.env.VITE_APP_ID;
      if (!apiKey) throw new Error("Weather API is not configured");

      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
      );
      
      if (res.status === 404) throw new Error("City not found");
      if (!res.ok) throw new Error("Weather service unavailable");

      const data = await res.json();
      const res2 = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
      );
      if (!res2.ok) throw new Error("Hourly forecast unavailable");
      const data2 = await res2.json();

      const dailyRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${data.coord.lat}&longitude=${data.coord.lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset&timezone=auto&forecast_days=7`
      );
      if (!dailyRes.ok) throw new Error("Seven-day forecast unavailable");
      const dailyData = await dailyRes.json();

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
        high: Math.floor(data.main.temp_max),
        low: Math.floor(data.main.temp_min),
        feelsLike: Math.floor(data.main.feels_like),
        humidity: data.main.humidity,
        wind: data.wind.speed,
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset,
        precipitation: dailyData.daily.precipitation_probability_max[0] ?? 0,
        seaLevel: data.main.sea_level ? `${data.main.sea_level} hPa` : "N/A",
        icon: icons[data.weather[0].icon] || sunny,
        condition: getConditionLabel(data.weather[0].icon, data.weather[0].description),
        desc: data.weather[0].description,
        timestamp: data.dt,
        timezone: data.timezone,
      });

      const nextDays = dailyData.daily.time.map((date, index) => {
        const iconCode = getWeatherCode(dailyData.daily.weather_code[index]);
        return {
          dt_txt: `${date} 12:00:00`,
          main: {
            temp: (dailyData.daily.temperature_2m_max[index] + dailyData.daily.temperature_2m_min[index]) / 2,
            temp_max: dailyData.daily.temperature_2m_max[index],
            temp_min: dailyData.daily.temperature_2m_min[index],
            feels_like: (dailyData.daily.temperature_2m_max[index] + dailyData.daily.temperature_2m_min[index]) / 2,
          },
          weather: [{ icon: iconCode, description: getConditionLabel(iconCode) }],
          wind: { speed: dailyData.daily.wind_speed_10m_max[index] },
          pop: (dailyData.daily.precipitation_probability_max[index] ?? 0) / 100,
          sunrise: Date.parse(dailyData.daily.sunrise[index]) / 1000,
          sunset: Date.parse(dailyData.daily.sunset[index]) / 1000,
        };
      });
      setHourly(data2.list.slice(0, 8));
      setForecast(nextDays);

    } catch (err) {
      console.log("Error fetching data:", err);
      setError(err.message || "Weather data unavailable");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!cityParam) {
      setWeather(null);
      setForecast([]);
      setHourly([]);
      setError(false);
      return;
    }

    getWeather(decodeURIComponent(cityParam));
    if (inputRef.current) inputRef.current.value = decodeURIComponent(cityParam);
  }, [cityParam]);

  const submitSearch = () => {
    const city = inputRef.current?.value.trim();
    if (city) navigate(`/weather/${encodeURIComponent(city)}`);
  };

  const getDisplayData = () => {
    if (!weather) return null;
    if (!selectedDay) {
      const cityDate = new Date((weather.timestamp + weather.timezone) * 1000);
      return {
        ...weather,
        title: cityDate.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" }),
        date: cityDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }),
        localTime: cityDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" }),
      };
    }

    const forecastDate = new Date(`${selectedDay.dt_txt.replace(" ", "T")}Z`);
    
    return {
      title: forecastDate.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" }),
      date: forecastDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }),
      localTime: forecastDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" }),
      city: weather.city,
      temp: Math.floor(selectedDay.main.temp),
      high: Math.floor(selectedDay.main.temp_max),
      low: Math.floor(selectedDay.main.temp_min),
      feelsLike: Math.floor(selectedDay.main.feels_like),
      humidity: selectedDay.main.humidity,
      wind: selectedDay.wind.speed,
      sunrise: selectedDay.sunrise ?? weather.sunrise,
      sunset: selectedDay.sunset ?? weather.sunset,
      precipitation: Math.round(selectedDay.pop * 100),
      seaLevel: selectedDay.main.sea_level ? `${selectedDay.main.sea_level} hPa` : "N/A",
      icon: icons[selectedDay.weather[0].icon] || sunny,
      condition: getConditionLabel(selectedDay.weather[0].icon, selectedDay.weather[0].description),
      desc: selectedDay.weather[0].description,
    };
  };

  const displayData = getDisplayData();

  return (
    <div className={`weather ${selectedDay ? getTheme(selectedDay.weather[0].icon) : theme} ${timeOfDay}`}>
      <BackgroundAnimation weatherType={selectedDay ? getTheme(selectedDay.weather[0].icon) : theme} timeOfDay={timeOfDay} />

      <div className="weather-content">
        <div className="search-area">
          <div className="search-bar slide-down">
            <input ref={inputRef} placeholder="Search city..." onKeyDown={(e) => e.key === 'Enter' && submitSearch()} />
            <img className="search-icon" src={searchicon} alt="Search" onClick={submitSearch} />
          </div>
        </div>

        {loading && <div className="loading-spinner fade-in">Loading weather data...</div>}
        {error && <div className="error-message fade-in">{error}</div>}
        {!loading && !error && !displayData && (
          <div className="empty-state fade-in">
            <p>Search for a city to view live weather.</p>
          </div>
        )}

        {!loading && !error && displayData && (
          <div className="centered-layout fade-up">
            
            <div className="main-display-card">
              <div className="main-display-content">
                <div className="weather-heading">
                  <h3 className="city-name">{displayData.city}</h3>
                  <p className="detail-title">{displayData.title}</p>
                  <p className="date-time">{displayData.date} · {displayData.localTime}</p>
                </div>
                <div className="temperature-display">
                  <h2 className="main-temp">{displayData.temp > 0 ? "+" : ""}{displayData.temp}°C</h2>
                  <p className="condition-name">{displayData.condition}</p>
                </div>
                <img className="main-icon float-anim" src={displayData.icon} alt={displayData.desc} />
                <div className="stats-grid">
                  <div className="stat-item temperature-range">
                    <img src={temperatureIcon} alt="High and low temperature" />
                    <div><p>High / Low</p><span>Hi {displayData.high}° · Lo {displayData.low}°</span></div>
                  </div>
                  <div className="stat-item">
                    <img src={temperatureIcon} alt="Feels like" />
                    <div><p>Feels like</p><span>{displayData.feelsLike}°C</span></div>
                  </div>
                  <div className="stat-item">
                    <img src={humidityIcon} alt="Humidity" />
                    <div><p>Humidity</p><span>{displayData.humidity}%</span></div>
                  </div>
                  <div className="stat-item">
                    <img src={windIcon} alt="Wind" />
                    <div><p>Wind</p><span>{displayData.wind} km/h</span></div>
                  </div>
                  <div className="stat-item">
                    <img src={rain} alt="Precipitation" />
                    <div><p>Precip</p><span>{displayData.precipitation}%</span></div>
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
                    <img src={temperatureIcon} alt="Pressure" />
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

            <div className="forecast-container">
              <div className="horizontal-list scroll fade-up-stagger-1">
                {forecast.slice(0, 7).map((item, i) => (
                  <div 
                    className={`card-item ${selectedDay === item ? "active" : ""}`} 
                    key={i}
                    onClick={() => setSelectedDay(item)}
                  >
                    <p className="card-time">{new Date(item.dt_txt).toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()}</p>
                    <img src={icons[item.weather[0].icon] || sunny} alt="" />
                    <p className="card-temp">{Math.floor(item.main.temp)}°</p>
                  </div>
                ))}
              </div>

              <div className="horizontal-list scroll fade-up-stagger-2 hourly-list">
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
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Weather;