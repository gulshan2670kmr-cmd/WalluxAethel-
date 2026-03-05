import React, { useState, useEffect, useRef } from 'react';
import { Aperture, Download, Search, Loader2, Monitor, Smartphone, Zap, ShieldCheck, Info, ArrowDown } from 'lucide-react';
import * as THREE from 'three'; // Make sure Three.js is imported

export default function App() {
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('Cyberpunk');
  const [deviceType, setDeviceType] = useState(window.innerWidth < 768 ? 'portrait' : 'landscape');
  const [view, setView] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [introVisible, setIntroVisible] = useState(true);
  const canvasRef = useRef(null);

  useEffect(() => {
    // --- ADVANCED 3D ENGINE ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // 1. Starfield (Existing)
    const starGeo = new THREE.BufferGeometry();
    const starVerts = [];
    for (let i = 0; i < 5000; i++) starVerts.push(THREE.MathUtils.randFloatSpread(2000));
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVerts, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x22d3ee, size: 0.7, transparent: true, opacity: 0.5 }));
    scene.add(stars);

    // 2. NEW 3D FLOATING ELEMENTS (Bina design chhede)
    const geometry = new THREE.IcosahedronGeometry(10, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x22d3ee, wireframe: true, transparent: true, opacity: 0.1 });
    const floaters = [];

    for(let i=0; i<15; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(Math.random()*400-200, Math.random()*400-200, Math.random()*400-200);
      mesh.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, 0);
      floaters.push(mesh);
      scene.add(mesh);
    }

    camera.position.z = 200;

    const animate = () => {
      requestAnimationFrame(animate);
      stars.rotation.y += 0.0005;
      stars.position.z += 0.8;
      if(stars.position.z > 500) stars.position.z = -500;

      // Rotate Floaties
      floaters.forEach(f => {
        f.rotation.x += 0.005;
        f.rotation.y += 0.005;
      });

      renderer.render(scene, camera);
    };
    animate();

    const timer = setTimeout(() => {
      setIntroVisible(false);
      fetchWalls(category, deviceType);
    }, 2500);

    return () => {
        clearTimeout(timer);
        renderer.dispose();
    };
  }, []);

  // ... rest of your fetchWalls and handleSearch functions (No changes needed there)
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
      setView('home');
    }
  };

  return (
    <div className={`min-h-screen bg-[#020202] text-white font-sans selection:bg-cyan-500/30 relative ${introVisible ? 'overflow-hidden' : 'overflow-x-hidden'}`}>
      
      {/* INTRO (No changes to design) */}
      <div className={`fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center transition-transform duration-1000 ease-in-out ${introVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <h1 className="text-5xl md:text-9xl font-black tracking-[0.3em] italic text-glow uppercase text-center animate-pulse">ASTHEXWALL</h1>
        <p className="text-cyan-500 text-[10px] mt-8 tracking-[1.5em] font-bold uppercase opacity-80">Neural Visual Protocol</p>
      </div>

      {/* 3D CANVAS BACKGROUND */}
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-40" />

      {/* NAVBAR (STILL FIXED TOP) */}
      <nav className="fixed top-0 left-0 right-0 z-[100] flex justify-center pt-8 pointer-events-none">
        <div className="w-[92%] max-w-7xl glass-nav px-6 py-4 md:px-10 md:py-6 rounded-[2.5rem] flex flex-col lg:flex-row justify-between items-center gap-6 border border-white/5 shadow-2xl pointer-events-auto">
          <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => {setView('home'); fetchWalls('Cyberpunk', deviceType)}}>
            <Aperture className="text-cyan-400 animate-spin-slow" size={28}/>
            <span className="font-black tracking-tighter text-2xl italic uppercase">ASTHEXWALL</span>
          </div>

          <form onSubmit={handleSearch} className="relative w-full max-w-md group">
            <input type="text" placeholder="Explore Neural Grid..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white/10 border border-white/10 px-6 py-3 rounded-2xl outline-none focus:border-cyan-500/50 focus:bg-white/20 transition-all text-sm italic" />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400"><Search size={20}/></button>
          </form>
          
          <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
            <button onClick={() => {setDeviceType('portrait'); fetchWalls(category, 'portrait')}} className={`px-5 py-2 rounded-xl transition-all text-[10px] font-black uppercase flex items-center gap-2 ${deviceType === 'portrait' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/40' : 'text-gray-500 hover:text-white'}`}><Smartphone size={14}/> Mobile</button>
            <button onClick={() => {setDeviceType('landscape'); fetchWalls(category, 'landscape')}} className={`px-5 py-2 rounded-xl transition-all text-[10px] font-black uppercase flex items-center gap-2 ${deviceType === 'landscape' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/40' : 'text-gray-500 hover:text-white'}`}><Monitor size={14}/> Desktop</button>
          </div>
        </div>
      </nav>

      {/* CONTENT (Z-Index ensures it sits above 3D) */}
      <main className="relative z-10 pt-72 md:pt-80 px-8 max-w-[1800px] mx-auto pb-40">
         {/* ... (Same Banner and Grid code as before) ... */}
         {view === 'home' ? (
             <>
               {!loading && wallpapers.length > 0 && (
                <section className="mb-24 relative h-[65vh] md:h-[80vh] w-full rounded-[4rem] overflow-hidden group border border-white/10 shadow-2xl">
                  <img src={wallpapers[0].src.original} className="w-full h-full object-cover transition-transform duration-[15s] group-hover:scale-105" alt="Featured" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent flex flex-col justify-end p-12 md:p-20">
                    <div className="flex items-center gap-3 text-cyan-400 text-[11px] font-black tracking-[0.8em] uppercase mb-6 animate-pulse">
                      <Zap size={16} /> Asset of the Day
                    </div>
                    <h2 className="text-5xl md:text-9xl font-black uppercase italic tracking-tighter text-glow leading-none mb-10">NEURAL<br/>SELECTION</h2>
                    <a href={wallpapers[0].src.original} target="_blank" className="w-fit bg-white text-black px-12 py-5 rounded-3xl font-black uppercase text-[12px] tracking-widest flex items-center gap-3 hover:bg-cyan-400 transition-all shadow-2xl active:scale-95">
                      <Download size={20}/> Download UHD
                    </a>
                  </div>
                </section>
              )}

              <header className="mb-20 border-l-4 border-cyan-500 pl-10">
                <h2 className="text-7xl md:text-[9rem] font-black uppercase italic tracking-tighter text-glow leading-tight italic">/{category}</h2>
              </header>

              {loading ? (
                <div className="h-96 flex flex-col items-center justify-center gap-6 text-cyan-400 font-black tracking-[2em] uppercase italic animate-pulse">
                  <Loader2 className="animate-spin" size={40} /> Syncing
                </div>
              ) : (
                <div className={`grid gap-10 ${deviceType === 'portrait' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                  {wallpapers.map((p) => (
                    <div key={p.id} className={`wall-card relative group rounded-[3rem] overflow-hidden bg-zinc-900 border border-white/5 transition-all duration-700 hover:scale-[1.03] hover:shadow-[0_0_60px_rgba(34,211,238,0.15)] hover:border-cyan-500/30 ${deviceType === 'portrait' ? 'aspect-[9/16]' : 'aspect-[16/10]'}`}>
                      <img src={p.src.large2x} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-10 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="flex justify-between items-center border-t border-white/10 pt-6">
                          <h4 className="text-[10px] font-black uppercase italic truncate pr-6 text-gray-300">{p.photographer}</h4>
                          <a href={p.src.original} target="_blank" className="bg-white text-black p-4 rounded-2xl hover:bg-cyan-400 transition-all shadow-2xl"><Download size={22}/></a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
             </>
         ) : (
            <div className="pt-20 px-10 max-w-4xl mx-auto min-h-screen">
              <h1 className="text-6xl font-black text-cyan-400 mb-8 italic uppercase tracking-tighter text-glow">{view === 'about' ? "Vision" : "Privacy Protocol"}</h1>
              <p className="text-gray-400 leading-relaxed text-lg border-l-2 border-cyan-500 pl-8 italic">
                {view === 'about' ? "Asthexwall is a premier digital destination for high-fidelity 4K visual assets..." : "At Asthexwall, we prioritize the privacy of our visitors..."}
              </p>
              <button onClick={() => setView('home')} className="mt-16 bg-white text-black px-12 py-4 rounded-full font-black uppercase text-[11px] tracking-widest hover:bg-cyan-400">Return to Grid</button>
            </div>
         )}
      </main>

      <footer className="relative z-10 bg-black/90 border-t border-white/5 py-40 px-12 mt-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-20">
          <div className="max-w-md">
            <h3 className="text-5xl font-black tracking-tighter mb-8 italic uppercase text-glow">ASTHEXWALL</h3>
            <p className="text-[11px] text-gray-600 font-bold tracking-[0.4em] leading-loose uppercase italic border-l-2 border-cyan-500 pl-8">High-fidelity 4K Visual Archive. Every pixel curated. Every frame optimized. Powered by Pexels API ecosystem.</p>
          </div>
          <div className="flex gap-16 text-[11px] font-black uppercase text-gray-500 tracking-widest">
            <button onClick={() => setView('about')} className="hover:text-cyan-400 flex items-center gap-2 text-glow"><Info size={14}/> Vision</button>
            <button onClick={() => setView('privacy')} className="hover:text-cyan-400 flex items-center gap-2 text-glow"><ShieldCheck size={14}/> Privacy</button>
          </div>
        </div>
        <div className="mt-32 pt-16 border-t border-white/5 text-center text-[10px] text-gray-800 font-black tracking-[2em] uppercase italic">© 2026 ASTHEXWALL | NEURAL ARCHIVE</div>
      </footer>
    </div>
  );
  }
        
