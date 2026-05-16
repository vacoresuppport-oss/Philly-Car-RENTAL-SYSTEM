import React from 'react';
import { 
  User, 
  MapPin, 
  Shield, 
  Upload, 
  Calendar as CalendarIcon,
  Phone,
  Mail,
  MoreHorizontal
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const FormSection = ({ title, description, children, icon: Icon, index }: any) => (
  <div className="bg-[#09090b] border border-[#27272a] rounded-xl overflow-hidden mb-12">
    <div className="p-6 border-b border-[#27272a] flex items-center gap-4">
      <div className="flex items-center gap-3">
        <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono font-black">{index}</span>
        <div>
          <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">{title}</h3>
          <p className="text-zinc-500 text-[10px] mt-0.5 uppercase tracking-tighter">{description}</p>
        </div>
      </div>
    </div>
    <div className="p-8">
      {children}
    </div>
  </div>
);

const InputField = ({ label, type = "text", placeholder, icon: Icon, required }: any) => (
  <div className="space-y-1.5 flex-1 min-w-[240px]">
    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-tighter px-1">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative group">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 group-focus-within:text-white transition-colors" />}
      <input 
        type={type} 
        placeholder={placeholder}
        className={cn(
          "w-full bg-[#18181b] border border-[#27272a] rounded-xl py-3 px-4 text-xs text-white placeholder:text-zinc-700 outline-none focus:border-blue-500/50 transition-all font-medium",
          Icon && "pl-10"
        )}
      />
    </div>
  </div>
);

export default function AddCustomer() {
  const [activeTab, setActiveTab] = React.useState('identity');

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Onboard Client</h1>
          <p className="text-zinc-500 text-sm mt-1">Register a new entity into the Philly Rental Sys ecosystem.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-6 py-2.5 bg-white text-black rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.05)]">
            Initialize Record
          </button>
        </div>
      </div>

      <nav className="flex gap-8 border-b border-[#27272a] pb-px">
        {['identity', 'address', 'vault'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative",
              activeTab === tab ? "text-white" : "text-zinc-600 hover:text-zinc-400"
            )}
          >
            {tab}
            {activeTab === tab && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]" 
              />
            )}
          </button>
        ))}
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start mt-10">
        <div className="md:col-span-2">
          {activeTab === 'identity' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <FormSection 
                index="01"
                title="Identity Profile" 
                description="Secure identification and core contact data."
                icon={User}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <InputField label="Legal First Name" placeholder="John" required />
                  <InputField label="Legal Last Name" placeholder="Doe" required />
                  <InputField label="Verified Email" type="email" placeholder="john@vault.com" icon={Mail} required />
                  <InputField label="Phone Uplink" type="tel" placeholder="+1 (555) 000-0000" icon={Phone} required />
                  <div className="sm:col-span-2">
                    <InputField label="Date of Birth" type="date" icon={CalendarIcon} required />
                  </div>
                </div>
              </FormSection>
            </motion.div>
          )}

          {activeTab === 'address' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <FormSection 
                index="02"
                title="Geographic Base" 
                description="Primary residency and billing coordinates."
                icon={MapPin}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <InputField label="Residency Address" placeholder="123 Fleet St." />
                  </div>
                  <InputField label="City / Region" placeholder="Los Angeles" />
                  <InputField label="Province / State" placeholder="California" />
                  <InputField label="Zip / Postal" placeholder="90001" />
                  <InputField label="Sovereign State" placeholder="United States" />
                </div>
              </FormSection>
            </motion.div>
          )}

          {activeTab === 'vault' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <FormSection 
                index="03"
                title="Digital Vault Uplink" 
                description="Encrypted credential and license synchronization."
                icon={Shield}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <InputField label="Operator License ID" placeholder="DL-000-000" required />
                    <InputField label="Credential Expiry" type="date" required />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-tighter px-1">
                      Credential Scan Payload
                    </label>
                    <div className="h-44 border border-dashed border-[#27272a] rounded-xl flex flex-col items-center justify-center gap-3 group hover:border-blue-500/50 hover:bg-[#111113] transition-all cursor-pointer">
                      <div className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-600 group-hover:text-blue-400 group-hover:scale-110 transition-all border border-[#27272a]">
                        <Upload size={16} />
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Select Source File</p>
                        <p className="text-[9px] text-zinc-700 mt-1 uppercase font-black tabular-nums">PDF / JPG / PNG (MAX 25MB)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </FormSection>
            </motion.div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="bg-[#111113] border border-[#27272a] rounded-xl p-6 sticky top-24">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-blue-500" />
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Vault Security</h4>
          </div>
          <p className="text-[10px] text-zinc-500 leading-relaxed mb-6 font-medium">
            This operation is performed over an encrypted channel. Every entry is cross-referenced with global compliance databases.
          </p>
          <div className="space-y-3 pt-6 border-t border-[#27272a]">
             <div className="flex justify-between items-center">
                <span className="text-[9px] font-black text-zinc-600 uppercase">Latency</span>
                <span className="text-[9px] font-black text-emerald-500 tabular-nums">12ms</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-[9px] font-black text-zinc-600 uppercase">Integrity</span>
                <span className="text-[9px] font-black text-blue-500 uppercase">Verified</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
