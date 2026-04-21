# SmartHub Garden Dashboard 🌱

A premium Next.js web application designed to interface with the SmartHub IoT Platform for real-time garden irrigation monitoring and control.

![Dashboard Preview](https://img.shields.io/badge/Status-Active-success)
![Next.js](https://img.shields.io/badge/Next.js-14+-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)

## 🚀 Features

### Real-Time Monitoring
- **Soil Moisture Tracking**: Live moisture readings with visual progress indicators
- **Pump Status**: Real-time pump state monitoring with animated indicators
- **Operation Mode**: Automatic vs Manual override detection (10-second override logic)
- **Connection Status**: Live connection indicator with the IoT device

### Smart Control Panel
- **Toggle Switch Control**: Elegant centered ON/OFF toggle for pump control
- **Visual Feedback**: Immediate status updates and command confirmation
- **Manual Override**: 10-second manual control with automatic return to auto mode

### Activity History
- **Complete Audit Trail**: All sensor readings and command executions
- **Advanced Filtering**: Filter by operation mode and pump state
- **Command Tracking**: Separate tracking for manual commands vs sensor data
- **Real-time Updates**: Auto-refreshing data every 5-10 seconds

## 🎨 Design System

### Premium Color Palette
- **Primary**: `#FFEDCE` (Light Cream)
- **Secondary**: `#FFC193` (Warm Orange) 
- **Accent**: `#FF8383` (Coral Red)
- **Critical**: `#FF3737` (Bright Red)

### UI Features
- **Glassmorphism Design**: Modern frosted glass effects
- **Smooth Animations**: Hover effects and state transitions
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Premium Typography**: Clean, readable font hierarchy

## 🛠 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: SWR (React Hooks for Data Fetching)
- **Icons**: Lucide React
- **State Management**: React Hooks

## 📡 API Integration

The dashboard integrates with the SmartHub IoT Platform:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/device/status` | GET | Live device status |
| `/api/device/history` | GET | Historical data |
| `/api/device/command` | POST | Send pump commands |

**Target Device**: `garden_pump_01`

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smartsprinkler
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Dashboard Sections

### 1. Live Monitor
- **Moisture Card**: Shows current soil moisture level (0-4095) with condition indicator
- **Pump Status Card**: Displays current pump state with animated indicators
- **Operation Mode Card**: Shows automatic vs manual mode with override timer
- **Control Panel**: Centered toggle switch for pump control

### 2. Activity History
- **Data Table**: Chronological list of all sensor readings and commands
- **Filtering Options**: 
  - Mode Filter: All, Automatic, Manual
  - State Filter: All, Pump ON, Pump OFF
- **Record Types**:
  - 🔧 Command: Manual pump control executions
  - 📊 Sensor: Automatic sensor data readings

## 🔧 Configuration

### API Endpoints
Update the API base URL in the component if needed:
```javascript
const API_BASE = 'https://smarthublite.vercel.app/api/device'
```

### Device ID
The dashboard is configured for device `garden_pump_01`. Update if using a different device:
```javascript
const DEVICE_ID = 'garden_pump_01'
```

### Polling Intervals
- **Status Updates**: Every 5 seconds
- **History Updates**: Every 10 seconds

## 📱 Responsive Design

The dashboard is fully responsive:
- **Desktop**: Full 3-column layout with all features
- **Tablet**: Responsive grid that adapts to screen size
- **Mobile**: Single-column layout with touch-friendly controls

## 🔒 Data Structure

### Sensor Data Format
```json
{
  "_id": "unique_id",
  "device_id": "garden_pump_01",
  "data": {
    "moisture": 0,
    "condition": "WET",
    "pump_state": "OFF",
    "mode": "AUTOMATIC"
  },
  "timestamp": "2026-04-21T15:22:59.560Z"
}
```

### Command Execution Format
```json
{
  "_id": "unique_id",
  "device_id": "garden_pump_01",
  "data": {
    "status": "command_executed"
  },
  "timestamp": "2026-04-21T15:25:04.336Z"
}
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Other Platforms
```bash
npm run build
npm run start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the [Next.js Documentation](https://nextjs.org/docs)
- Review the [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Built with ❤️ for smart garden automation**