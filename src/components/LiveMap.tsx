import React from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { motion } from 'motion/react';
import { 
  X, 
  Car, 
  Zap, 
  MapPin, 
  Navigation,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Target,
  Filter,
  Activity
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  query 
} from 'firebase/firestore';
import { db } from '../firebase';
import { cn, handleFirestoreError, OperationType } from '../lib/utils';
import { VehicleStatus } from '../types';

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/dark';

interface VehicleLocation {
  id: string;
  lat: number;
  lng: number;
  plate: string;
  model: string;
  status: VehicleStatus;
  speed: number;
  fuel: number;
  vin: string;
}

export default function LiveMap() {
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const map = React.useRef<maplibregl.Map | null>(null);
  const markersRef = React.useRef<{ [key: string]: maplibregl.Marker }>({});
  const [selectedVehicle, setSelectedVehicle] = React.useState<VehicleLocation | null>(null);
  const [isSimulating, setIsSimulating] = React.useState(true);

  // Initial mock data
  const [vehicles, setVehicles] = React.useState<VehicleLocation[]>([
    { id: '1', lat: 39.9526, lng: -75.1652, plate: 'BCD 4567', model: 'Tesla Model 3', status: VehicleStatus.RENTED, speed: 78, fuel: 45, vin: '1FA6P8CF8...' },
    { id: '2', lat: 39.9626, lng: -75.1552, plate: 'EFG 8901', model: 'Rivian R1S', status: VehicleStatus.AVAILABLE, speed: 0, fuel: 92, vin: '1HGCP22...' },
    { id: '3', lat: 39.9426, lng: -75.1752, plate: 'XYZ 1234', model: 'Porsche Taycan', status: VehicleStatus.AVAILABLE, speed: 0, fuel: 88, vin: 'WP0AA2Y...' },
    { id: '4', lat: 39.9726, lng: -75.1852, plate: 'LMN 5678', model: 'Lucid Air', status: VehicleStatus.RENTED, speed: 105, fuel: 62, vin: '1L3AD4...' },
  ]);

  React.useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: [-75.1652, 39.9526], // Philadelphia
      zoom: 12,
      attributionControl: false
    });

    map.current.on('load', () => {
      map.current?.resize();
    });

    return () => map.current?.remove();
  }, []);

  // Update markers
  React.useEffect(() => {
    if (!map.current) return;

    vehicles.forEach((vehicle) => {
      let marker = markersRef.current[vehicle.id];

      if (!marker) {
        const el = document.createElement('div');
        el.className = cn(
          'w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer relative shadow-lg overflow-visible',
          vehicle.speed > 100 ? 'bg-red-600/40 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse' : 
          vehicle.status === VehicleStatus.RENTED ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-green-600/20 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
        );
        
        const dot = document.createElement('div');
        dot.className = cn(
          'w-2 h-2 rounded-full',
          vehicle.speed > 100 ? 'bg-red-500' :
          vehicle.status === VehicleStatus.RENTED ? 'bg-blue-500' : 'bg-green-500'
        );
        el.appendChild(dot);

        // Label
        const label = document.createElement('div');
        label.className = 'absolute -bottom-10 left-1/2 -translate-x-1/2 bg-[#09090b] px-2 py-1 border border-[#27272a] rounded text-[10px] whitespace-nowrap shadow-xl z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity';
        label.innerHTML = `<span class="${vehicle.status === VehicleStatus.RENTED ? 'text-blue-400' : 'text-green-400'} font-bold">${vehicle.plate}</span> • ${vehicle.speed > 0 ? `Moving ${Math.round(vehicle.speed)}mph` : 'Parked'}`;
        el.appendChild(label);

        el.onclick = () => setSelectedVehicle(vehicle);

        marker = new maplibregl.Marker({ element: el })
          .setLngLat([vehicle.lng, vehicle.lat])
          .addTo(map.current!);
        
        markersRef.current[vehicle.id] = marker;
      } else {
        marker.setLngLat([vehicle.lng, vehicle.lat]);
        // Update label content or styles if needed
      }
    });
  }, [vehicles]);


  // Update markers and sync with Firestore if available
  React.useEffect(() => {
    if (!db) {
      // Fallback simulation if DB not ready
      const interval = setInterval(simulateMovement, 3000);
      return () => clearInterval(interval);
    }

    const q = query(collection(db, 'vehicles'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const vehicleData: VehicleLocation[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        vehicleData.push({
          id: doc.id,
          lat: data.location?.lat ?? 39.9526,
          lng: data.location?.lng ?? -75.1652,
          plate: data.plateNumber,
          model: `${data.make} ${data.model}`,
          status: data.status,
          speed: data.location?.speed ?? 0,
          fuel: data.fuelLevel ?? 100,
          vin: data.vin
        });
      });
      setVehicles(vehicleData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'vehicles');
    });

    return () => unsubscribe();
  }, [db]);

  // Simulation logic
  const simulateMovement = () => {
    setVehicles(prev => prev.map(v => ({
      ...v,
      lat: v.lat + (Math.random() - 0.5) * 0.001,
      lng: v.lng + (Math.random() - 0.5) * 0.001,
      speed: v.status === VehicleStatus.RENTED ? 60 + Math.random() * 50 : 0
    })));
  };

  React.useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(simulateMovement, 3000);
    return () => clearInterval(interval);
  }, [isSimulating]);
  const zoomIn = () => map.current?.zoomIn();
  const zoomOut = () => map.current?.zoomOut();
  const resetView = () => map.current?.flyTo({ center: [-75.1652, 39.9526], zoom: 12 });

  return (
    <div className="h-[calc(100vh-12rem)] w-full rounded-3xl overflow-hidden border border-white/5 relative group">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Map Overlays */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-3">
        <div className="bg-[#09090b]/90 backdrop-blur-md border border-[#27272a] p-4 rounded-xl w-64 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Fleet Status</h3>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
            </span>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Total Fleet</span>
              <span className="text-lg font-mono text-white leading-none">142 assets</span>
            </div>
            
            <div className="flex gap-1 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[75%]" />
              <div className="h-full bg-blue-500 w-[20%]" />
              <div className="h-full bg-amber-500 w-[5%]" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="text-[8px] font-bold uppercase text-zinc-600 tracking-tighter">75% Available</div>
              <div className="text-[8px] font-bold uppercase text-zinc-600 tracking-tighter text-center">20% Rented</div>
              <div className="text-[8px] font-bold uppercase text-zinc-600 tracking-tighter text-right">5% Alerts</div>
            </div>
          </div>
        </div>

        <div className="bg-[#09090b]/90 backdrop-blur-md border border-[#27272a] p-4 rounded-xl w-64 shadow-2xl">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-3">Active Alerts</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg group hover:bg-red-500/20 transition-colors cursor-pointer">
              <AlertTriangle className="text-red-500 w-3 h-3 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-black text-white leading-none tracking-tight">TX-9011 (SPEEDING)</p>
                <p className="text-[9px] text-red-500/80 mt-1.5 font-bold">104 mph • Zone: 65</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
        <div className="flex flex-col bg-[#09090b]/90 backdrop-blur-md border border-[#27272a] p-1 rounded-lg shadow-2xl">
          <button onClick={zoomIn} className="p-2.5 text-zinc-500 hover:text-white transition-colors rounded hover:bg-[#18181b]">
            <ZoomIn size={16} />
          </button>
          <div className="h-px bg-[#27272a] mx-2" />
          <button onClick={zoomOut} className="p-2.5 text-zinc-500 hover:text-white transition-colors rounded hover:bg-[#18181b]">
            <ZoomOut size={16} />
          </button>
        </div>
        <button 
          onClick={() => setIsSimulating(!isSimulating)} 
          className={cn(
            "p-3 bg-[#09090b]/90 backdrop-blur-md border rounded-lg shadow-2xl flex items-center justify-center transition-all",
            isSimulating ? "border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "border-[#27272a] text-zinc-500"
          )}
        >
          <Activity size={18} className={isSimulating ? "animate-pulse" : ""} />
        </button>
        <button onClick={resetView} className="p-3 bg-[#09090b]/90 backdrop-blur-md border border-[#27272a] text-zinc-500 hover:text-white rounded-lg shadow-2xl flex items-center justify-center transition-colors">
          <Target size={18} />
        </button>
      </div>

      {/* Detail Overlay */}
      {selectedVehicle && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute bottom-6 right-6 z-20 w-80 bg-[#09090b]/95 backdrop-blur-xl border border-[#27272a] rounded-2xl overflow-hidden shadow-2xl"
        >
          <div className="p-6 relative">
            <button 
              onClick={() => setSelectedVehicle(null)}
              className="absolute top-4 right-4 text-zinc-600 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className={cn(
                "p-3 rounded-xl shadow-lg",
                selectedVehicle.status === VehicleStatus.RENTED ? "bg-blue-600/20 text-blue-500" : "bg-emerald-600/20 text-emerald-500"
              )}>
                <Car size={24} />
              </div>
              <div>
                <h4 className="text-lg font-black italic uppercase tracking-tighter text-white">{selectedVehicle.model}</h4>
                <p className="text-[10px] font-black font-mono text-zinc-600 tracking-[0.2em] mt-0.5 uppercase">{selectedVehicle.plate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#18181b] border border-[#27272a] p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Navigation className="text-blue-500 w-3 h-3" />
                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Velocity</span>
                </div>
                <p className="text-lg font-mono text-white leading-none">{Math.round(selectedVehicle.speed)} <span className="text-[10px] text-zinc-600 italic">MPH</span></p>
              </div>
              <div className="bg-[#18181b] border border-[#27272a] p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="text-amber-500 w-3 h-3" />
                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Charge</span>
                </div>
                <p className="text-lg font-mono text-white leading-none">{selectedVehicle.fuel}%</p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex justify-between items-center text-[9px] font-black uppercase text-zinc-600 tracking-[0.2em]">
                <span>Identifier</span>
                <span className="text-white font-mono lowercase">{selectedVehicle.vin.slice(0, 8)}...</span>
              </div>
              <button className="w-full py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-colors">
                Command Engine
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
