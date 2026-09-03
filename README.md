# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:


# Weather App

A responsive React weather dashboard that shows live current conditions, hourly data, and a seven-day forecast for any searched city.

## Features

- Live current weather data from OpenWeather
- Seven-day daily forecast from Open-Meteo
- Hourly forecast from OpenWeather
- Searchable city routes such as `/weather/London`
- Browser back and forward navigation
- Forecast-day selection with detailed weather information
- Responsive layout for desktop, tablet, and mobile screens
- Animated backgrounds for sunny, cloudy, rainy, snowy, and stormy conditions
- No mock or hardcoded weather data

## Requirements

- Node.js 18 or newer
- An OpenWeather API key

## Setup

1. Install dependencies:

	```bash
	npm install
	```

2. Create a `.env` file in the project root:

	```env
	VITE_APP_ID=your_openweather_api_key
	```

3. Start the development server:

	```bash
	npm run dev
	```

4. Open the local URL shown by Vite, usually `http://localhost:5173`.

The home page opens with a search field. Search for a city to open its weather route.

## Routes

| Route | Description |
| --- | --- |
| `/` | Search screen |
| `/weather/:city` | Live weather for the selected city |

## Commands

```bash
npm run dev       # Start the development server
npm run build     # Create a production build
npm run preview   # Preview the production build locally
npm run lint      # Run ESLint
```

## Data Sources

- **OpenWeather** provides current weather and hourly forecast data. It requires the `VITE_APP_ID` environment variable.
- **Open-Meteo** provides the seven-day daily forecast using the coordinates returned by OpenWeather. It does not require a separate API key.

## Project Structure

```text
src/
  App.jsx                         Application routes
  main.jsx                        React entry point
  index.css                       Global styles and fonts
  components/
	 Weather.jsx                   Weather fetching and dashboard UI
	 Weather.css                   Dashboard and responsive styles
	 BackgroundAnimation.jsx       Weather-based animated background
	 BackgroundAnimation.css       Background animation styles
  assets/                         Weather and interface images
```

## Notes

- Weather data requires an active internet connection.
- Invalid city names show an error state instead of fabricated weather values.
- Keep `.env` private and do not commit API keys to source control.
