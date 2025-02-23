import React, { useEffect, useRef, useState } from 'react'
import './Weather.css';
import searchicon from '../assets/search.png'
import sunny from '../assets/sunny.png'
import humidity from '../assets/humidity.png'
import wind from '../assets/wind.png'
import clouds from "../assets/clouds.png"
import snow from '../assets/snowflake.png'
import rain from '../assets/heavy-rain.png'
import drizzle from '../assets/drizzle.png'

const Weather = () => {

  const inputRef = useRef();
  const [weatherData, setWeatherData] = useState(false);

  const icons = {
    "01d": sunny,
    "01n": sunny,
    "02d": clouds,
    "02n": clouds,
    "03d": clouds,
    "03n": clouds,
    "04d": drizzle,
    "04n": drizzle,
    "09d": rain,
    "09n": rain,
    "10d": rain,
    "10n": rain,
    "13d": snow,
    "13n": snow,
  }

  const search = async (city) => {
    if (city === "") {
      alert("enter city name");
      return;
    }
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${import.meta.env.VITE_APP_ID}`;
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok) {
        alert(data.message);
        return;
      }
      console.log(data);
      const icon = icons[data.weather[0].icon] || sunny;
      setWeatherData({
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        temperature: Math.floor(data.main.temp),
        location: data.name,
        icon: icon,
      })
    } catch (error) {
      setWeatherData(null);
      console.error("errorrrrrr");
    }
  }

  useEffect(() => {
    search("Chennai")
  }, []);

  return (
    <div className='weather'>
      <div className='search-bar'>
        <input ref={inputRef} type='text' placeholder='Enter city name' />
        <img src={searchicon} alt='' onClick={() => search(inputRef.current.value)} />
      </div>
      {weatherData ? 
      <>
        <img src={weatherData.icon} alt='' className='weather-icon' />
        <p className='temperature'>{weatherData.temperature}°C</p>
        <p className='location'>{weatherData.location}</p>

        <div className='weather-data'>
          <div className='col'>
            <img src={humidity} alt='' className='weather-data-icon' />
            <div>
              <p>{weatherData.humidity} %</p>
              <span>Humidity</span>
            </div>
          </div>

          <div className='col'>
            <img src={wind} alt='' className='weather-data-icon' />
            <div>
              <p>{weatherData.windSpeed} Km/hr</p>
              <span>Wind Speed</span>
            </div>
          </div>
        </div>
      </> : 
      <>
      </>
      }
    </div>
  )
}

export default Weather
