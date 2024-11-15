# Virtual Lab Sound

A web-based virtual laboratory application for physics learning focused on sound experiments. This application provides interactive virtual experiments, analytics, and learning tools for understanding sound wave concepts.

## Features

### Experiments
1. **Wave Generator**
  - Create different wave patterns (sine, square, triangle)  
  - Adjust frequency and amplitude
  - Real-time wave visualization 
  - Save and export results

2. **Sound Analysis** 
  - Record audio input
  - Download recordings
  - Save analysis results 

3. **Doppler Effect**
  - Interactive Doppler effect simulation
  - Adjustable source speed and frequency
  - Real-time audio feedback
  - Visual representation

### Learning Tools
- Interactive tutorials for each experiment
- Achievement system for tracking progress  
- Comprehensive analytics dashboard
- Experiment feedback system
- Exportable PDF reports
- User profiles

### Key Features
- Real-time experiment visualization
- Progress tracking & achievements
- Interactive tutorial system
- PDF export of results
- Comprehensive analytics

## Tech Stack
### Frontend
- React 18
- Material UI 
- D3.js/HTML Canvas for visualizations
- Web Audio API

### Backend  
- Firebase Authentication
- Cloud Firestore Database
- Firebase Analytics

## Firebase Integration
- **Authentication**
  - Email/password authentication
  - User management & sessions
  - Secure authentication flow

- **Cloud Firestore**
  - Collections:
    - achievements (track user achievements)
    - feedback (store experiment feedback)
    - progress (track experiment progress)
    - results (store experiment results)
    - users (user profiles & metadata)
  - Real-time data synchronization
  - Secure data access rules

- **Serverless Architecture**
  - Fully managed backend services
  - Auto-scaling infrastructure
  - High availability
  - Pay-as-you-go pricing

## License
MIT License

### Key Dependencies
```json
{
 "dependencies": {
   "@mui/material": "^6.1.6",
   "d3": "^7.9.0", 
   "firebase": "^11.0.1",
   "jspdf": "^2.5.2",
   "mermaid": "^11.4.0",
   "react": "^18.3.1",
   "react-joyride": "^2.9.2",
   "recharts": "^2.13.3"
 }
}


