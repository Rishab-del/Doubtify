import React, { Suspense, lazy } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));

function InteractiveRobotSpline({ scene, className }) {
  return (
    <Suspense
      fallback={
        <div className={`w-full h-full flex items-center justify-center bg-black text-white ${className}`}>
          Loading 3D...
        </div>
      }
    >
      <Spline scene={scene} className={className} />
    </Suspense>
  );
}

export default InteractiveRobotSpline;