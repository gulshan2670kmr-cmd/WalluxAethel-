import React, { useState, useEffect, useRef } from 'react';
import { Aperture, Download, Search, Loader2, Monitor, Smartphone } from 'lucide-react';
import * as THREE from 'three';

export default function App() {
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('Amoled');
  const [deviceType, setDeviceType] = useState(window.innerWidth < 768 ? 'portrait' : 'landscape');
  const [searchTerm, setSearchTerm] = useState('');
  const [introVisible, setIntroVisible] = useState(true);
  const canvasRef = useRef(null);

  // 1. 3D NEURAL ENGINE (Intro ke pichhe chalne ke liye)
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const nodesCount = 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new THREE.Float32BufferAttribute(nodesCount * 3, 3);
    for (let i = 0; i < nodesCount; i++) {
      positions.setXYZ(i, THREE.MathUtils.randFloatSpread(2000), THREE.MathUtils.randFloatSpread(2000), THREE.MathUtils.randFloatSpread(2000));
    }
    geometry.setAttribute('position', positions);
    const pointsMaterial = new THREE.PointsMaterial({ 
      size: 2, 
      color: 0x22d3ee, 
      transparent: true, 
      opacity: 0.4,
      blending: THREE.AdditiveBlending 
    });
    const points = new THREE.Points(geometry, pointsMaterial);
    scene.add(points);

    camera.position.z = 400;
    const animate = () => {
      requestAnimationFrame(animate);
      points.rotation.y += 0.0008;
      points.rotation.x += 0.0003;
      renderer.render(scene, camera);
    };
    animate();

    // 2. INTRO TIMER (3.5 Seconds)
    const timer = setTimeout(() => {
      setIntroVisible(false);
      fetchWalls(category, deviceType);
    }, 3500);

    return () => {
      clearTimeout(timer);
      renderer.dispose();
    };
  }, []);

  const fetchWalls = async (q, orientation) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/get-wallpapers?query=${encodeURIComponent(q)}&orientation=${orientation}`);
      const data = await res.json();
      setWallpapers(data.photos || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if(searchTerm.trim()) {
      setCategory(searchTerm);
      fetchWalls(searchTerm, deviceType);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden font-sans">
      
      {/* 3D CANVAS LAYER */}
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-50" />

      {/* 3D INTRO LAYER */}
      {introVisible && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-6 transition-opacity duration-1000">
          <div className="text-center">
            <h1 className="text-6xl md:text-9xl font-black tracking-[0.3em] italic text-cyan-400 uppercase animate-pulse drop-shadow-[0_0_40px_rgba(34,211,238,0.8)] py-6 leading-tight">
              ASTHEXWALL
            </h1>
            <p className="text-cyan-600 text-[10px] md:text-sm mt-4 tracking-[1.5em] font-bold uppercase pl-[1.5em] opacity-70">
              Neural Grid Protocol
            </p>
            <div className="mt-16 w-32 md:w-64 h-[1px] bg-zinc-800 mx-auto overflow-hidden">
              <div className="h-full bg-cyan-500 animate-[loading_2s_ease-in-out_infinite] w-1/2"></div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN WEBSITE CONTENT */}
      <div className={`${introVisible ? 'opacity-0 scale-95' : 'opacity-100 scale-100 block transition-all duration-1000'}`}>
        
        {/* FIXED NAVIGATION */}
        <nav className="fixed top-0 left-0 right-0 z-[100] flex justify-center pt-6 pointer-events-none px-4">
          <div className="w-full max-w-5xl px-6 py-4 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-4 border border-white/10 shadow-2xl pointer-events-auto bg-black/40 backdrop-blur-3xl">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
              <Aperture className="text-cyan-400 animate-spin-slow" size={24}/>
              <span className="font-black tracking-tighter text-2xl italic uppercase">ASTHEXWALL</span>
            </div>
            
            <form onSubmit={handleSearch} className="relative w-full max-w-xs group">
              <input type="text" placeholder="Explore Archive..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white/5 border border-white/10 px-5 py-2.5 rounded-2xl outline-none text-xs italic focus:border-cyan-500/50 transition-all" />
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors"><Search size={18}/></button>
            </form>

            <div className="flex bg-zinc-900/60 p-1 rounded-2xl border border-white/5">
              <button onClick={() => {setDeviceType('portrait'); fetchWalls(category, 'portrait')}} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all ${deviceType === 'portrait' ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(34,211,238,0.4)]' : 'text-gray-400 hover:text-white'}`}><Smartphone size={14}/> Mobile</button>
              <button onClick={() => {setDeviceType('landscape'); fetchWalls(category, 'landscape')}} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all ${deviceType === 'landscape' ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(34,211,238,0.4)]' : 'text-gray-400 hover:text-white'}`}><Monitor size={14}/> Desktop</button>
            </div>
          </div>
        </nav>

        <main className="relative z-10 pt-72 md:pt-80 px-4 md:px-12 max-w-[1800px] mx-auto pb-40">
          <header className="mb-16 border-l-[6px] border-cyan-500 pl-8">
            <h2 className="text-6xl md:text-[10rem] font-black uppercase italic tracking-tighter text-cyan-400 leading-[1.2] pt-6 pb-2 drop-shadow-[0_0_30px_rgba(34,211,238,0.2)] truncate">
              /{category}
            </h2>
          </header>

          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center text-cyan-400 font-black tracking-[1.5em] uppercase italic animate-pulse text-xs">
              <Loader2 className="animate-spin mb-6" size={32} /> Syncing Grid...
            </div>
          ) : (
            /* DUAL LAYOUT: Mobile=2 columns, Desktop=3/5 columns */
            <div className={`grid gap-5 md:gap-10 ${deviceType === 'portrait' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {wallpapers.map((p) => (
                <div key={p.id} className={`group relative rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-white/10 transition-all duration-700 hover:scale-[1.03] hover:shadow-[0_0_50px_rgba(34,211,238,0.2)] ${deviceType === 'portrait' ? 'aspect-[9/16]' : 'aspect-[16/10]'}`}>
                  <img src={p.src.large2x} className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="flex justify-between items-center border-t border-white/10 pt-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <span className="text-[10px] font-black uppercase italic truncate text-gray-400 max-w-[100px]">{p.photographer}</span>
                      <a href={p.src.original} target="_blank" className="bg-white text-black p-3 rounded-2xl hover:bg-cyan-400 transition-all shadow-xl active:scale-90"><Download size={20}/></a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <footer className="relative z-10 bg-black py-24 text-center border-t border-white/5">
            <h3 className="text-3xl font-black italic text-cyan-400 tracking-widest uppercase mb-4">ASTHEXWALL</h3>
            <p className="text-[9px] text-zinc-600 tracking-[1em] uppercase">Neural Grid Protocol © 2026</p>
        </footer>
      </div>
    </div>
  );
          }
      
