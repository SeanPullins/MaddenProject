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

const landingVideoUrl = `${import.meta.env.BASE_URL}videos/league-intro.mp4?v=2`;
const landingVideoPosterUrl = `${import.meta.env.BASE_URL}videos/league-intro-poster.jpg?v=2`;

export const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
  const [imageIndex, setImageIndex] = useState(0);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const landingImageUrl = landingImageUrls[imageIndex];

  const handleImageError = () => {
    setImageIndex((currentIndex) =>
      currentIndex < landingImageUrls.length - 1 ? currentIndex + 1 : currentIndex
    );
  };

  return (
    <>
      <div className="min-h-screen bg-slate-950 flex flex-col">
        {/* Hero Section */}
        <div className="relative w-full bg-slate-950">
          <img
            src={landingImageUrl}
            alt="Madden Fantasy Football"
            className="w-full h-[52vh] md:h-[62vh] object-cover"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-950/60 to-slate-950" />
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col items-center justify-start px-6 -mt-28 relative z-10 pb-16">
          <div className="max-w-5xl w-full text-center space-y-7">
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tight">
              Madden Fantasy Football League
            </h1>

            <p className="inline-block text-2xl md:text-3xl text-slate-950 font-display tracking-wide bg-brand-500 px-3 py-1">
              Build. Draft. Develop. Dominate.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={() => onNavigate(Page.DASHBOARD)}
                className="bg-brand-500 hover:bg-brand-600 text-white font-display font-bold text-xl px-12 py-4 rounded-lg transition-colors shadow-lg hover:shadow-brand-500/50"
              >
                Enter League
              </button>

              <button
                onClick={() => setIsTrailerOpen(true)}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-display font-bold text-xl px-12 py-4 rounded-lg transition-colors shadow-lg"
              >
                ▶ Play Trailer
              </button>
            </div>

            {/* Trailer Preview Card */}
            <button
              onClick={() => setIsTrailerOpen(true)}
              className="group block w-full max-w-3xl mx-auto rounded-2xl overflow-hidden border border-slate-700 bg-slate-900/90 shadow-2xl text-left transition-transform hover:scale-[1.01]"
            >
              <div className="relative aspect-video bg-black">
                <img
                  src={landingVideoPosterUrl}
                  alt="League trailer preview"
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-95 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                  <div className="w-20 h-20 rounded-full bg-brand-500 text-white flex items-center justify-center text-4xl shadow-2xl group-hover:bg-brand-600 transition-colors pl-1">
                    ▶
                  </div>
                </div>
              </div>
              <div className="px-5 py-4 border-t border-slate-700">
                <div className="text-white font-display font-bold text-xl">League Trailer</div>
                <div className="text-slate-400 text-sm mt-1">Click anywhere on this card to watch the intro.</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {isTrailerOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-5xl rounded-2xl overflow-hidden bg-slate-950 border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
              <div>
                <div className="text-white font-display font-bold text-xl">League Trailer</div>
                <div className="text-slate-400 text-sm">Use the controls below to play, pause, or go fullscreen.</div>
              </div>
              <button
                onClick={() => setIsTrailerOpen(false)}
                className="text-slate-300 hover:text-white text-3xl leading-none px-3 py-1"
                aria-label="Close trailer"
              >
                ×
              </button>
            </div>

            <video
              className="w-full bg-black aspect-video"
              controls
              autoPlay
              playsInline
              preload="metadata"
              poster={landingVideoPosterUrl}
            >
              <source src={landingVideoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </>
  );
};