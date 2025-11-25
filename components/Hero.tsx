import React from 'react';
import { ArrowRight, Globe, Users, Sparkles } from 'lucide-react';

interface HeroProps {
  onStart: () => void;
  onViewDemo: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStart, onViewDemo }) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-12 lg:py-0">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full bg-slate-950 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-600/20 rounded-full blur-[120px] animate-pulse opacity-50 lg:opacity-100"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent-purple/20 rounded-full blur-[120px] animate-float opacity-50 lg:opacity-100"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        
        {/* Left Content */}
        <div className="space-y-8 text-center lg:text-left flex flex-col items-center lg:items-start">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-brand-300 text-sm font-medium shadow-sm">
            <Sparkles size={16} />
            <span>AI-Powered MUN Management</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-[1.1] tracking-tight text-white max-w-3xl">
            Organize <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-brand-200 to-accent-purple">
              HASHMUN
            </span> <br />
            in Seconds.
          </h1>
          
          <p className="text-xl text-slate-400 max-w-lg mx-auto lg:mx-0 leading-relaxed">
            Stop manually building tables for 60+ delegates. Chat with our AI to instantly generate, export, and share beautiful committee matrices.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center lg:justify-start">
            <button 
              onClick={onStart}
              className="group relative px-8 py-4 bg-white text-slate-950 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] transition-all duration-300 overflow-hidden w-full sm:w-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <span className="relative flex items-center justify-center gap-2">
                Launch App <ArrowRight size={20} />
              </span>
            </button>
            <button 
              onClick={onViewDemo}
              className="px-8 py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white font-medium transition-colors w-full sm:w-auto"
            >
              View Demo
            </button>
          </div>
        </div>

        {/* Right 3D Visual Mockup */}
        <div className="relative perspective-[2000px] group mx-auto max-w-lg lg:max-w-none w-full">
          {/* Card Container - Scaled for mobile to fit, full size on desktop */}
          <div className="relative w-full aspect-square transform transition-all duration-700 hover:rotate-y-[-10deg] hover:rotate-x-[10deg] preserve-3d scale-90 sm:scale-100">
            
            {/* Main Interface Card */}
            <div className="absolute inset-4 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 transform translate-z-[50px]">
              <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div className="ml-auto text-xs text-slate-500 font-mono">HASHMUN_DASHBOARD.EXE</div>
              </div>
              
              {/* Fake Chat UI */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-xs font-bold text-white">AI</div>
                  <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none text-sm text-slate-300">
                    Hello President! Send me the delegate list for the upcoming conference.
                  </div>
                </div>
                <div className="flex items-start gap-3 flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold text-white">ME</div>
                  <div className="bg-brand-600 p-3 rounded-2xl rounded-tr-none text-sm text-white">
                    Here are the 15 delegates for DISEC...
                  </div>
                </div>
                <div className="h-24 bg-white/5 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-slate-500 text-xs mt-4">
                  <Globe size={16} className="mr-2 animate-spin" />
                  Generating Matrix...
                </div>
              </div>
            </div>

            {/* Floating Elements - Animated */}
            <div className="absolute -right-4 lg:-right-8 top-20 bg-slate-800 p-4 rounded-xl border border-white/10 shadow-xl transform translate-z-[100px] animate-float">
              <Users size={24} className="text-brand-400 mb-2" />
              <div className="text-2xl font-bold text-white">60+</div>
              <div className="text-xs text-slate-400">Delegates Managed</div>
            </div>
            
             <div className="absolute -left-4 lg:-left-8 bottom-20 bg-slate-800 p-4 rounded-xl border border-white/10 shadow-xl transform translate-z-[80px] animate-float delay-1000">
              <Globe size={24} className="text-accent-purple mb-2" />
              <div className="text-2xl font-bold text-white">12</div>
              <div className="text-xs text-slate-400">Committees Active</div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;