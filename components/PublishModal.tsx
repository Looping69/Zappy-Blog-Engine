
import React, { useState, useEffect } from 'react';
import { SanityConfig, AirtableConfig } from '../types';

interface PublishModalProps {
  isOpen: boolean;
  type: 'sanity' | 'airtable' | null;
  onClose: () => void;
  onPublish: (config: any) => Promise<void>;
  initialSanityConfig?: SanityConfig;
  initialAirtableConfig?: AirtableConfig;
}

const PublishModal: React.FC<PublishModalProps> = ({ 
  isOpen, 
  type, 
  onClose, 
  onPublish,
  initialSanityConfig,
  initialAirtableConfig
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [sanityConfig, setSanityConfig] = useState<SanityConfig>({ projectId: '', dataset: 'production', token: '' });
  const [airtableConfig, setAirtableConfig] = useState<AirtableConfig>({ apiKey: '', baseId: '', tableName: 'Content' });

  // Update local state when initial props change or modal opens
  useEffect(() => {
    if (initialSanityConfig) setSanityConfig(initialSanityConfig);
    if (initialAirtableConfig) setAirtableConfig(initialAirtableConfig);
  }, [initialSanityConfig, initialAirtableConfig, isOpen]);

  if (!isOpen || !type) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (type === 'sanity') {
        if (!sanityConfig.projectId || !sanityConfig.token) throw new Error("Project ID and Token are required");
        await onPublish(sanityConfig);
      } else {
        if (!airtableConfig.apiKey || !airtableConfig.baseId) throw new Error("API Key and Base ID are required");
        await onPublish(airtableConfig);
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-[fadeIn_0.3s_ease-out]">
        
        <div className={`p-6 border-b border-slate-100 flex items-center gap-3 ${type === 'sanity' ? 'bg-[#F03E2F]/5' : 'bg-[#FCB400]/10'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm ${type === 'sanity' ? 'bg-[#F03E2F] text-white' : 'bg-[#FCB400] text-white'}`}>
            {type === 'sanity' ? 'S' : 'A'}
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Publish to {type === 'sanity' ? 'Sanity CMS' : 'Airtable'}</h3>
            <p className="text-xs text-slate-500 font-medium">Confirm credentials before publishing</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          {type === 'sanity' ? (
            <>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Project ID</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#F03E2F] transition-colors"
                  placeholder="e.g. 8x92nm4"
                  value={sanityConfig.projectId}
                  onChange={e => setSanityConfig({...sanityConfig, projectId: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Dataset</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#F03E2F] transition-colors"
                  placeholder="production"
                  value={sanityConfig.dataset}
                  onChange={e => setSanityConfig({...sanityConfig, dataset: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">API Token (Editor/Write)</label>
                <input 
                  type="password" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#F03E2F] transition-colors"
                  placeholder="sk..."
                  value={sanityConfig.token}
                  onChange={e => setSanityConfig({...sanityConfig, token: e.target.value})}
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
                  placeholder="pat..."
                  value={airtableConfig.apiKey}
                  onChange={e => setAirtableConfig({...airtableConfig, apiKey: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Base ID</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#FCB400] transition-colors"
                  placeholder="app..."
                  value={airtableConfig.baseId}
                  onChange={e => setAirtableConfig({...airtableConfig, baseId: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Table Name</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#FCB400] transition-colors"
                  placeholder="Posts"
                  value={airtableConfig.tableName}
                  onChange={e => setAirtableConfig({...airtableConfig, tableName: e.target.value})}
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className={`flex-1 px-4 py-3 text-white rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95 flex justify-center items-center gap-2
                ${type === 'sanity' ? 'bg-[#F03E2F] hover:bg-red-600 shadow-red-200' : 'bg-[#FCB400] hover:bg-yellow-500 shadow-yellow-200'}`}
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Publish Content'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublishModal;
