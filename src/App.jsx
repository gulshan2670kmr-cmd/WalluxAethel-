import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import * as THREE from 'three';
import { Aperture, Download, Loader2, Monitor, Smartphone, Zap, Search, Shield, Info, FileText } from 'lucide-react';

export default function App() {
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('Abstract');
  const [deviceType, setDeviceType] = useState(window.innerWidth < 768 ? 'portrait' : 'landscape');
  const [view, setView] = useState('home');
  const [searchTerm, setSearchTerm] = useState(''); // Search state add kiya gaya
  const canvasRef = useRef(null);

  // 3D Background Effect (Jo aapne pehle manga tha)
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 5000; i++) vertices.push(THREE.MathUtils.randFloatSpread(2000));
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const stars = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0x22d3ee, size: 0.7, transparent: true, opacity: 0.4 }));
    scene.add(stars);
    camera.position.z = 500;
    const animate = () => { 
      requestAnimationFrame(animate); 
      stars.position.z += 1.5; 
      if(stars.position.z > 500) stars.position.z = -500;
      renderer.render(scene, camera); 
    };
    animate();
  }, []);

  useEffect(() => {
    fetchWalls(category, deviceType);
  }, []);

  const fetchWalls = async (q, orientation) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/get-wallpapers?query=${encodeURIComponent(q)}&orientation=${orientation}`);
      const data = await res.json();
      setWallpapers(data.photos || []);
      gsap.fromTo(".wall-card", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if(searchTerm.trim()) {
      setCategory(searchTerm);
      fetchWalls(searchTerm, deviceType);
      setView('home');
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-cyan-500/30 overflow-x-hidden">
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-30" />
      
      {/* Navbar with Search Bar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[94%] max-w-7xl z-50 glass-nav px-6 py-4 rounded-[2rem] flex flex-col lg:flex-row justify-between items-center gap-4 shadow-2xl border border-white/5">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
          <Aperture className="text-cyan-400" size={24}/>
          <span className="font-black tracking-widest text-xl italic uppercase font-sans">ASTHEXWALL</span>
        </div>

        {/* Search Bar - Fixed Location */}
        <form onSubmit={handleSearch} className="relative w-full max-w-sm group">
          <input 
            type="text" 
            placeholder="Search 4K Wallpapers..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 px-5 py-2 rounded-xl outline-none focus:border-cyan-500/50 transition-all text-sm font-sans"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-cyan-400">
            <Search size={18}/>
          </button>
        </form>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-white/5 p-1 rounded-xl">
            <button onClick={() => {setDeviceType('portrait'); fetchWalls(category, 'portrait')}} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-2 ${deviceType === 'portrait' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30' : 'text-gray-500 hover:text-white'}`}>
              <Smartphone size={14}/> Mobile
            </button>
            <button onClick={() => {setDeviceType('landscape'); fetchWalls(category, 'landscape')}} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-2 ${deviceType === 'landscape' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30' : 'text-gray-500 hover:text-white'}`}>
              <Monitor size={14}/> Desktop
            </button>
          </div>
        </div>
      </nav>

      {view === 'home' ? (
        <main className="relative z-10 pt-60 px-6 max-w-[1700px] mx-auto pb-40">
          <header className="mb-16 border-l-4 border-cyan-500 pl-8">
            <span className="text-cyan-500 text-[10px] font-bold tracking-[0.5em] uppercase flex items-center gap-2 font-sans"><Zap size={12}/> Premium Neural Feed</span>
            <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter font-sans">/{category}</h2>
            <p className="max-w-xl text-[10px] text-gray-500 mt-2 uppercase tracking-[0.2em] leading-relaxed italic">
              Experience hand-curated visual assets. Optimized for high-density OLED panels and professional UHD displays.
            </p>
          </header>

          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-4 text-cyan-400 font-black tracking-[1em] uppercase italic animate-pulse">Syncing Neural Grid</div>
          ) : (
            /* Responsive Grid based on Device Type */
            <div className={`grid gap-8 ${deviceType === 'portrait' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {wallpapers.map((p, i) => (
                <div key={p.id} className={`wall-card relative group rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl transition-all duration-500 hover:border-cyan-500/40 ${deviceType === 'portrait' ? 'aspect-[9/16]' : 'aspect-[16/10]'}`}>
                  <img src={p.src.large2x} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent p-8 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex justify-between items-center border-t border-white/10 pt-4">
                      <h4 className="text-[10px] font-black uppercase italic truncate pr-4 text-white font-sans">{p.photographer}</h4>
                      <a href={p.src.original} target="_blank" className="bg-white text-black p-3 rounded-xl hover:bg-cyan-400 transition-colors shadow-xl"><Download size={18}/></a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      ) : (
        /* Detailed AdSense Approval Content Sections */
        <div className="relative z-10 pt-60 px-12 max-w-4xl mx-auto min-h-screen text-white font-sans">
            <h1 className="text-6xl font-black text-cyan-400 mb-8 italic uppercase tracking-tighter">{view}</h1>
            <div className="space-y-8 text-gray-400 italic border-l-2 border-cyan-500 pl-8">
              {view === 'about' && (
                <>
                  <p className="text-lg leading-relaxed">Asthexwall is a premier digital library dedicated to high-fidelity 4K wallpapers. We specialize in curating assets that are specifically optimized for OLED screens and modern UHD panels.</p>
                  <p className="text-sm">Our mission is to provide creators and designers with easy access to royalty-free, high-resolution imagery through the professional Pexels API ecosystem. Every pixel is verified for quality and aesthetic brilliance.</p>
                </>
              )}
              {view === 'privacy' && (
                <>
                  <p className="text-lg leading-relaxed">Your privacy is our priority. Asthexwall does not store personal identification data. We use standard web cookies to enhance user experience and serve relevant advertisements through Google AdSense.</p>
                  <p className="text-sm">By using our archive, you agree to the collection of non-personal data for site optimization and traffic analysis. For more information, please contact our neural support team.</p>
                </>
              )}
              {view === 'terms' && (
                <>
                  <p className="text-lg leading-relaxed">All images hosted on Asthexwall are provided via the Pexels License. These assets are free for personal use. Commercial redistribution of these files as a standalone product is strictly prohibited.</p>
                  <p className="text-sm">We reserve the right to modify the visual archive and terms of service at any time. All photography remains the intellectual property of the respective artists on the Pexels platform.</p>
                </>
              )}
            </div>
            <button onClick={() => setView('home')} className="mt-16 bg-white text-black px-12 py-5 rounded-full font-black text-[10px] hover:bg-cyan-400 transition-all tracking-[0.2em] uppercase">Back to Archive</button>
        </div>
      )}

      {/* Footer with more navigation links for AdSense */}
      <footer className="relative z-10 bg-black/80 border-t border-white/5 py-32 px-12 mt-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-16">
          <div className="max-w-md">
            <h3 className="text-4xl font-black tracking-widest mb-6 italic uppercase font-sans text-glow">ASTHEXWALL</h3>
            <p className="text-[10px] text-gray-600 font-bold tracking-[0.4em] leading-loose uppercase italic border-l-2 border-cyan-500 pl-6 font-sans">
              Neural Visual Archive. Optimized for OLED. Powered by Pexels API. Every pixel is a masterpiece in the digital void.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 text-[10px] font-black uppercase text-gray-500 tracking-widest">
            <div className="flex flex-col gap-4">
              <span className="text-white mb-2 tracking-[1em]">Pages</span>
              <button onClick={() => setView('about')} className="hover:text-cyan-400 text-left flex items-center gap-2"><Info size={12}/> About</button>
              <button onClick={() => setView('privacy')} className="hover:text-cyan-400 text-left flex items-center gap-2"><Shield size={12}/> Privacy</button>
              <button onClick={() => setView('terms')} className="hover:text-cyan-400 text-left flex items-center gap-2"><FileText size={12}/> Terms</button>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-white mb-2 tracking-[1em]">Archive</span>
              <button onClick={() => {setCategory('Cyberpunk'); fetchWalls('Cyberpunk', deviceType); setView('home')}} className="hover:text-cyan-400 text-left">Cyberpunk</button>
              <button onClick={() => {setCategory('Amoled'); fetchWalls('Amoled', deviceType); setView('home')}} className="hover:text-cyan-400 text-left">OLED Dark</button>
            </div>
          </div>
        </div>
        <div className="mt-24 pt-12 border-t border-white/5 text-center text-[9px] text-gray-800 font-black tracking-[1.5em] uppercase font-sans">© 2026 ASTHEXWALL | NEURAL ARCHIVE | ALL RIGHTS RESERVED</div>
      </footer>
    </div>
  );
}
