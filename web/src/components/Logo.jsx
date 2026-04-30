import React from "react";

export default function Logo({ className = "w-12 h-12" }) {
  // We've recreated the logo as a high-fidelity SVG to "remove the background and fix it"
  // This ensures perfect scaling, no background, and a sharp enterprise look.
  return (
    <svg 
      viewBox="0 0 200 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Stylized 'A' with Fold Effect */}
      <path 
        d="M20 90L65 10L85 45L70 45L65 35L35 90H20Z" 
        fill="currentColor" 
        className="text-white"
      />
      <path 
        d="M85 45L110 90H95L80 65L70 85L65 75L85 45Z" 
        fill="currentColor" 
        className="text-indigo-400" 
        opacity="0.8"
      />
      
      {/* Stylized 'R' */}
      <path 
        d="M115 10H165C180 10 190 20 190 35C190 50 180 60 165 60H140L170 90H150L125 65H130L170 65C175 65 178 62 178 58V37C178 33 175 30 170 30H130V90H115V10Z" 
        fill="currentColor" 
        className="text-white"
      />
    </svg>
  );
}

export function FullLogo({ className = "h-12" }) {
  return (
    <div className={`flex items-center gap-4 ${className} group cursor-pointer`}>
      <Logo className="w-16 h-8" />
      <div className="flex flex-col justify-center border-l border-slate-700 pl-4">
        <span className="text-white font-black text-2xl leading-none tracking-tighter group-hover:text-indigo-400 transition-colors uppercase">
          AR ASSOCIATE
        </span>
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1">
          Enterprise Engine
        </span>
      </div>
    </div>
  );
}
