const fetch = require('node-fetch');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const CACHE_SECONDS = 300;

exports.handler = async function(event, context) {
  // Set cache headers
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': `public, max-age=${CACHE_SECONDS}`
  };

  // Call Supabase RPC for latest rates
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_latest_rates`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    }
  });
  const data = await resp.json();
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(data)
  };
}; 