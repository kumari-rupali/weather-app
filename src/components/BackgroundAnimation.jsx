import React from "react";
import "./BackgroundAnimation.css";

const BackgroundAnimation = ({ weatherType, timeOfDay }) => {
  // Helpers to generate random elements for rain/snow/stars
  const renderDrops = (count, className) => {
    return Array.from({ length: count }).map((_, i) => {
      const left = `${Math.random() * 100}%`;
      const animationDuration = `${Math.random() * 1 + 0.5}s`;
      const animationDelay = `${Math.random() * 2}s`;
      return (
        <div
          key={i}
          className={className}
          style={{ left, animationDuration, animationDelay }}
        ></div>
      );
    });
  };

  const renderStars = (count) => {
    return Array.from({ length: count }).map((_, i) => {
      const left = `${Math.random() * 100}%`;
      const top = `${Math.random() * 50}%`;
      const animationDuration = `${Math.random() * 3 + 2}s`;
      const animationDelay = `${Math.random() * 5}s`;
      return (
        <div
          key={i}
          className="star"
          style={{ left, top, animationDuration, animationDelay }}
        ></div>
      );
    });
  };

  const renderClouds = (count) => {
    return Array.from({ length: count }).map((_, i) => {
      const top = `${Math.random() * 30 + 10}%`;
      const animationDuration = `${Math.random() * 20 + 40}s`;
      const animationDelay = `-${Math.random() * 30}s`;
      const scale = Math.random() * 0.5 + 0.5;
      const opacity = Math.random() * 0.5 + 0.3;
      return (
        <div
          key={i}
          className="cloud"
          style={{
            top,
            animationDuration,
            animationDelay,
            transform: `scale(${scale})`,
            opacity,
          }}
        ></div>
      );
    });
  };

  return (
    <div className={`bg-container ${timeOfDay} ${weatherType}`}>
      {/* Sun or Moon based on time */}
      {timeOfDay !== "night" && <div className={`sun ${timeOfDay}`}></div>}
      {timeOfDay === "night" && <div className="moon"></div>}

      {/* Stars at night */}
      {timeOfDay === "night" && <div className="stars-container">{renderStars(50)}</div>}

      {/* Clouds */}
      {(weatherType === "cloudy" || weatherType === "rainy" || weatherType === "snowy") && (
        <div className="clouds-container">{renderClouds(2)}</div>
      )}

      {/* Rain Drops */}
      {weatherType === "rainy" && (
        <div className="rain-container">
          {renderDrops(60, "rain-drop")}
        </div>
      )}

      {/* Snow Flakes */}
      {weatherType === "snowy" && (
        <div className="snow-container">
          {renderDrops(50, "snow-flake")}
        </div>
      )}

      {/* Thunder Flash */}
      {weatherType === "thunderstorm" && (
        <>
          <div className="rain-container">{renderDrops(80, "rain-drop")}</div>
          <div className="thunder-flash"></div>
        </>
      )}
    </div>
  );
};

export default BackgroundAnimation;
