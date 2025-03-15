import { useEffect } from "react";
import { tailspin } from "ldrs";
import { ring2 } from "ldrs";
import { lineSpinner } from "ldrs";

const Loader1 = ({ size = "25" }: { size?: string }) => {
  useEffect(() => {
    tailspin.register();
    ring2.register();
    lineSpinner.register();
  }, []);

  return (
    <div key={Date.now()} className="flex justify-center items-center w-100 h-[500px]">
      <l-ring-2
        size={size}
        stroke="1.5"
        stroke-length="0.2"
        bg-opacity="0.30"
        speed="0.65"
        color="#666666"
      ></l-ring-2>
    </div>
  );
};

const loader2 = () => {
  return (
    <div>
      {/* vercel - template */}
      <div className="flex justify-center items-center w-100 h-[500px]">
        <l-line-spinner
          size="30"
          stroke="1.25"
          speed=".7"
          color="#666666"
        ></l-line-spinner>
      </div>
    </div>
  );
};

export default Loader1;