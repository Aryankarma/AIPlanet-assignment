import React, { useState, useEffect } from "react";
import { useNavigationType, useLocation } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

const LoadingProgress = () => {
  const [progressValue, setProgressValue] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const navigationType = useNavigationType();
  const location = useLocation();

  useEffect(() => {
    if (navigationType) {
      setIsNavigating(true);
      simulateProgress();
    }
  }, [location]); // Trigger progress bar on route change

  // useEffect(() => {
  //   setProgressValue(0);
  //   simulateProgress();
  // }, [location]); // Trigger progress bar on route change

  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      if (progress < 75 && isNavigating) {
        progress += 10;
        setProgressValue(progress);
      } else if (!isNavigating) {
        clearInterval(interval);
        setProgressValue(100);
        setTimeout(() => setProgressValue(0), 500); // Reset after completing
      }
    }, 75); // Adjust speed of the progress bar
  };

  useEffect(() => {
    if (progressValue === 100) {
      setIsNavigating(false);
    }
  }, [progressValue]);

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50">
      <Progress value={progressValue} />
    </div>
  );
};

export default LoadingProgress;
