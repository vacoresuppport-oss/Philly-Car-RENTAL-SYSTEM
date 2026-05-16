import { db } from './firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { VehicleStatus } from './types';

const vehicles = [
  { 
    plateNumber: 'BCD 4567', 
    make: 'Tesla', 
    model: 'Model 3', 
    year: 2023, 
    status: VehicleStatus.RENTED, 
    dailyRate: 120, 
    mileage: 12400,
    fuelLevel: 78,
    location: { lat: 39.9526, lng: -75.1652, speed: 78, heading: 180 },
    vin: '1FA6P8CF8...'
  },
  { 
    plateNumber: 'EFG 8901', 
    make: 'Rivian', 
    model: 'R1S', 
    year: 2024, 
    status: VehicleStatus.AVAILABLE, 
    dailyRate: 180, 
    mileage: 2100,
    fuelLevel: 92,
    location: { lat: 39.9626, lng: -75.1552, speed: 0, heading: 45 },
    vin: '1HGCP22...'
  },
  { 
    plateNumber: 'XYZ 1234', 
    make: 'Porsche', 
    model: 'Taycan', 
    year: 2023, 
    status: VehicleStatus.AVAILABLE, 
    dailyRate: 250, 
    mileage: 18900,
    fuelLevel: 88,
    location: { lat: 39.9426, lng: -75.1752, speed: 0, heading: 270 },
    vin: 'WP0AA2Y...'
  }
];

export async function seedData() {
  try {
    const vehiclesCol = collection(db, 'vehicles');
    for (const v of vehicles) {
      await addDoc(vehiclesCol, v);
    }
    
    // Add an admin for common access (e.g., current user email or specific UID if known)
    // For now we just add a placeholder admin doc
    await setDoc(doc(db, 'admins', 'placeholder_admin'), { email: 'admin@voltdrive.com' });
    
    console.log("Seeding completed successfully");
  } catch (e) {
    console.error("Error seeding data:", e);
  }
}
