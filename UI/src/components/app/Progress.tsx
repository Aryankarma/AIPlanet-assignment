import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import NProgress from "nprogress";
import "nprogress/nprogress.css"; // Import default styles

NProgress.configure({
    minimum: 0.1,          // Minimum progress percentage before hiding (default: 0.08)
    easing: "ease",        // CSS easing for the progress bar (default: "linear")
    speed: 300,            // Animation speed in milliseconds (default: 200)
    trickle: true,         // Enables trickle progress (default: true)
    trickleSpeed: 500,     // Time in ms for trickle increment (default: 200)
    showSpinner: false,    // Disable the circle spinner (default: true)
});
  
const NProgressLoader = () => {
  const location = useLocation();

  useEffect(() => {
    NProgress.start(); 

    const timer = setTimeout(() => {
      NProgress.done();
    }, 300);

    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [location.pathname]);

  return null;
};

export default NProgressLoader;
