import { useState, useEffect } from "react";

export default function Timer({
  initialTimeRemaining,
}: {
  initialTimeRemaining: number;
}) {
  const [timeRemaining, setTimeRemaining] = useState(initialTimeRemaining);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    let interval;
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [timeRemaining]);

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="text-xl font-bold text-gray-900 dark:text-gray-50">
        {Math.floor(timeRemaining / 60)}:
        {String((timeRemaining % 60).toFixed(0)).padStart(2, "0")}
      </div>
    </div>
  );
}
