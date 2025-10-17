# FakePE User App

UPI-style mobile application for scanning QR codes and completing payments on the FakePE payment gateway.

## 🚀 Features

- 📸 **QR Code Scanner** - Real-time camera scanning
- 💳 **UPI Payments** - Complete payment flow with PIN
- 📊 **Transaction History** - View all your payments
- 💰 **Wallet Management** - Check balance and top-up
- 🎨 **Modern UI** - Mobile-first responsive design
- 🔐 **Secure** - PIN-based authentication

## 📦 Installation

```bash
npm install
```

## 🔧 Configuration

Create `.env` file:

```env
VITE_API_URL=http://localhost:4000
```

## 🚀 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📱 Usage

### First-Time Setup

1. Open http://localhost:3001
2. Fill in your details:
   - Name
   - Phone (10 digits)
   - Email
   - UPI ID (e.g., `yourname@fakepe`)
   - Initial balance
3. Click "Create Account"

### Making a Payment

1. Click "Scan & Pay"
2. Allow camera access
3. Scan merchant QR code
4. Review payment details
5. Enter PIN (any 4-6 digits)
6. Confirm payment

### Managing Wallet

- **View Balance**: Home screen
- **Add Money**: Profile → Add Money
- **Transaction History**: History tab

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **html5-qrcode** - QR scanner
- **Lucide React** - Icons
- **Axios** - HTTP client
- **React Router** - Navigation

## 📸 Screenshots

### Home Dashboard
Beautiful wallet dashboard with balance and recent transactions

### QR Scanner
Real-time camera scanning with manual entry option

### Payment Confirmation
Two-step confirmation with PIN entry

### Transaction History
Filterable transaction list with date grouping

## 🔗 Related Repositories

- **Main API**: [fake-pe](https://github.com/Mihir-Rabari/fake-pe)
- **SDK**: [@fakepe/sdk](https://github.com/Mihir-Rabari/fakePE-sdk)

## 📚 Documentation

For complete documentation, visit the [main repository](https://github.com/Mihir-Rabari/fake-pe).

## ⚠️ Disclaimer

This is a MOCK payment system for testing only. All transactions use fake money.

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 👨‍💻 Author

**Mihir Rabari**

---

**⭐ Star the repo if you find it useful!**
