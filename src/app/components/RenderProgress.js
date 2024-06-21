import { useEffect, useState } from "react";
import LinearProgressWithLabel from "./LinearProgressWithLabel";

const DURATION_MULTIPLIER = 25;
export const RenderProgress = ({ duration }) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const totalDuration = (duration * DURATION_MULTIPLIER) / 1000;
    const increment = 100 / totalDuration;

    const interval = setInterval(() => {
      setValue((prevValue) => {
        if (prevValue + increment >= 100) {
          clearInterval(interval);
          return prevValue;
        }

        return prevValue + increment;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [duration]);

  return <LinearProgressWithLabel value={value} />;
};

export default RenderProgress;
