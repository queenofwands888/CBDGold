# CBD Gold ShopFi - Enhanced React Dashboard

This React + Tailwind dApp dashboard has been completely recoded to match the design and functionality of the Hugging Face Space at https://huggingface.co/spaces/CBDGold/cbdgold.

## 🎨 Design Features

### Layout
- **Header**: CBD Gold ShopFi logo on left, Connect Wallet button on right
- **Navigation**: Responsive tabs (Dashboard, CBD Gold, ShopFi, Governance) with active states
- **Glass Card Design**: Rounded cards with subtle gradients, backdrop blur, and drop shadows
- **Fully Responsive**: Works seamlessly across desktop, tablet, and mobile devices

### Wallet Section
- Displays truncated Algorand address when connected
- Shows token balances with icons for HEMP, WEED, ALGO, USDC
- Includes ASA IDs and fiat equivalents
- Bold numbers with color-coded tokens
- Connect/Disconnect functionality with modal

### Staking Tier System
- **Current Tier Display**: Shows tier name, discount percentage, APY
- **Tier Details**: Staked HEMP amount, shipping benefits, voting power
- **Progress Bar**: Visual progress to next tier (Bronze → Silver → Gold)
- **Action Buttons**: Stake, Unstake, and Claim buttons styled like HF version
- **Tier Colors**: Bronze (orange), Silver (gray), Gold (yellow)

### Stats Dashboard
- **4 Stat Cards**: Available HEMP, Staked HEMP, WEED Governance, LP Contributions
- **Visual Icons**: Emojis for each category (🌿, 🔒, 👥, 📈)
- **Real-time Updates**: Balances update based on actions

## 🛒 Vapes Section
- **Product Grid**: Responsive grid layout for CBD vape products
- **Product Cards**: Each vape shows strain, type, flavor, effects, potency
- **Terpene Tags**: Key terpenes displayed as small badges
- **Pricing**: ALGO and USDC prices with tier discounts applied
- **Purchase Options**: Buy with ALGO, Buy with USDC, Spin for Gold
- **Spin Feature**: 3-second animated spin with various outcomes

## 🔒 Staking Section
- **Three Tier Cards**: Bronze, Silver, Gold with different benefits
- **Tier Benefits**: Discount percentages, APY rates, shipping upgrades
- **Staking Input**: Amount input with validation
- **Visual Hierarchy**: Icons, colors, and gradients for each tier

## 👥 Governance Section
- **Proposal Cards**: Active governance proposals with voting
- **WEED Token Voting**: Vote requirements and power display
- **Time Remaining**: Countdown for each proposal
- **Status Badges**: Active/Closed status indicators

## 🎯 Technical Features

### State Management
- **Wallet State**: Connection status, addresses, balances
- **Staking State**: Staked amounts, tier calculations
- **UI State**: Active tabs, loading states, error handling
- **Spin State**: Animation handling for spin feature

### Responsive Design
- **Mobile First**: Designed for mobile, enhanced for desktop
- **Grid Systems**: CSS Grid and Flexbox for layouts
- **Breakpoints**: Tailwind responsive classes (sm, md, lg, xl)

### Animations & Interactions
- **Glass Card Hover**: Subtle lift and glow effects
- **Button Interactions**: Hover states with transforms
- **Tab Transitions**: Smooth active state changes
- **Loading States**: Spinner animations and disabled states
- **Progress Animations**: Smooth progress bar transitions

### Error Handling
- **Connection Errors**: User-friendly error messages
- **Insufficient Funds**: Clear validation messages
- **Loading States**: Visual feedback during operations

## 🔗 Footer Links
- **Product Links**: CBD Gold Vapes, ShopFi Staking, Governance
- **Resource Links**: Whitepaper, Tokenomics, FAQ, Docs
- **Social Links**: Twitter, Instagram, Discord, GitHub
- **Legal Links**: Terms, Privacy, Compliance

## 🚀 Usage

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎨 Styling

The component uses Tailwind CSS with custom glass morphism effects:
- Backdrop blur effects
- Gradient backgrounds
- Subtle animations
- Responsive breakpoints
- Custom hover states

## 🔧 Configuration

The component is fully configurable through props and state:
- Wallet connection mock data
- Staking tier calculations
- Product data arrays
- Governance proposals
- Color schemes and gradients

## 📱 Mobile Responsive

- **Header**: Stacks vertically on mobile
- **Navigation**: Wraps tabs on smaller screens
- **Cards**: Single column layout on mobile
- **Grid**: Adjusts from 4 columns to 1 column
- **Buttons**: Full width on mobile

This implementation provides a pixel-perfect recreation of the Hugging Face Space design while maintaining full React functionality and responsive behavior.
