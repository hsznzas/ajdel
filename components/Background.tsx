import React from 'react';

const Background: React.FC = () => {
  return (
    <>
      {/* Background - gradient layer */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-b from-[#023550] via-[#012842] to-[#011e35]" />
      
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