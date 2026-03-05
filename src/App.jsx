import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import * as THREE from 'three';
import { Aperture, Download, Search, Loader2, ArrowUpRight, Monitor, Smartphone, Zap } from 'lucide-react';

export default function App() {
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('Abstract');
  const [searchTerm, setSearchTerm] = useState('');
  const [deviceType, setDeviceType] = useState(window.innerWidth < 768 ? 'portrait' : 'landscape');
  const [view, setView] = useState('home');
  const canvasRef = useRef(null);

  useEffect(() => {
    // 1. Immersive 3D Starfield (Warp Effect)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 6000; i++) vertices.push(THREE.MathUtils.randFloatSpread(2000));
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const stars = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0x00f3ff, size: 0.9, transparent: true, opacity: 0.4 }));
    scene.add(stars);
    camera.position.z = 500;
    
    const animate = () => { 
        requestAnimationFrame(animate); 
        stars.position.z += 1.5; // Warp Effect
        if(stars.position.z > 500) stars.position.z = -500;
        renderer.render(scene, camera); 
    };
    animate();

    // 2. Cinematic Character-by-Character Text Reveal
    const tl = gsap.timeline();
    tl.to(".logo-char", { opacity: 1, y: 0, duration: 1.2, stagger: 0.1, ease: "expo.out" })
      .to("#intro", { y: "-100%", delay: 0.6, duration: 1.4, ease: "expo.inOut", onComplete: () => fetchWalls(category, deviceType) });
  }, []);

  const fetchWalls = async (q, orientation) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/get-wallpapers?query=${encodeURIComponent(q)}&orientation=${orientation}`);
      const data = await res.json();
      setWallpapers(data.photos || []);
      // Animate images with a stagger delay
      gsap.fromTo(".wall-card", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power3.out" });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleDeviceSwitch = (type) => {
    setDeviceType(type);
    fetchWalls(category, type);
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-cyan-500/30">
      
      {/* Cinematic Intro Overlay */}
      <div id="intro" className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 opacity-50" />
        <div className="relative z-10 text-center">
            <h1 id="logo" className="text-5xl md:text-9xl font-black tracking-[0.5em] text-white uppercase italic text-glow flex gap-3">
                {/* Character splitting for animation */}
                {"ASTHEX".split("").map((char, index) => (
                    <span key={index} className="logo-char inline-block opacity-0 translate-y-10">{char}</span>
                ))}
            </h1>
            <p className="logo-char opacity-0 translate-y-10 text-cyan-400 tracking-[1.2em] text-[10px] mt-6 uppercase font-bold">Neural Visual Archive</p>
        </div>
      </div>

      {/* Floating Glass Navbar */}
      <nav className="fixed top-8 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50 bg-white/[0.03] backdrop-blur-3xl border border-white/5 px-8 py-5 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => fetchWalls('Abstract', deviceType)}>
          <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center group-hover:rotate-180 transition-all duration-700 shadow-[0_0_20px_rgba(0,243,255,0.4)]">
            <Aperture className="text-black" size={24}/>
          </div>
          <span className="font-black tracking-[0.3em] text-2xl italic uppercase">ASTHEX</span>
        </div>
        
        {/* Device Switcher */}
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 scale-90 md:scale-100">
            <button onClick={() => handleDeviceSwitch('portrait')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all text-[10px] font-black tracking-widest uppercase ${deviceType === 'portrait' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30' : 'text-gray-500 hover:text-white'}`}>
                <Smartphone size={14}/> Mobile
            </button>
            <button onClick={() => handleDeviceSwitch('landscape')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all text-[10px] font-black tracking-widest uppercase ${deviceType === 'landscape' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30' : 'text-gray-500 hover:text-white'}`}>
                <Monitor size={14}/> Desktop
            </button>
        </div>

        <div className="flex gap-6 overflow-x-auto no-scrollbar py-1 scale-90 md:scale-100">
          {['Cyber', 'Abstract', 'Minimal', 'Nature'].map(cat => (
            <button key={cat} onClick={() => {setCategory(cat); fetchWalls(cat, deviceType)}} className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all relative ${category === cat ? 'text-cyan-400' : 'text-gray-500 hover:text-white'}`}>
                {cat}
                {category === cat && <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-cyan-400 blur-[1px]"></span>}
            </button>
          ))}
        </div>
      </nav>

      {view === 'home' ? (
        <main className="pt-60 px-6 max-w-[1800px] mx-auto pb-40">
          
          <header className="mb-20 flex flex-col md:flex-row justify-between items-end border-b border-white/5 pb-10 pl-6">
            <div>
              <div className="flex items-center gap-2 mb-3 text-cyan-500 font-bold tracking-[0.5em] text-[10px] uppercase"><Zap size={14}/> Powered by Pixels</div>
              <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter italic">/{category}</h2>
            </div>
            <p className="max-w-xs text-[10px] text-gray-500 leading-loose tracking-[0.2em] uppercase italic hidden md:block">Hand-curated visuals for OLED & UHD panels.</p>
          </header>

          {loading ? (
            <div className="h-[40vh] flex flex-col items-center justify-center gap-4 text-cyan-400 italic tracking-[1em] font-black animate-pulse uppercase text-[10px]"><Loader2 className="animate-spin" size={28}/> Reconstructing Reality</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 auto-rows-[450px]">
              {wallpapers.map((p, index) => (
                <div key={p.id} className={`wall-card relative group rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-white/5 transition-all duration-700 hover:border-cyan-500/40 ${deviceType === 'landscape' && index % 5 === 0 ? 'md:col-span-2' : ''}`}>
                  <img src={p.src.large2x || p.src.large} alt="4K Wallpaper" className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0" loading="lazy" />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 p-10 flex flex-col justify-end text-white">
                    <div className="flex justify-between items-center border-t border-white/10 pt-6">
                      <div className="truncate pr-4">
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Artist</p>
                        <p className="text-sm font-black tracking-widest uppercase truncate italic">{p.photographer}</p>
                      </div>
                      <a href={p.src.original} target="_blank" rel="noreferrer" className="bg-white text-black p-4 rounded-3xl hover:bg-cyan-400 hover:scale-110 transition-all shadow-2xl flex-shrink-0">
                        <Download size={20}/>
                      </a>
                    </div>
                  </div>
                  <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-500"><ArrowUpRight className="text-cyan-400" size={24}/></div>
                </div>
              ))}
            </div>
          )}
        </main>
      ) : (
        <div className="pt-56 px-12 max-w-5xl mx-auto min-h-screen text-white uppercase tracking-widest">
            <h1 className="text-6xl font-black text-cyan-400 mb-8 italic tracking-tighter border-b border-white/10 pb-6">{view}</h1>
            <p className="text-gray-500 leading-loose italic border-l-2 border-cyan-500 pl-8 space-y-4">Premium visuals. Optimized for OLED. Designed for visionaries. Asthex provides ultra-HD assets for personal digital curation.</p>
            <button onClick={() => setView('home')} className="mt-16 bg-white text-black px-12 py-5 rounded-full font-black text-[10px] hover:bg-cyan-400 transition-all tracking-[0.2em]">Return to Gallery</button>
        </div>
      )}

      {/* Luxury Footer */}
      <footer className="bg-black/50 border-t border-white/5 py-32 px-12 mt-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-16">
          <div className="max-w-md">
            <h3 className="text-4xl font-black tracking-[0.3em] mb-6 italic uppercase">ASTHEX</h3>
            <p className="text-[10px] text-gray-600 uppercase tracking-widest leading-loose font-bold border-l-2 border-cyan-500 pl-8 italic">Neural Visual Archive. Powered by Pixels. Optimized for OLED panels.</p>
          </div>
          <div className="flex gap-16 text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">
             <div className="flex flex-col gap-5">
                <span className="text-white mb-2 tracking-[1em]">Archive</span>
                <button onClick={() => setView('about')} className="text-left hover:text-cyan-400">Vision</button>
                <button onClick={() => setView('privacy')} className="text-left hover:text-cyan-400">Privacy Neural</button>
             </div>
          </div>
        </div>
        <div className="mt-32 pt-12 border-t border-white/5 text-center text-[9px] text-gray-800 font-black tracking-[1.5em] uppercase">© 2024 ASTHEX ARCHIVE | NEURAL VISUALS</div>
      </footer>
    </div>
  );
                }
              
