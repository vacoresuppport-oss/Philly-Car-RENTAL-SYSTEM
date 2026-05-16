import React from 'react';
import { 
  Car as CarIcon, 
  Map as MapIcon, 
  Filter, 
  Plus, 
  MoreVertical,
  Activity,
  Fuel,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase';
import { cn, handleFirestoreError, OperationType } from '../lib/utils';
import { VehicleStatus, Vehicle } from '../types';

const statusColors = {
  [VehicleStatus.AVAILABLE]: "bg-emerald-500",
  [VehicleStatus.RENTED]: "bg-indigo-500",
  [VehicleStatus.MAINTENANCE]: "bg-amber-500",
  [VehicleStatus.ARCHIVED]: "bg-slate-500",
};

export default function FleetInventory() {
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!db) return;

    const q = query(collection(db, 'vehicles'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const vehicleData: Vehicle[] = [];
      snapshot.forEach((doc) => {
        vehicleData.push({ id: doc.id, ...doc.data() } as Vehicle);
      });
      setVehicles(vehicleData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'vehicles');
    });

    return () => unsubscribe();
  }, [db]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Active Fleet</h1>
          <p className="text-zinc-500 text-sm mt-1">Real-time status of all digital assets.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex bg-[#111113] border border-[#27272a] rounded-lg p-1">
             <button className="px-3 py-1.5 rounded-md bg-zinc-800 text-white text-[10px] font-bold uppercase tracking-widest shadow-xl">Inventory</button>
             <button className="px-3 py-1.5 rounded-md text-zinc-500 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">Grid</button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-500 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            <Plus size={14} /> Add Asset
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-96 bg-[#111113] animate-pulse rounded-xl border border-[#27272a]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vehicles.map((v) => (
            <motion.div 
              key={v.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -4 }}
              className="group bg-[#09090b] border border-[#27272a] rounded-xl overflow-hidden hover:border-zinc-700 transition-all"
            >
              <div className="aspect-[16/10] bg-zinc-900 relative overflow-hidden flex items-center justify-center p-8">
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                  <span className={cn(
                    "px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter text-white/90 flex items-center gap-1.5 backdrop-blur-md border border-white/5",
                    statusColors[v.status] + "/40"
                  )}>
                    <div className={cn("w-1 h-1 rounded-full bg-white", v.status === VehicleStatus.AVAILABLE && "animate-pulse")} />
                    {v.status}
                  </span>
                  <span className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter text-zinc-500 bg-black/20 border border-white/5">
                    {v.year}
                  </span>
                </div>
                
                <CarIcon size={120} strokeWidth={0.5} className="text-zinc-800 scale-125 rotate-[-12deg] group-hover:scale-135 group-hover:text-zinc-700 transition-all duration-700 opacity-40" />

                <div className="absolute bottom-4 right-4 z-10">
                  <button className="p-2 bg-[#111113] border border-[#27272a] rounded-lg text-zinc-600 hover:text-white transition-colors">
                    <MoreVertical size={14} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-[#fafafa] tracking-tight tabular-nums">{v.make} {v.model}</h3>
                    <div className="flex items-center gap-2 mt-1">
                       <p className="text-[10px] font-black font-mono text-zinc-600 uppercase tracking-widest">{v.plateNumber}</p>
                       <span className="text-zinc-800 tracking-tighter text-[10px] font-black">/</span>
                       <p className="text-[10px] font-black text-zinc-600 uppercase tracking-tighter underline underline-offset-4 decoration-zinc-800">Fleet Control</p>
                    </div>
                  </div>
                  <button className="text-zinc-700 hover:text-white transition-colors">
                    <Info size={16} />
                  </button>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-2">
                        <Fuel size={12} className="text-zinc-500" />
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">Energy Level</span>
                      </div>
                      <span className="text-[10px] font-black text-white tabular-nums">{v.fuelLevel ?? 0}%</span>
                    </div>
                    <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-1000 ease-out" 
                        style={{ width: `${v.fuelLevel ?? 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2 border-t border-[#27272a]">
                    <div className="flex items-center gap-2">
                      <Activity size={12} className="text-zinc-500" />
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">Odometer</span>
                    </div>
                    <span className="text-xs font-black text-zinc-400 tabular-nums">{(v.mileage ?? 0).toLocaleString()} <span className="text-[10px] text-zinc-700 uppercase">MI</span></span>
                  </div>
                </div>

                <div className="mt-8 flex gap-2">
                  <button className="flex-1 py-2.5 bg-zinc-900 border border-[#27272a] text-zinc-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 hover:text-white transition-all flex items-center justify-center gap-2">
                    <MapIcon size={12} /> Locate
                  </button>
                  <button className="flex-[1.5] py-2.5 bg-white text-black rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-xl">
                    Manage Asset
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
