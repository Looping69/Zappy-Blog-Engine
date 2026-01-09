
import React, { useState, useEffect } from 'react';
import { SanityConfig, AirtableConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedSanityConfig: SanityConfig;
  savedAirtableConfig: AirtableConfig;
  onSave: (sanity: SanityConfig, airtable: AirtableConfig) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  savedSanityConfig, 
  savedAirtableConfig, 
  onSave 
}) => {
  const [activeTab, setActiveTab] = useState<'sanity' | 'airtable'>('sanity');
  const [sanity, setSanity] = useState<SanityConfig>(savedSanityConfig);
  const [airtable, setAirtable] = useState<AirtableConfig>(savedAirtableConfig);

  useEffect(() => {
    if (isOpen) {
      setSanity(savedSanityConfig);
      setAirtable(savedAirtableConfig);
    }
  }, [isOpen, savedSanityConfig, savedAirtableConfig]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-[fadeIn_0.3s_ease-out] flex flex-col md:flex-row h-[500px]">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-100 p-6 flex flex-col">
          <h3 className="text-lg font-black text-slate-900 mb-6">Settings</h3>
          <div className="space-y-2 flex-1">
             <button 
               onClick={() => setActiveTab('sanity')}
               className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3
               ${activeTab === 'sanity' ? 'bg-white shadow-sm text-slate-900 ring-1 ring-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}
             >
               <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${activeTab === 'sanity' ? 'bg-[#F03E2F] text-white' : 'bg-slate-200'}`}>S</div>
               Sanity CMS
             </button>
             <button 
               onClick={() => setActiveTab('airtable')}
               className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-3
               ${activeTab === 'airtable' ? 'bg-white shadow-sm text-slate-900 ring-1 ring-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}
             >
               <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${activeTab === 'airtable' ? 'bg-[#FCB400] text-white' : 'bg-slate-200'}`}>A</div>
               Airtable
             </button>
          </div>
          <button onClick={onClose} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">Close</button>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            {activeTab === 'sanity' ? 'Sanity Configuration' : 'Airtable Configuration'}
          </h2>
          <p className="text-xs text-slate-500 mb-8 font-medium">
            {activeTab === 'sanity' 
              ? 'Configure your Sanity project credentials for content publishing.' 
              : 'Setup your Airtable Base connection details.'}
          </p>

          <div className="space-y-5">
            {activeTab === 'sanity' ? (
               <>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Project ID</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#F03E2F] transition-colors"
                    value={sanity.projectId}
                    onChange={e => setSanity({...sanity, projectId: e.target.value})}
                    placeholder="e.g. 8x92nm4"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Dataset</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#F03E2F] transition-colors"
                    value={sanity.dataset}
                    onChange={e => setSanity({...sanity, dataset: e.target.value})}
                    placeholder="production"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">API Token</label>
                  <input 
                    type="password" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#F03E2F] transition-colors"
                    value={sanity.token}
                    onChange={e => setSanity({...sanity, token: e.target.value})}
                    placeholder="sk..."
                  />
                </div>
               </>
            ) : (
               <>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Personal Access Token</label>
                  <input 
                    type="password" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#FCB400] transition-colors"
                    value={airtable.apiKey}
                    onChange={e => setAirtable({...airtable, apiKey: e.target.value})}
                    placeholder="pat..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Base ID</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#FCB400] transition-colors"
                    value={airtable.baseId}
                    onChange={e => setAirtable({...airtable, baseId: e.target.value})}
                    placeholder="app..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Table Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#FCB400] transition-colors"
                    value={airtable.tableName}
                    onChange={e => setAirtable({...airtable, tableName: e.target.value})}
                    placeholder="Content"
                  />
                </div>
               </>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100 flex justify-end gap-3">
             <button 
               onClick={() => {
                 setSanity(savedSanityConfig);
                 setAirtable(savedAirtableConfig);
               }}
               className="px-5 py-2.5 text-slate-500 font-bold text-xs hover:bg-slate-50 rounded-xl transition-colors"
             >
               Reset
             </button>
             <button 
               onClick={() => onSave(sanity, airtable)}
               className="px-8 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-lg hover:bg-slate-800 transition-all active:scale-95"
             >
               Save Changes
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
