import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import * as THREE from 'three';
import { Aperture, Download, Search, Loader2, Maximize } from 'lucide-react';

export default function App() {
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('4K Trends');
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('home');
  const canvasRef = useRef(null);

  // Device Orientation Logic
  const getOrientation = () => (typeof window !== 'undefined' && window.innerWidth < 768) ? 'portrait' : 'landscape';

  useEffect(() => {
    // 1. Three.js Background (Stars)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 5000; i++) vertices.push(THREE.MathUtils.randFloatSpread(2000));
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const stars = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0x00f3ff, size: 1.2 }));
    scene.add(stars);
    camera.position.z = 500;

    const animate = () => {
      requestAnimationFrame(animate);
      stars.rotation.y += 0.001;
      renderer.render(scene, camera);
    };
    animate();

    // 2. GSAP Intro Animation (Black Screen Hatane ka Logic)
    const tl = gsap.timeline();
    
    tl.to("#logo", { opacity: 1, scale: 1.1, duration: 1.2, ease: "power2.out" })
      .to("#intro", { 
        y: "-100%", 
        delay: 1, 
        duration: 1.2, 
        ease: "expo.inOut",
        onStart: () => {
          // Animation shuru hote hi images mangwana shuru karein
          fetchWalls(category);
        }
      });

    // Emergency Fix: Agar animation atak jaye toh 4 sec baad parda hata do
    const timer = setTimeout(() => {
      const intro = document.getElementById("intro");
      if (intro) intro.style.display = "none";
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const fetchWalls = async (q) => {
    setLoading(true);
    const orientation = getOrientation();
    try {
      const res = await fetch(`/api/get-wallpapers?query=${encodeURIComponent(q)}&orientation=${orientation}`);
      const data = await res.json();
      setWallpapers(data.photos || []);
    } catch (e) {
      console.error("API Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const renderPage = (title, content) => (
    <div className="pt-40 px-6 max-w-4xl mx-auto min-h-screen text-white">
      <h1 className="text-3xl font-bold text-cyan-400 mb-6 uppercase tracking-widest border-b border-white/10 pb-4">{title}</h1>
      <p className="text-gray-400 leading-relaxed mb-10">{content}</p>
      <button onClick={() => setView('home')} className="border border-cyan-500 text-cyan-500 px-8 py-2 rounded-full hover:bg-cyan-500 hover:text-black transition-all">Back to Home</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#030305] text-white overflow-x-hidden">
      {/* Black Screen Intro Overlay */}
      <div id="intro" className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 opacity-40" />
        <h1 id="logo" className="relative z-10 text-4xl md:text-7xl font-black tracking-[0.5em] opacity-0 text-cyan-400" style={{ textShadow: '0 0 20px rgba(0,243,255,0.5)' }}>
          ASTHEXWALL
        </h1>
      </div>

      {/* Header / Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => fetchWalls('4K Trends')}>
          <Aperture className="text-cyan-400" size={28}/><span className="font-black tracking-widest text-xl">ASTHEXWALL</span>
        </div>
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto no-scrollbar py-2">
          {['Nature', 'Space', 'Minimal', 'Anime', 'Cars'].map(cat => (
            <button key={cat} onClick={() => {setCategory(cat); fetchWalls(cat)}} className={`text-[10px] font-black px-5 py-2 rounded-full border transition-all ${category === cat ? 'bg-cyan-500 border-cyan-500 text-black' : 'border-white/10 text-gray-400 hover:border-cyan-400'}`}>{cat}</button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); fetchWalls(searchTerm); }} className="relative w-full md:w-64">
          <input type="text" placeholder="Search Wallpapers..." className="w-full bg-white/5 border border-white/10 rounded-full py-2 px-10 outline-none text-sm focus:border-cyan-400" onChange={(e) => setSearchTerm(e.target.value)} />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
        </form>
      </nav>

      {view === 'home' ? (
        <main className="pt-48 md:pt-40 px-4 max-w-7xl mx-auto pb-20">
          <div className="mb-10"><span className="text-cyan-500 font-bold tracking-[0.4em] text-[10px] uppercase">Collections</span><h2 className="text-2xl font-black uppercase tracking-tighter mt-1 italic">/{category}</h2></div>
          
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-cyan-400 opacity-50"><Loader2 className="animate-spin" size={40}/><p className="text-[10px] tracking-[0.5em]">SYNCING PIXELS</p></div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {wallpapers.map(p => (
                <div key={p.id} className="relative group rounded-3xl overflow-hidden bg-zinc-900 border border-white/5 break-inside-avoid transition-all duration-500 hover:shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                  <img src={p.src.large} alt="4K Wallpaper" className="w-full transition-transform duration-1000 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 p-6 flex flex-col justify-end">
                    <div className="flex items-center gap-2 mb-3 text-cyan-400 text-[9px] font-bold uppercase"><Maximize size={10}/> Ultra HD | {p.width}x{p.height}</div>
                    <div className="flex justify-between items-center border-t border-white/10 pt-4">
                      <p className="text-xs font-black truncate w-32 tracking-wider">{p.photographer}</p>
                      <a href={p.src.original} target="_blank" rel="noreferrer" className="bg-white text-black p-3 rounded-full hover:bg-cyan-400 transition-all transform active:scale-90"><Download size={20}/></a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      ) : (
        view === 'about' ? renderPage("About Us", "Asthexwall is a high-performance wallpaper portal designed for the aesthetic generation. We curate the best 4K visuals from around the world.") :
        view === 'privacy' ? renderPage("Privacy Policy", "We don't collect personal data. Cookies are only used for Google AdSense optimization.") :
        renderPage("Terms", "All images are property of their respective owners on Pexels. For personal use only.")
      )}

      {/* Footer */}
      <footer className="bg-black border-t border-white/5 py-16 px-6 text-center">
        <div className="flex justify-center flex-wrap gap-8 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8">
          <button onClick={() => setView('about')} className="hover:text-cyan-400 transition-colors">About</button>
          <button onClick={() => setView('privacy')} className="hover:text-cyan-400 transition-colors">Privacy</button>
          <button onClick={() => setView('terms')} className="hover:text-cyan-400 transition-colors">Terms</button>
        </div>
        <p className="text-[9px] text-gray-800 font-bold tracking-[0.6em]">© 2024 ASTHEXWALL PORTAL | POWERED BY PEXELS</p>
      </footer>
    </div>
  );
      }
