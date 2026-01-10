import React from 'react';

const Background: React.FC = () => {
  return (
    <>
      {/* Background - gradient layer (brand navy tones) */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-b from-[#1f405f] via-[#153450] to-[#07192d]" />
      
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