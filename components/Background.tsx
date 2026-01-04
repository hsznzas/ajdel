import React from 'react';

const Background: React.FC = () => {
  return (
    <>
      {/* Background - lowest layer */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-[#012842]" />
      
      {/* Particles - middle layer, behind buttons but in front of background */}
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