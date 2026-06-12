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

const landingVideoUrl = `${import.meta.env.BASE_URL}videos/league-intro.mp4?v=1`;
const landingVideoPosterUrl = `${import.meta.env.BASE_URL}videos/league-intro-poster.jpg?v=1`;

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
          className="w-full h-[55vh] md:h-[65vh] object-cover"
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/60 to-slate-950" />
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-32 relative z-10">
        <div className="max-w-5xl w-full text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tight">
            Madden Fantasy Football League
          </h1>

          <p className="text-2xl md:text-3xl text-slate-300 font-display tracking-wide">
            Build. Draft. Develop. Dominate.
          </p>

          <div className="pt-4">
            <button
              onClick={() => onNavigate(Page.DASHBOARD)}
              className="bg-brand-500 hover:bg-brand-600 text-white font-display font-bold text-xl px-12 py-4 rounded-lg transition-colors shadow-lg hover:shadow-brand-500/50"
            >
              Enter League
            </button>
          </div>

          {/* Playable Landing Video */}
          <div className="pt-4 max-w-3xl mx-auto">
            <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-900/90 shadow-2xl">
              <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between gap-3">
                <div className="text-left">
                  <div className="text-white font-display font-bold text-lg">League Trailer</div>
                  <div className="text-slate-400 text-sm">Press play to watch the intro</div>
                </div>
              </div>

              <video
                className="w-full bg-black"
                controls
                playsInline
                preload="metadata"
                poster={landingVideoPosterUrl}
              >
                <source src={landingVideoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </div>

      <div className="h-16" />
    </div>
  );
};
