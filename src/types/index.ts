export type Role = 'citizen' | 'ambulance' | 'fireStation' | 'hospital' | 'controlCenter';

export interface User {
  id: string;
  role: Role;
  name: string;
  phone: string;
  password?: string;
  status: 'active' | 'pending' | 'rejected';
  createdAt: number;
}

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface Ambulance extends User {
  role: 'ambulance';
  driverName: string;
  licenseNumber: string;
  vehicleNumber: string;
  vehicleType: string;
  location?: Location;
  available: boolean;
}

export interface FireStation extends User {
  role: 'fireStation';
  stationName: string;
  location?: Location;
}

export interface Hospital extends User {
  role: 'hospital';
  hospitalName: string;
  address: string;
  emergencyContact: string;
  hospitalType: string;
  location?: Location;
}

export type RequestStatus = 'Requested' | 'Accepted' | 'En Route' | 'Arrived' | 'Patient Picked' | 'Heading To Hospital' | 'Completed' | 'Fire Under Control' | 'Resolved';

export interface AmbulanceRequest {
  id: string;
  citizenId: string;
  location: Location;
  description: string;
  landmark?: string;
  hospitalId: string; // Required — citizen must choose hospital
  hospitalName?: string;
  assignedAmbulanceId?: string;
  status: RequestStatus;
  createdAt: number;
  updatedAt: number;
}

export interface FireRequest {
  id: string;
  citizenId: string;
  location: Location;
  fireType: string;
  floors: number;
  position: 'Top' | 'Middle' | 'Bottom';
  description: string;
  assignedStationId?: string;
  status: RequestStatus;
  createdAt: number;
  updatedAt: number;
}

export type ComplaintStatus = 'Submitted' | 'Under Review' | 'Assigned' | 'Action Taken' | 'Resolved';

export interface Complaint {
  id: string;
  citizenId: string;
  title: string;
  description: string;
  photos?: string[];
  videos?: string[];
  status: ComplaintStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CommunityAlert {
  id: string;
  creatorId: string;
  type: string;
  description: string;
  location: Location;
  photos?: string[];
  videos?: string[];
  status: 'Pending' | 'Published' | 'Rejected';
  createdAt: number;
}

export interface BloodRequest {
  id: string;
  requesterId: string;
  bloodGroup: string;
  location: Location;
  description: string;
  contactNumber: string;
  createdAt: number;
}

export interface UAVMission {
  id: string;
  hospitalId: string;
  pickupLocation: Location;
  destinationLocation: Location;
  description: string;
  status: 'Pending' | 'Approved' | 'In Flight' | 'Delivered' | 'Rejected';
  currentLocation?: Location;
  createdAt: number;
}

export interface LiveLocation {
  entityId: string;
  entityType: 'ambulance' | 'fireVehicle' | 'uav' | 'vtol';
  location: Location;
  timestamp: number;
  speed?: number;
  altitude?: number; // For VTOL/UAV
}
