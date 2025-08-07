/**
 * VERICID Cloudflare Worker
 * Handles CID lookup requests and returns blockchain/network data
 */

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Mock database - replace with your actual data source
const MOCK_CID_DATABASE = {
  // Example CIDs with their network appearances
  'bafybeibc5sgo2plmjkq2tzmhrn54bk3crhnc23zd2msg4ea7a4pxrkgfna': {
    origins: [
      {
        network: 'ethereum',
        address: '0xBd3531dA5CF5857e7CfAA92426877b022e612cf8',
        metadata: {
          type: 'NFT',
          standard: 'ERC721'
        },
        timestamp: '2025-08-07T16:14:00.238Z'
      },
      {
        network: 'base',
        address: '0xBd3531dA5CF5857e7CfAA92426877b022e612cf7',
        metadata: {
          type: 'NFT',
          standard: 'ERC721'
        },
        timestamp: '2025-08-07T16:14:00.245Z'
      }
    ]
  }
  // Add more CIDs as your database grows
};

/**
 * Handle OPTIONS request for CORS
 */
function handleOptions() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

/**
 * Look up CID in various data sources
 * Replace this with your actual lookup logic
 */
async function lookupCID(cid) {
  // Check mock database first
  if (MOCK_CID_DATABASE[cid]) {
    return MOCK_CID_DATABASE[cid];
  }

  // TODO: Add real data source lookups here:
  // - Query blockchain indexers (Alchemy, Moralis, etc.)
  // - Check IPFS gateways
  // - Search NFT marketplaces APIs
  // - Query pinning services
  
  // Example API calls you might make:
  /*
  const ethereumResults = await fetch(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}/getNFTsForContract?contractAddress=${address}&tokenId=${tokenId}`);
  const ipfsResults = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
  const openseaResults = await fetch(`https://api.opensea.io/api/v1/asset/${contract}/${tokenId}/`);
  */

  return { origins: [] }; // Return empty if not found
}

/**
 * Main request handler
 */
async function handleRequest(request) {
  const url = new URL(request.url);

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return handleOptions();
  }

  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const { cidV0, cidV1 } = await request.json();

    if (!cidV0 && !cidV1) {
      return new Response(JSON.stringify({ error: 'CID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Look up both CID versions
    const results = [];
    
    if (cidV0) {
      const v0Results = await lookupCID(cidV0);
      results.push(...v0Results.origins);
    }
    
    if (cidV1) {
      const v1Results = await lookupCID(cidV1);
      results.push(...v1Results.origins);
    }

    // Deduplicate results by network + address combination
    const uniqueResults = results.filter((result, index, self) => 
      index === self.findIndex(r => r.network === result.network && r.address === result.address)
    );

    // Sort by timestamp (newest first)
    uniqueResults.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const response = {
      cid: cidV1 || cidV0, // Prefer v1, fallback to v0
      origins: uniqueResults,
      metadata: {
        totalOrigins: uniqueResults.length,
        lastFound: uniqueResults.length > 0 ? uniqueResults[0].timestamp : null,
        searchedCIDs: {
          v0: cidV0,
          v1: cidV1
        }
      }
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Worker error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// Export the handler for Cloudflare Workers
export default {
  async fetch(request, env, ctx) {
    return handleRequest(request);
  },
};

// Alternative export for older Cloudflare Workers runtime
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});
