# VERICID - Digital File Authenticity Verification

🔐 **Verify digital file authenticity using cryptographic Content Identifiers (CIDs). Track provenance across blockchain networks and platforms.**

![VERICID Screenshot](./public/og-image.png)

## 🚀 Features

- **Dual CID Generation** - Creates both CID v0 and v1 for maximum network compatibility
- **Blockchain Tracking** - Traces file appearances across Ethereum, Base, Polygon, and more
- **Real-time Verification** - Instant authenticity checks with trust scoring
- **Network Explorer Links** - Direct links to Etherscan, Basescan, etc.
- **Enterprise UI** - Clean, professional interface inspired by Vercel and Palantir
- **Mobile Responsive** - Works perfectly on all devices
- **Dark/Light Mode** - Customizable theme preferences

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **Multiformats** - IPFS CID generation

### Backend
- **Cloudflare Workers** - Serverless API
- **Edge Runtime** - Global low-latency responses

## 🏗️ Installation & Setup

### 1. Frontend Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/vericid.git
cd vericid

# Install dependencies
npm install

# Start development server
npm start
```

### 2. Cloudflare Worker Setup

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy the worker
wrangler deploy
```

### 3. Environment Configuration

Update the worker URL in `src/App.js`:

```javascript
const WORKER_URL = 'https://your-worker.your-subdomain.workers.dev';
```

## 📡 API Endpoints

### POST `/` - CID Lookup

**Request:**
```json
{
  "cidV0": "QmYourCidV0Here",
  "cidV1": "bafybeiyourcidv1here"
}
```

**Response:**
```json
{
  "cid": "bafybeibc5sgo2plmjkq2tzmhrn54bk3crhnc23zd2msg4ea7a4pxrkgfna",
  "origins": [
    {
      "network": "ethereum",
      "address": "0xBd3531dA5CF5857e7CfAA92426877b022e612cf8",
      "metadata": {
        "type": "NFT",
        "standard": "ERC721"
      },
      "timestamp": "2025-08-07T16:14:00.238Z"
    }
  ],
  "metadata": {
    "totalOrigins": 1,
    "lastFound": "2025-08-07T16:14:00.246Z",
    "searchedCIDs": {
      "v0": "QmYourCidV0Here",
      "v1": "bafybeiyourcidv1here"
    }
  }
}
```

## 🔧 Customization

### Adding New Networks

Update the `getNetworkLink` function in `src/App.js`:

```javascript
case 'your-network':
  return `https://your-explorer.com/address/${address}`;
```

### Integrating Real Data Sources

Replace mock data in `cloudflare-worker.js` with real API calls:

```javascript
// Example: Alchemy API integration
const ethereumResults = await fetch(
  `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}/getNFTsForContract`,
  { headers: { 'Authorization': `Bearer ${ALCHEMY_KEY}` } }
);
```

## 🚀 Deployment

### Frontend (Vercel)

```bash
# Connect to Vercel
vercel

# Deploy
vercel --prod
```

### Worker (Cloudflare)

```bash
# Deploy worker
wrangler deploy

# Set secrets
wrangler secret put ALCHEMY_API_KEY
wrangler secret put MORALIS_API_KEY
```

## 🔐 Security

- All CID generation happens client-side
- No file data is transmitted to servers
- CORS properly configured for cross-origin requests
- Rate limiting enabled on worker endpoints

## 🧪 Testing

```bash
# Run tests
npm test

# Test CID generation
npm run test:cid

# Test API endpoints
npm run test:api
```

## 📊 Use Cases

- **NFT Verification** - Verify artwork authenticity before purchase
- **Document Authentication** - Validate legal documents and certificates  
- **Digital Asset Tracking** - Track file provenance across platforms
- **Supply Chain Verification** - Authenticate product documentation

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.vericid.com](https://docs.vericid.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/vericid/issues)
- **Discord**: [Join our community](https://discord.gg/vericid)

---

Built with ❤️ for digital authenticity and trust.
