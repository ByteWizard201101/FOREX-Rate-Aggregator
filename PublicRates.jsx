import React, { useEffect, useState, useRef } from 'react';
import { supabase } from './supabaseClient';
import Sparkline from './Sparkline';

export default function PublicRates() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [liveMsg, setLiveMsg] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState('');
  const prevRatesRef = useRef([]);

  useEffect(() => {
    fetchRates();
    // eslint-disable-next-line
  }, []);

  async function fetchRates() {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase.rpc('get_latest_rates');
      if (error) throw error;
      setRates(data);
      setLastUpdated(new Date());
    } catch (e) {
      setError('Failed to load rates. Please try again later.');
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!loading && rates.length) {
      let msg = '';
      rates.forEach((rate, i) => {
        const prev = prevRatesRef.current[i]?.eur_rate;
        if (prev !== undefined && prev !== rate.eur_rate) {
          msg += `${rate.bank_name} rate is now ${rate.eur_rate}. `;
        }
      });
      setLiveMsg(msg);
      prevRatesRef.current = rates;
    }
  }, [rates, loading]);

  function getRateColor(rate, previous) {
    if (previous == null) return '';
    if (rate < previous) return 'bg-green-100 text-green-700'; // Decrease (cheaper)
    if (rate > previous) return 'bg-red-100 text-red-700';   // Increase
    return 'bg-gray-100 text-gray-700';
  }

  const filteredRates = rates.filter(rate =>
    rate.bank_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 border rounded mt-4 overflow-x-auto">
      <div className="sr-only" aria-live="polite">{liveMsg}</div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
        <h2 className="text-lg font-bold">Public Rates Table</h2>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 rounded border bg-blue-600 text-white hover:bg-blue-700"
            onClick={fetchRates}
            disabled={loading}
            aria-label="Refresh rates"
          >
            Refresh
          </button>
          {lastUpdated && (
            <span className="text-xs text-gray-500">Last updated: {lastUpdated.toLocaleString()}</span>
          )}
          <a
            href="mailto:support@example.com?subject=FOREX%20Rates%20Issue"
            className="text-xs text-blue-600 underline ml-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            Report issue
          </a>
        </div>
      </div>
      <input
        className="border p-2 rounded mb-2 w-full"
        placeholder="Search by bank name..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        aria-label="Search by bank name"
      />
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {loading ? (
        <table className="min-w-full border animate-pulse" aria-label="Loading rates">
          <thead>
            <tr>
              <th className="border px-2 py-1 sticky left-0 bg-white z-10">Bank</th>
              <th className="border px-2 py-1">EUR→BDT Rate</th>
              <th className="border px-2 py-1">Trend (7d)</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(3)].map((_, i) => (
              <tr key={i}>
                <td className="border px-2 py-1 bg-gray-200 sticky left-0 z-10">&nbsp;</td>
                <td className="border px-2 py-1 bg-gray-200">&nbsp;</td>
                <td className="border px-2 py-1 bg-gray-200">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border" aria-label="Latest EUR to BDT rates">
            <thead>
              <tr>
                <th className="border px-2 py-1 sticky left-0 bg-white z-10" scope="col">Bank</th>
                <th className="border px-2 py-1" scope="col">EUR→BDT Rate</th>
                <th className="border px-2 py-1" scope="col">Trend (7d)</th>
              </tr>
            </thead>
            <tbody>
              {filteredRates.map(rate => (
                <tr key={rate.bank_id}>
                  <td className="border px-2 py-1 font-semibold sticky left-0 bg-white z-10">{rate.bank_name}</td>
                  <td className={`border px-2 py-1 font-semibold`}>
                    <span className={`inline-block px-2 py-1 rounded ${getRateColor(rate.eur_rate, rate.previous_rate)}`} aria-label={rate.eur_rate < rate.previous_rate ? 'Rate decreased' : rate.eur_rate > rate.previous_rate ? 'Rate increased' : 'No change'}>
                      {rate.eur_rate}
                      {rate.previous_rate != null && (
                        <span className="ml-2 text-xs">
                          {rate.eur_rate < rate.previous_rate ? '↓' : rate.eur_rate > rate.previous_rate ? '↑' : ''}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="border px-2 py-1">
                    <Sparkline data={rate.trend || []} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 