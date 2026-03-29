import { useState } from 'react';
import { supabase, type CaseStudy, type WorkExperience, type ContactLink } from '../lib/supabase';
import { useCaseStudies, useWorkExperience, useContactLinks } from '../hooks/useSupabaseData';

// ─── Admin Password Gate ──────────────────────────────────────────────────────
const ADMIN_PASSWORD = ' '; // Change this!

// ─── Types ────────────────────────────────────────────────────────────────────
type AdminTab = 'case_studies' | 'experience' | 'contacts';

const isConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return url && key && !url.includes('YOUR_PROJECT_ID') && !key.includes('YOUR_ANON_KEY');
};

// ─── Notification Banner ─────────────────────────────────────────────────────
function Banner({ msg, type }: { msg: string; type: 'success' | 'error' | 'info' }) {
  const bg = type === 'success' ? 'bg-[#0a0a0a] text-white' : type === 'error' ? 'bg-red-600 text-white' : 'bg-yellow-400 text-[#0a0a0a]';
  return (
    <div className={`fixed top-14 left-0 right-0 z-50 px-6 py-3 font-mono text-xs uppercase tracking-widest text-center ${bg}`}>
      {msg}
    </div>
  );
}

// ─── Case Studies Admin ───────────────────────────────────────────────────────
function CaseStudiesAdmin() {
  const { data, loading, refetch } = useCaseStudies();
  const [editing, setEditing] = useState<Partial<CaseStudy> | null>(null);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const showBanner = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setBanner({ msg, type });
    setTimeout(() => setBanner(null), 3000);
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!isConfigured()) { showBanner('Supabase not configured — changes not persisted.', 'info'); setEditing(null); return; }
    setSaving(true);
    const payload = {
      title: editing.title || '',
      description: editing.description || '',
      image_url: editing.image_url || '',
      link: editing.link || '#',
      tags: editing.tags || [],
      display_order: editing.display_order ?? data.length + 1,
    };
    if (editing.id) {
      const { error } = await supabase.from('case_studies').update(payload).eq('id', editing.id);
      if (error) showBanner('Error: ' + error.message, 'error');
      else { showBanner('Case study updated!'); refetch(); }
    } else {
      const { error } = await supabase.from('case_studies').insert(payload);
      if (error) showBanner('Error: ' + error.message, 'error');
      else { showBanner('Case study added!'); refetch(); }
    }
    setSaving(false);
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    if (!isConfigured()) { showBanner('Supabase not configured.', 'info'); setConfirmingDelete(null); return; }
    await supabase.from('case_studies').delete().eq('id', id);
    showBanner('Deleted!');
    setConfirmingDelete(null);
    refetch();
  };

  const moveOrder = async (id: string, dir: 'up' | 'down') => {
    if (!isConfigured()) { showBanner('Supabase not configured.', 'info'); return; }
    const idx = data.findIndex(d => d.id === id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= data.length) return;
    const a = data[idx], b = data[swapIdx];
    await supabase.from('case_studies').update({ display_order: b.display_order }).eq('id', a.id);
    await supabase.from('case_studies').update({ display_order: a.display_order }).eq('id', b.id);
    refetch();
  };

  return (
    <div>
      {banner && <Banner msg={banner.msg} type={banner.type} />}

      {/* Add new */}
      <div className="px-6 py-4 border-b-2 border-[#0a0a0a] flex items-center justify-between">
        <p className="label-mono">Case Studies ({data.length})</p>
        <button
          className="btn-brutal-filled text-xs py-2 px-4"
          onClick={() => setEditing({ title: '', description: '', image_url: '', link: '#', tags: [], display_order: data.length + 1 })}
        >
          + Add New
        </button>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#0a0a0a] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[#0a0a0a] sticky top-0 bg-white">
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider">
                {editing.id ? 'Edit Case Study' : 'Add Case Study'}
              </h3>
              <button onClick={() => setEditing(null)} className="font-mono text-xl hover:bg-[#0a0a0a] hover:text-white w-8 h-8 flex items-center justify-center border-2 border-[#0a0a0a]">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <AdminField label="Title *" value={editing.title || ''} onChange={v => setEditing({ ...editing, title: v })} />
              <AdminField label="Description" value={editing.description || ''} onChange={v => setEditing({ ...editing, description: v })} multiline />
              <AdminField label="Image URL" value={editing.image_url || ''} onChange={v => setEditing({ ...editing, image_url: v })} />
              <AdminField label="Project Link" value={editing.link || ''} onChange={v => setEditing({ ...editing, link: v })} />
              <AdminField
                label="Tags (comma-separated)"
                value={(editing.tags || []).join(', ')}
                onChange={v => setEditing({ ...editing, tags: v.split(',').map(t => t.trim()).filter(Boolean) })}
              />
              <AdminField
                label="Display Order"
                value={String(editing.display_order ?? '')}
                onChange={v => setEditing({ ...editing, display_order: parseInt(v) || 0 })}
                type="number"
              />
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving} className="btn-brutal-filled text-sm py-2 px-6">
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => setEditing(null)} className="btn-brutal text-sm py-2 px-6">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="px-6 py-8 font-mono text-xs text-[#666]">Loading...</div>
      ) : (
        data.map((item, i) => (
          <div key={item.id} className={`flex items-start gap-4 px-6 py-5 ${i < data.length - 1 ? 'border-b-2' : ''} border-[#0a0a0a]`}>
            {/* Order controls */}
            <div className="flex flex-col gap-1 pt-1">
              <button onClick={() => moveOrder(item.id, 'up')} disabled={i === 0} className="font-mono text-xs border border-[#ccc] w-6 h-6 flex items-center justify-center hover:border-[#0a0a0a] disabled:opacity-30">↑</button>
              <button onClick={() => moveOrder(item.id, 'down')} disabled={i === data.length - 1} className="font-mono text-xs border border-[#ccc] w-6 h-6 flex items-center justify-center hover:border-[#0a0a0a] disabled:opacity-30">↓</button>
            </div>

            {/* Thumb */}
            {item.image_url && (
              <img src={item.image_url} alt="" className="w-20 h-14 object-cover border border-[#ccc] shrink-0" />
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-mono text-[10px] text-[#999]">#{item.display_order}</span>
                <h4 className="font-bold text-base">{item.title}</h4>
              </div>
              <p className="font-mono text-xs text-[#666] mt-1 truncate">{item.description}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {item.tags.map(t => <span key={t} className="font-mono text-[9px] border border-[#ccc] px-1.5 py-0.5 uppercase">{t}</span>)}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 shrink-0">
              {confirmingDelete === item.id ? (
                <div className="flex gap-1 animate-in fade-in slide-in-from-right-2 duration-200">
                  <button onClick={() => handleDelete(item.id)} className="font-mono text-[10px] bg-red-500 text-white border-2 border-red-500 py-1.5 px-3 uppercase font-bold">Confirm</button>
                  <button onClick={() => setConfirmingDelete(null)} className="font-mono text-[10px] border-2 border-[#0a0a0a] py-1.5 px-3 uppercase">Cancel</button>
                </div>
              ) : (
                <>
                  <button onClick={() => setEditing(item)} className="btn-brutal text-xs py-1.5 px-3">Edit</button>
                  <button onClick={() => setConfirmingDelete(item.id)} className="font-mono text-xs border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white py-1.5 px-3 transition-colors">Del</button>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ─── Work Experience Admin ────────────────────────────────────────────────────
function ExperienceAdmin() {
  const { data, loading, refetch } = useWorkExperience();
  const [editing, setEditing] = useState<Partial<WorkExperience> | null>(null);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const showBanner = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setBanner({ msg, type });
    setTimeout(() => setBanner(null), 3000);
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!isConfigured()) { showBanner('Supabase not configured.', 'info'); setEditing(null); return; }
    setSaving(true);
    const payload = {
      job_title: editing.job_title || '',
      company: editing.company || '',
      date_range: editing.date_range || '',
      description: editing.description || '',
      display_order: editing.display_order ?? data.length + 1,
    };
    if (editing.id) {
      const { error } = await supabase.from('work_experience').update(payload).eq('id', editing.id);
      if (error) showBanner('Error: ' + error.message, 'error');
      else { showBanner('Experience updated!'); refetch(); }
    } else {
      const { error } = await supabase.from('work_experience').insert(payload);
      if (error) showBanner('Error: ' + error.message, 'error');
      else { showBanner('Experience added!'); refetch(); }
    }
    setSaving(false);
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    if (!isConfigured()) { showBanner('Supabase not configured.', 'info'); setConfirmingDelete(null); return; }
    await supabase.from('work_experience').delete().eq('id', id);
    showBanner('Deleted!');
    setConfirmingDelete(null);
    refetch();
  };

  const moveOrder = async (id: string, dir: 'up' | 'down') => {
    if (!isConfigured()) return;
    const idx = data.findIndex(d => d.id === id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= data.length) return;
    const a = data[idx], b = data[swapIdx];
    await supabase.from('work_experience').update({ display_order: b.display_order }).eq('id', a.id);
    await supabase.from('work_experience').update({ display_order: a.display_order }).eq('id', b.id);
    refetch();
  };

  return (
    <div>
      {banner && <Banner msg={banner.msg} type={banner.type} />}
      <div className="px-6 py-4 border-b-2 border-[#0a0a0a] flex items-center justify-between">
        <p className="label-mono">Work Experience ({data.length})</p>
        <button className="btn-brutal-filled text-xs py-2 px-4" onClick={() => setEditing({ job_title: '', company: '', date_range: '', description: '', display_order: data.length + 1 })}>
          + Add Role
        </button>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#0a0a0a] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[#0a0a0a] sticky top-0 bg-white">
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider">{editing.id ? 'Edit Role' : 'Add Role'}</h3>
              <button onClick={() => setEditing(null)} className="font-mono text-xl hover:bg-[#0a0a0a] hover:text-white w-8 h-8 flex items-center justify-center border-2 border-[#0a0a0a]">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <AdminField label="Job Title *" value={editing.job_title || ''} onChange={v => setEditing({ ...editing, job_title: v })} />
              <AdminField label="Company *" value={editing.company || ''} onChange={v => setEditing({ ...editing, company: v })} />
              <AdminField label="Date Range (e.g. 2022 — Present)" value={editing.date_range || ''} onChange={v => setEditing({ ...editing, date_range: v })} />
              <AdminField label="Description" value={editing.description || ''} onChange={v => setEditing({ ...editing, description: v })} multiline />
              <AdminField label="Display Order" value={String(editing.display_order ?? '')} onChange={v => setEditing({ ...editing, display_order: parseInt(v) || 0 })} type="number" />
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving} className="btn-brutal-filled text-sm py-2 px-6">{saving ? 'Saving...' : 'Save'}</button>
                <button onClick={() => setEditing(null)} className="btn-brutal text-sm py-2 px-6">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? <div className="px-6 py-8 font-mono text-xs text-[#666]">Loading...</div> : (
        data.map((item, i) => (
          <div key={item.id} className={`flex items-start gap-4 px-6 py-5 ${i < data.length - 1 ? 'border-b-2' : ''} border-[#0a0a0a]`}>
            <div className="flex flex-col gap-1 pt-1">
              <button onClick={() => moveOrder(item.id, 'up')} disabled={i === 0} className="font-mono text-xs border border-[#ccc] w-6 h-6 flex items-center justify-center hover:border-[#0a0a0a] disabled:opacity-30">↑</button>
              <button onClick={() => moveOrder(item.id, 'down')} disabled={i === data.length - 1} className="font-mono text-xs border border-[#ccc] w-6 h-6 flex items-center justify-center hover:border-[#0a0a0a] disabled:opacity-30">↓</button>
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-mono text-[10px] text-[#999]">#{item.display_order}</span>
                <h4 className="font-bold text-base">{item.job_title}</h4>
                <span className="font-mono text-xs text-[#666]">@ {item.company}</span>
              </div>
              <p className="font-mono text-xs text-[#888] mt-0.5">{item.date_range}</p>
              <p className="font-mono text-xs text-[#555] mt-2 line-clamp-2">{item.description}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              {confirmingDelete === item.id ? (
                <div className="flex gap-1 animate-in fade-in slide-in-from-right-2 duration-200">
                  <button onClick={() => handleDelete(item.id)} className="font-mono text-[10px] bg-red-500 text-white border-2 border-red-500 py-1.5 px-3 uppercase font-bold">Confirm</button>
                  <button onClick={() => setConfirmingDelete(null)} className="font-mono text-[10px] border-2 border-[#0a0a0a] py-1.5 px-3 uppercase">Cancel</button>
                </div>
              ) : (
                <>
                  <button onClick={() => setEditing(item)} className="btn-brutal text-xs py-1.5 px-3">Edit</button>
                  <button onClick={() => setConfirmingDelete(item.id)} className="font-mono text-xs border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white py-1.5 px-3 transition-colors">Del</button>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ─── Contact Links Admin ──────────────────────────────────────────────────────
function ContactsAdmin() {
  const { data, loading, refetch } = useContactLinks();
  const [editing, setEditing] = useState<Partial<ContactLink> | null>(null);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const showBanner = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setBanner({ msg, type });
    setTimeout(() => setBanner(null), 3000);
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!isConfigured()) { showBanner('Supabase not configured.', 'info'); setEditing(null); return; }
    setSaving(true);
    const payload = {
      label: editing.label || '',
      value: editing.value || '',
      href: editing.href || '#',
      type: editing.type || 'other',
      display_order: editing.display_order ?? data.length + 1,
    };
    if (editing.id) {
      const { error } = await supabase.from('contact_links').update(payload).eq('id', editing.id);
      if (error) showBanner('Error: ' + error.message, 'error');
      else { showBanner('Contact updated!'); refetch(); }
    } else {
      const { error } = await supabase.from('contact_links').insert(payload);
      if (error) showBanner('Error: ' + error.message, 'error');
      else { showBanner('Contact added!'); refetch(); }
    }
    setSaving(false);
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    if (!isConfigured()) { setConfirmingDelete(null); return; }
    await supabase.from('contact_links').delete().eq('id', id);
    showBanner('Deleted!');
    setConfirmingDelete(null);
    refetch();
  };

  const moveOrder = async (id: string, dir: 'up' | 'down') => {
    if (!isConfigured()) return;
    const idx = data.findIndex(d => d.id === id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= data.length) return;
    const a = data[idx], b = data[swapIdx];
    await supabase.from('contact_links').update({ display_order: b.display_order }).eq('id', a.id);
    await supabase.from('contact_links').update({ display_order: a.display_order }).eq('id', b.id);
    refetch();
  };

  return (
    <div>
      {banner && <Banner msg={banner.msg} type={banner.type} />}
      <div className="px-6 py-4 border-b-2 border-[#0a0a0a] flex items-center justify-between">
        <p className="label-mono">Contact Links ({data.length})</p>
        <button className="btn-brutal-filled text-xs py-2 px-4" onClick={() => setEditing({ label: '', value: '', href: '', type: 'other', display_order: data.length + 1 })}>
          + Add Link
        </button>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#0a0a0a] w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[#0a0a0a] sticky top-0 bg-white">
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider">{editing.id ? 'Edit Contact' : 'Add Contact'}</h3>
              <button onClick={() => setEditing(null)} className="font-mono text-xl hover:bg-[#0a0a0a] hover:text-white w-8 h-8 flex items-center justify-center border-2 border-[#0a0a0a]">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <AdminField label="Label (e.g. Email, LinkedIn)" value={editing.label || ''} onChange={v => setEditing({ ...editing, label: v })} />
              <AdminField label="Display Value" value={editing.value || ''} onChange={v => setEditing({ ...editing, value: v })} />
              <AdminField label="URL / href" value={editing.href || ''} onChange={v => setEditing({ ...editing, href: v })} />
              <div>
                <label className="label-mono block mb-2">Type</label>
                <select
                  value={editing.type || 'other'}
                  onChange={e => setEditing({ ...editing, type: e.target.value as ContactLink['type'] })}
                  className="w-full border-2 border-[#0a0a0a] px-3 py-2 font-mono text-sm bg-white"
                >
                  {['email', 'phone', 'linkedin', 'dribbble', 'other'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <AdminField label="Display Order" value={String(editing.display_order ?? '')} onChange={v => setEditing({ ...editing, display_order: parseInt(v) || 0 })} type="number" />
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving} className="btn-brutal-filled text-sm py-2 px-6">{saving ? 'Saving...' : 'Save'}</button>
                <button onClick={() => setEditing(null)} className="btn-brutal text-sm py-2 px-6">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? <div className="px-6 py-8 font-mono text-xs text-[#666]">Loading...</div> : (
        data.map((item, i) => (
          <div key={item.id} className={`flex items-center gap-4 px-6 py-4 ${i < data.length - 1 ? 'border-b-2' : ''} border-[#0a0a0a]`}>
            <div className="flex flex-col gap-1">
              <button onClick={() => moveOrder(item.id, 'up')} disabled={i === 0} className="font-mono text-xs border border-[#ccc] w-6 h-6 flex items-center justify-center hover:border-[#0a0a0a] disabled:opacity-30">↑</button>
              <button onClick={() => moveOrder(item.id, 'down')} disabled={i === data.length - 1} className="font-mono text-xs border border-[#ccc] w-6 h-6 flex items-center justify-center hover:border-[#0a0a0a] disabled:opacity-30">↓</button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] border border-[#0a0a0a] px-1.5 py-0.5 uppercase tracking-wider">{item.type}</span>
                <span className="font-bold text-sm">{item.label}</span>
              </div>
              <p className="font-mono text-xs text-[#555] mt-1">{item.value}</p>
              <p className="font-mono text-[10px] text-[#999] mt-0.5 truncate">{item.href}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              {confirmingDelete === item.id ? (
                <div className="flex gap-1 animate-in fade-in slide-in-from-right-2 duration-200">
                  <button onClick={() => handleDelete(item.id)} className="font-mono text-[10px] bg-red-500 text-white border-2 border-red-500 py-1.5 px-3 uppercase font-bold">Confirm</button>
                  <button onClick={() => setConfirmingDelete(null)} className="font-mono text-[10px] border-2 border-[#0a0a0a] py-1.5 px-3 uppercase">Cancel</button>
                </div>
              ) : (
                <>
                  <button onClick={() => setEditing(item)} className="btn-brutal text-xs py-1.5 px-3">Edit</button>
                  <button onClick={() => setConfirmingDelete(item.id)} className="font-mono text-xs border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white py-1.5 px-3 transition-colors">Del</button>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ─── Reusable Field ───────────────────────────────────────────────────────────
function AdminField({
  label, value, onChange, multiline = false, type = 'text',
}: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; type?: string;
}) {
  return (
    <div className="border-2 border-[#0a0a0a]">
      <label className="block px-3 pt-3 label-mono">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 font-mono text-sm bg-transparent focus:bg-[#f8f8f8] transition-colors resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2 font-mono text-sm bg-transparent focus:bg-[#f8f8f8] transition-colors"
        />
      )}
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState(false);
  const [tab, setTab] = useState<AdminTab>('case_studies');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true);
      setPwError(false);
    } else {
      setPwError(true);
    }
  };

  if (!authed) {
    return (
      <main className="pt-14 min-h-screen flex items-center justify-center bg-[#f8f8f8]">
        <div className="w-full max-w-sm border-2 border-[#0a0a0a] bg-white">
          <div className="px-6 py-4 border-b-2 border-[#0a0a0a] bg-[#0a0a0a] text-white">
            <p className="font-mono text-xs uppercase tracking-widest">Admin Access</p>
          </div>
          <form onSubmit={handleLogin} className="p-6 space-y-4">
            <div className="border-2 border-[#0a0a0a]">
              <label className="block px-3 pt-3 label-mono">Password</label>
              <input
                type="password"
                value={pw}
                onChange={e => { setPw(e.target.value); setPwError(false); }}
                className="w-full px-3 py-2 font-mono text-sm bg-transparent"
                placeholder="Enter password"
                autoFocus
              />
            </div>
            {pwError && (
              <p className="font-mono text-xs text-red-600 uppercase tracking-widest">
                Incorrect password.
              </p>
            )}
            <button type="submit" className="btn-brutal-filled w-full py-3 text-sm">
              Enter →
            </button>
          </form>
        </div>
      </main>
    );
  }

  const TABS: { id: AdminTab; label: string }[] = [
    { id: 'case_studies', label: 'Case Studies' },
    { id: 'experience', label: 'Work Experience' },
    { id: 'contacts', label: 'Contact Links' },
  ];

  return (
    <main className="pt-14 min-h-screen">
      {/* Header */}
      <div className="border-b-2 border-[#0a0a0a] bg-[#0a0a0a] text-white">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-mono text-sm font-bold uppercase tracking-widest">Admin Panel</h1>
            <p className="font-mono text-[10px] text-[#666] mt-0.5">Portfolio Content Management</p>
          </div>
          <div className="flex items-center gap-4">
            {!isConfigured() && (
              <span className="font-mono text-[10px] text-yellow-400 uppercase tracking-wider border border-yellow-400 px-2 py-1">
                ⚠ Supabase not configured
              </span>
            )}
            <button
              onClick={() => setAuthed(false)}
              className="font-mono text-xs border border-[#444] text-[#888] hover:border-white hover:text-white px-3 py-1.5 transition-colors uppercase tracking-wider"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Supabase setup notice */}
      {!isConfigured() && (
        <div className="bg-yellow-50 border-b-2 border-yellow-400 max-w-[1400px] mx-auto w-full px-6 py-4">
          <p className="font-mono text-xs text-yellow-800 uppercase tracking-widest font-bold mb-1">
            ⚠ Supabase Not Connected
          </p>
          <p className="font-mono text-xs text-yellow-700">
            Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file. Data is shown from static fallback and edits will not persist.
          </p>
        </div>
      )}

      {/* SQL Schema download hint */}
      <div className="max-w-[1400px] mx-auto border-b-2 border-[#0a0a0a] px-6 py-3 bg-[#f8f8f8]">
        <p className="font-mono text-[10px] text-[#666] uppercase tracking-widest">
          SQL Schema is embedded in <code>src/lib/supabase.ts</code> as a comment block — copy & paste into your Supabase SQL Editor.
        </p>
      </div>

      <div className="max-w-[1400px] mx-auto">
        {/* Tabs */}
        <div className="flex border-b-2 border-[#0a0a0a]">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 px-4 py-4 font-mono text-xs uppercase tracking-widest border-r-2 border-[#0a0a0a] last:border-r-0 transition-colors ${tab === t.id ? 'bg-[#0a0a0a] text-white' : 'hover:bg-[#f0f0f0]'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="border-b-2 border-[#0a0a0a]">
          {tab === 'case_studies' && <CaseStudiesAdmin />}
          {tab === 'experience' && <ExperienceAdmin />}
          {tab === 'contacts' && <ContactsAdmin />}
        </div>
      </div>
    </main>
  );
}
