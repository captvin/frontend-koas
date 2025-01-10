import React from "react";
import "./index.css"; // Buat file CSS untuk styling
// import "bootstrap/dist/css/bootstrap.min.css";
import splash from "../../assets/splash.gif";

const SplashScreen = () => {
  return (
    <div className="splash-screen">
      <img src={splash} alt="Splash" />
    </div>
  );
};

export default SplashScreen;
