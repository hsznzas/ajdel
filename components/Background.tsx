import React from 'react';

const Background: React.FC = () => {
  return (
    <>
      {/* Background - gradient layer (desaturated blue tones) */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-b from-[#0f3545] via-[#0c2d3d] to-[#081f2d]" />
      
      {/* Stars - behind everything */}
      <div className="bg-animation">
        <div id="stars"></div>
        <div id="stars2"></div>
        <div id="stars3"></div>
        <div id="stars4"></div>
      </div>
    </>
  );
};

export default Background;