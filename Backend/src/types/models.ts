import { Document, Types } from 'mongoose';

// User Model Types
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user' | 'employee';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

// Equipment Model Types
export interface IEquipment extends Document {
  _id: Types.ObjectId;
  name: string;
  type: string;
  status: 'available' | 'in-use' | 'maintenance' | 'retired';
  serialNumber?: string;
  purchaseDate?: Date;
  maintenanceSchedule?: Date[];
  assignedTo?: Types.ObjectId;
  location?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Service Model Types
export interface IService extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  duration: number; // in hours
  requiredEquipment?: Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Order Model Types
export interface IOrder extends Document {
  _id: Types.ObjectId;
  orderNumber: string;
  client: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  services: Array<{
    service: Types.ObjectId;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  scheduledDate?: Date;
  assignedTeam?: Types.ObjectId[];
  assignedEquipment?: Types.ObjectId[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Quote Model Types
export interface IQuote extends Document {
  _id: Types.ObjectId;
  quoteNumber: string;
  client: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  services: Array<{
    service: Types.ObjectId;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  validUntil: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// File Model Types
export interface IFile extends Document {
  _id: Types.ObjectId;
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
  uploadedBy: Types.ObjectId;
  relatedTo?: {
    model: string;
    id: Types.ObjectId;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Payment Model Types
export interface IPayment extends Document {
  _id: Types.ObjectId;
  order: Types.ObjectId;
  amount: number;
  method: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'pix';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  processedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}