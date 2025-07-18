import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthProvider';

export default function AdminPanel() {
  const [banks, setBanks] = useState([]);
  const [name, setName] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPdfUrl, setEditPdfUrl] = useState('');
  const { signOut } = useAuth();

  useEffect(() => {
    fetchBanks();
  }, []);

  async function fetchBanks() {
    setLoading(true);
    const { data, error } = await supabase.from('banks').select('*').order('created_at', { ascending: false });
    if (!error) setBanks(data);
    setLoading(false);
  }

  async function addBank(e) {
    e.preventDefault();
    if (!name || !pdfUrl) return;
    setLoading(true);
    await supabase.from('banks').insert([{ name, pdf_page_url: pdfUrl }]);
    setName('');
    setPdfUrl('');
    fetchBanks();
  }

  async function startEdit(bank) {
    setEditId(bank.id);
    setEditName(bank.name);
    setEditPdfUrl(bank.pdf_page_url);
  }

  async function saveEdit(bankId) {
    setLoading(true);
    await supabase.from('banks').update({ name: editName, pdf_page_url: editPdfUrl }).eq('id', bankId);
    setEditId(null);
    setEditName('');
    setEditPdfUrl('');
    fetchBanks();
  }

  async function deleteBank(bankId) {
    setLoading(true);
    await supabase.from('banks').delete().eq('id', bankId);
    fetchBanks();
  }

  return (
    <div className="p-4 border rounded mt-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold">Admin Panel (Banks CRUD)</h2>
        <button className="bg-gray-700 text-white px-3 py-1 rounded" onClick={signOut}>
          Sign Out
        </button>
      </div>
      <form onSubmit={addBank} className="mb-4 flex flex-col gap-2">
        <input
          className="border p-2 rounded"
          placeholder="Bank Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="PDF Page URL (use YYYYMMDD for date)"
          value={pdfUrl}
          onChange={e => setPdfUrl(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit" disabled={loading}>
          Add Bank
        </button>
      </form>
      {loading && <div>Loading...</div>}
      <ul>
        {banks.map(bank => (
          <li key={bank.id} className="mb-2 flex items-center gap-2">
            {editId === bank.id ? (
              <>
                <input
                  className="border p-1 rounded"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                />
                <input
                  className="border p-1 rounded"
                  value={editPdfUrl}
                  onChange={e => setEditPdfUrl(e.target.value)}
                />
                <button className="bg-green-600 text-white px-2 py-1 rounded" onClick={() => saveEdit(bank.id)}>
                  Save
                </button>
                <button className="bg-gray-400 text-white px-2 py-1 rounded" onClick={() => setEditId(null)}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span className="font-semibold">{bank.name}</span> — <span className="text-xs">{bank.pdf_page_url}</span>
                <button className="bg-yellow-500 text-white px-2 py-1 rounded" onClick={() => startEdit(bank)}>
                  Edit
                </button>
                <button className="bg-red-600 text-white px-2 py-1 rounded" onClick={() => deleteBank(bank.id)}>
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
} 