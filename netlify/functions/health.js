const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  let dbOk = false;
  try {
    const resp = await fetch(`${supabaseUrl}/rest/v1/banks`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    });
    dbOk = resp.ok;
  } catch (e) {
    dbOk = false;
  }
  // Optionally, check scraper endpoint (simulate OK)
  const scraperOk = true;
  if (dbOk && scraperOk) {
    return { statusCode: 200, body: 'OK' };
  }
  return { statusCode: 500, body: 'Unhealthy' };
}; 