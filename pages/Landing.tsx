import React, { useState } from 'react';
import { Page } from '../types';

interface LandingProps {
  onNavigate: (page: Page) => void;
}

const landingImageUrls = [
  `${import.meta.env.BASE_URL}LandingPage.jpg?v=4`,
  '/MaddenProject/LandingPage.jpg?v=4',
  './LandingPage.jpg?v=4',
];

export const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
  const [imageIndex, setImageIndex] = useState(0);
  const landingImageUrl = landingImageUrls[imageIndex];

  const handleImageError = () => {
    setImageIndex((currentIndex) =>
      currentIndex < landingImageUrls.length - 1 ? currentIndex + 1 : currentIndex
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Hero Section */}
      <div className="relative w-full bg-slate-950">
        <img
          src={landingImageUrl}
          alt="Madden Fantasy Football"
          className="w-full h-[60vh] md:h-[70vh] object-cover"
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/60 to-slate-950" />
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-32 relative z-10">
        <div className="max-w-4xl w-full text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tight">
            Madden Fantasy Football League
          </h1>

          <p className="text-2xl md:text-3xl text-slate-300 font-display tracking-wide">
            Build. Draft. Develop. Dominate.
          </p>

          <div className="pt-8">
            <button
              onClick={() => onNavigate(Page.DASHBOARD)}
              className="bg-brand-500 hover:bg-brand-600 text-white font-display font-bold text-xl px-12 py-4 rounded-lg transition-colors shadow-lg hover:shadow-brand-500/50"
            >
              Enter League
            </button>
          </div>
        </div>
      </div>

      <div className="h-16" />
    </div>
  );
};
