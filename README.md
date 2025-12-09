# CeloSusu - Farcaster Mini-App 🏦

Decentralized rotating savings circles (Ajo/Esusu) on Celo blockchain.

## 📋 Features

- **Create Circles** - Start a savings circle with friends/family
- **Join Circles** - Browse and join open circles
- **Weekly Contributions** - Contribute cUSD or cEUR each cycle
- **Rotating Payouts** - Members receive the pool in rotating order
- **Yield Generation** - Optional Moola Market integration for interest
- **Farcaster Integration** - Native mini-app experience

## 🔗 Contract Addresses (Celo Mainnet)

| Contract | Address |
|----------|---------|
| SusuFactory | `0x65C64b5235d1d5e6e4708fc6013907caB506841e` |
| cUSD | `0x765DE816845861e75A25fCA122bb6898B8B1282a` |
| cEUR | `0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73` |
| Self Protocol Hub | `0xe57F4773bd9c9d8b6Cd70431117d353298B9f5BF` |

## 🛡️ Self Protocol Integration

CeloSusu integrates Self Protocol for identity verification:

- **Proof of Humanity**: Verifies users are unique humans via passport/ID scan
- **Sybil Resistance**: Prevents one person from filling circles with multiple wallets
- **Privacy Preserving**: Uses zero-knowledge proofs — no personal data stored
- **Age Verification**: Ensures users are 18+ for financial services

### How It Works

1. User clicks "Verify & Join" on a circle
2. QR code appears for scanning with Self app
3. User scans passport/ID with Self app
4. Zero-knowledge proof sent to our backend
5. Verified users can join circles

### Files

- `src/components/SelfVerification.tsx` - QR code verification component
- `src/app/api/self/verify/route.ts` - Backend verification endpoint

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Build for Production

```bash
npm run build
```

## 📱 Deploy to Vercel

1. Push to GitHub
2. Import to Vercel
3. Deploy

```bash
# Or use Vercel CLI
npx vercel
```

## 🎭 Farcaster Mini-App Setup

### Update Manifest

Edit `public/.well-known/farcaster.json`:

1. Replace `your-domain.com` with your actual domain
2. Generate account association signature (see [Farcaster docs](https://miniapps.farcaster.xyz/))
3. Add your app icons

### Required Images

Add to `public/`:
- `icon.png` - 200x200 app icon
- `og-image.png` - 1200x630 Open Graph image
- `splash.png` - Splash screen image

### Publish to Farcaster

1. Deploy to your domain
2. Verify manifest at `yourdomain.com/.well-known/farcaster.json`
3. Submit to Farcaster mini-app directory

## 📁 Project Structure

```
celosusu-app/
├── public/
│   └── .well-known/
│       └── farcaster.json      # Farcaster manifest
├── src/
│   ├── app/
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── components/
│   │   ├── Header.tsx          # App header
│   │   ├── TabNav.tsx          # Tab navigation
│   │   ├── CircleCard.tsx      # Circle list card
│   │   ├── CircleDetailModal.tsx # Circle details
│   │   ├── CreateCircleModal.tsx # Create circle form
│   │   ├── EmptyState.tsx      # Empty state display
│   │   └── LoadingSpinner.tsx  # Loading indicator
│   ├── config/
│   │   ├── contracts.ts        # Contract addresses & ABIs
│   │   └── wagmi.ts            # Wagmi configuration
│   ├── hooks/
│   │   ├── useContracts.ts     # Contract interaction hooks
│   │   └── useFarcaster.ts     # Farcaster SDK hooks
│   └── providers/
│       └── WagmiProvider.tsx   # Wagmi + React Query
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

## 🎯 Proof of Ship Submission

This project qualifies for:

| Track | Requirement | Status |
|-------|-------------|--------|
| **MiniApp** | Farcaster mini-app | ✅ |
| **Self Protocol** | Identity verification | ✅ +$250 |
| **Open Track** | Mento stablecoins | ✅ |
| **Base Prize Pool** | Quality submission | ✅ |

### Submission Checklist

- [x] Working deployment
- [x] Open source repository
- [x] Verified contract on mainnet
- [ ] Demo video (3-4 min)
- [ ] README documentation
- [ ] Live deployment link

## 🛠 Tech Stack

- **Framework**: Next.js 14
- **Wallet**: Wagmi + Viem
- **Styling**: Tailwind CSS
- **Chain**: Celo Mainnet
- **DeFi**: Moola Market (yield)
- **Identity**: Self Protocol (verification)

## 📝 How It Works

1. **Create Circle**: Set name, contribution amount, token (cUSD/cEUR), yield preference
2. **Invite Members**: Share circle link, members join (3-12 members)
3. **Start Circle**: Creator starts when 3+ members joined
4. **Contribute Weekly**: All members contribute each 7-day cycle
5. **Receive Payout**: One member receives full pool each cycle (rotating order)
6. **Complete**: After all members have received, circle completes

## ⚠️ Important Notes

- Always test with small amounts first
- Users must approve token spending before contributing
- Circle creator cannot leave after creation
- Yield adds smart contract risk (Moola Market)

## 📞 Support

- Telegram: [@proofofship](https://t.me/proofofship)
- Twitter: [@CeloDevs](https://twitter.com/CeloDevs)

## 📄 License

MIT
