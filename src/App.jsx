import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import * as THREE from 'three';
import { Aperture, Download, Search, Loader2, ArrowUpRight, ShieldCheck, Zap } from 'lucide-react';

export default function App() {
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('Abstract');
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('home');
  const canvasRef = useRef(null);

  const getOrientation = () => (window.innerWidth < 768) ? 'portrait' : 'landscape';

  useEffect(() => {
    // 1. Particle Background (Improved)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 6000; i++) vertices.push(THREE.MathUtils.randFloatSpread(2000));
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const stars = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0x00f3ff, size: 0.8, transparent: true, opacity: 0.4 }));
    scene.add(stars);
    camera.position.z = 500;
    const animate = () => { requestAnimationFrame(animate); stars.rotation.x += 0.0005; stars.rotation.y += 0.0005; renderer.render(scene, camera); };
    animate();

    // 2. Cinematic Slide-Up Intro
    const tl = gsap.timeline();
    tl.to("#logo", { opacity: 1, y: 0, scale: 1, duration: 1.8, ease: "expo.out" })
      .to("#intro", { y: "-100%", duration: 1.5, ease: "expo.inOut", delay: 0.5, onComplete: () => fetchWalls(category) });
  }, []);

  const fetchWalls = async (q) => {
    setLoading(true);
    const orientation = getOrientation();
    try {
      const res = await fetch(`/api/get-wallpapers?query=${encodeURIComponent(q)}&orientation=${orientation}`);
      const data = await res.json();
      setWallpapers(data.photos || []);
      // Animate images in
      gsap.fromTo(".wall-card", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power2.out" });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const renderPage = (title, content) => (
    <div className="pt-48 px-8 max-w-5xl mx-auto min-h-screen text-white">
      <h1 className="text-5xl font-black text-cyan-400 mb-8 uppercase italic tracking-tighter">{title}</h1>
      <div className="text-gray-400 leading-loose text-lg border-l border-white/10 pl-8 space-y-6 italic">{content}</div>
      <button onClick={() => setView('home')} className="mt-16 bg-white text-black px-10 py-4 rounded-full font-bold hover:bg-cyan-400 transition-all uppercase text-xs tracking-[0.3em]">Return to Archive</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-cyan-500/40 font-sans">
      
      {/* Intro Reveal */}
      <div id="intro" className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 opacity-50" />
        <div id="logo" className="relative z-10 opacity-0 translate-y-20 scale-90 text-center">
            <h1 className="text-5xl md:text-9xl font-black tracking-[0.6em] text-white uppercase italic">ASTHEX</h1>
            <p className="text-cyan-400 tracking-[1em] text-[10px] mt-4 uppercase font-bold">Neural Visual Archive</p>
        </div>
      </div>

      {/* Floating Glass Navbar */}
      <nav className="fixed top-8 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50 bg-white/[0.03] backdrop-blur-3xl border border-white/5 px-8 py-5 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => fetchWalls('Abstract')}>
          <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center group-hover:rotate-[180deg] transition-all duration-700 shadow-[0_0_20px_rgba(0,243,255,0.5)]">
            <Aperture className="text-black" size={24}/>
          </div>
          <span className="font-black tracking-[0.3em] text-2xl italic">ASTHEX</span>
        </div>
        
        <div className="flex gap-8 overflow-x-auto no-scrollbar px-4">
          {['Cyber', 'Nature', 'Amoled', 'Minimal'].map(cat => (
            <button key={cat} onClick={() => {setCategory(cat); fetchWalls(cat)}} className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all relative pb-2 ${category === cat ? 'text-cyan-400' : 'text-gray-500 hover:text-white'}`}>
                {cat}
                {category === cat && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_10px_#00f3ff]"></span>}
            </button>
          ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); fetchWalls(searchTerm); }} className="relative group">
          <input type="text" placeholder="DISCOVER..." className="bg-transparent border-b border-white/10 py-2 px-6 text-[11px] tracking-widest outline-none focus:border-cyan-400 transition-all w-40 focus:w-60 uppercase font-bold" onChange={(e) => setSearchTerm(e.target.value)} />
          <Search className="absolute right-0 top-2.5 w-4 h-4 text-gray-600 group-focus-within:text-cyan-400" />
        </form>
      </nav>

      {view === 'home' ? (
        <main className="pt-56 px-6 max-w-[1800px] mx-auto pb-40">
          
          {/* Header */}
          <header className="mb-20 flex flex-col md:flex-row justify-between items-end border-b border-white/5 pb-12">
            <div>
              <div className="flex items-center gap-2 mb-4 text-cyan-500 font-bold tracking-[0.5em] text-[10px] uppercase">
                <Zap size={14}/> Powered by Neural Assets
              </div>
              <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter italic">/{category}</h2>
            </div>
            <div className="max-w-xs text-right hidden md:block">
                <p className="text-[10px] text-gray-500 uppercase leading-loose tracking-widest font-bold italic">Curating the world's most aesthetic 4K assets for high-end digital environments.</p>
            </div>
          </header>

          {loading ? (
            <div className="h-[50vh] flex flex-col items-center justify-center gap-8 opacity-20 tracking-[1.5em] text-xs font-black text-cyan-400 italic animate-pulse">
                <Loader2 className="animate-spin" size={40}/> RECONSTRUCTING REALITY
            </div>
          ) : (
            /* Bento Grid 2.0 */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 auto-rows-[450px]">
              {wallpapers.map((p, index) => (
                <div key={p.id} className={`wall-card relative group rounded-[2.5rem] overflow-hidden bg-[#0a0a0a] border border-white/5 transition-all duration-700 hover:border-cyan-500/50 hover:shadow-[0_0_60px_rgba(0,243,255,0.1)] ${index % 6 === 0 ? 'md:col-span-2 md:row-span-1' : index % 4 === 0 ? 'md:row-span-2' : ''}`}>
                  <img src={p.src.large2x || p.src.large} alt="4K Visual" className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110 grayscale-[40%] group-hover:grayscale-0" loading="lazy" />
                  
                  {/* Luxury Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 p-10 flex flex-col justify-end">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-white/10 backdrop-blur-md text-white text-[9px] px-4 py-1.5 rounded-full border border-white/10 font-black uppercase tracking-[0.2em]">4K UHD</span>
                        <span className="text-cyan-400 text-[10px] font-bold tracking-widest uppercase italic">Masterpiece</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-white/10 pt-8">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Visual Artist</p>
                        <p className="text-lg font-black tracking-widest uppercase truncate w-48 italic">{p.photographer}</p>
                      </div>
                      <a href={p.src.original} target="_blank" rel="noreferrer" className="bg-white text-black p-4 rounded-2xl hover:bg-cyan-400 hover:scale-110 hover:-rotate-12 transition-all shadow-2xl">
                        <Download size={22}/>
                      </a>
                    </div>
                  </div>
                  <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-all translate-x-10 group-hover:translate-x-0 duration-700"><ArrowUpRight className="text-cyan-400" size={24}/></div>
                </div>
              ))}
            </div>
          )}
        </main>
      ) : (
        renderPage(view, 
          view === 'about' ? "Asthexwall is not just a gallery; it is a digital sanctuary for visual perfectionists. We leverage advanced API architecture to deliver hand-picked, neural-grade 4K assets. Every pixel is a statement." :
          view === 'privacy' ? "Your neural data belongs to you. We do not track, store, or sell personal identifiers. We utilize industry-standard encryption and transparent cookie policies for Google AdSense integration." :
          "Usage of assets is governed by the global Pexels License. Commercial resale of individual wallpapers is strictly prohibited. Personal customization of digital workspaces is encouraged."
        )
      )}

      {/* Luxury Footer */}
      <footer className="bg-[#050505] border-t border-white/5 py-32 px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-24">
          <div className="max-w-md">
            <h3 className="text-4xl font-black tracking-[0.4em] mb-8 italic">ASTHEX</h3>
            <p className="text-xs text-gray-500 leading-loose uppercase tracking-[0.3em] font-medium border-l-2 border-cyan-500 pl-8">
                Building the future of aesthetic discovery. Optimized for high-end displays. Hand-curated by visionaries.
            </p>
          </div>
          <div className="flex gap-16 md:gap-32">
            <div className="flex flex-col gap-6 text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">
              <span className="text-white mb-2 flex items-center gap-2"><ShieldCheck size={14} className="text-cyan-500"/> ARCHIVE</span>
              <button onClick={() => setView('about')} className="text-left hover:text-cyan-400 transition-colors">Vision</button>
              <button onClick={() => setView('privacy')} className="text-left hover:text-cyan-400 transition-colors">Privacy</button>
            </div>
            <div className="flex flex-col gap-6 text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">
              <span className="text-white mb-2 flex items-center gap-2"><Zap size={14} className="text-cyan-500"/> LEGAL</span>
              <button onClick={() => setView('terms')} className="text-left hover:text-cyan-400 transition-colors">Terms</button>
              <button onClick={() => setView('disclaimer')} className="text-left hover:text-cyan-400 transition-colors">Rights</button>
            </div>
          </div>
        </div>
        <div className="mt-32 pt-12 border-t border-white/5 text-center">
            <p className="text-[10px] text-gray-800 font-black tracking-[1em] uppercase">© 2024 ASTHEXWALL ARCHIVE | ALL RIGHTS RESERVED</p>
        </div>
      </footer>
    </div>
  );
          }
                
