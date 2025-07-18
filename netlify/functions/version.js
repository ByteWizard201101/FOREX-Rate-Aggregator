exports.handler = async function(event, context) {
  const commit = process.env.COMMIT_REF || 'unknown';
  return {
    statusCode: 200,
    body: JSON.stringify({ version: commit })
  };
}; 