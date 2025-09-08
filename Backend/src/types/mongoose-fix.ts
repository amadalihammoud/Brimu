// Type fixes for Mongoose issues
import { ParsedQs } from 'qs';

// Helper functions for query parameter validation
export function parseStringParam(param: string | ParsedQs | (string | ParsedQs)[] | undefined): string {
  if (Array.isArray(param)) return param[0]?.toString() || '';
  return param?.toString() || '';
}

export function parseNumberParam(param: string | number | ParsedQs | (string | ParsedQs)[] | undefined): number {
  const str = parseStringParam(param);
  return parseInt(str) || 0;
}

export function parseBooleanParam(param: string | ParsedQs | (string | ParsedQs)[] | undefined): boolean {
  const str = parseStringParam(param);
  return str === 'true' || str === '1';
}
declare module 'mongoose' {
  interface Document {
    comparePassword?: (password: string) => Promise<boolean>;
    updateStatus?: (status: string) => Promise<this>;
    approve?: (data: any) => Promise<this>;
    reject?: (reason: string) => Promise<this>;
    send?: (data: any) => Promise<this>;
    markAsPaid?: () => Promise<this>;
    cancel?: (reason?: string) => Promise<this>;
    addReceipt?: (receipt: any) => Promise<this>;
    requestRefund?: (data: any) => Promise<this>;
    assignEquipment?: (equipmentId: string) => Promise<this>;
    removeEquipment?: (equipmentId: string) => Promise<this>;
    canUpload?: (fileSize: number) => boolean;
    canAccess?: (userId: string) => boolean;
    incrementView?: () => Promise<this>;
    incrementDownload?: () => Promise<this>;
    hasPermission?: (permission: string) => boolean;
    
    // Virtual properties
    daysUntilMaintenance?: number;
    daysUntilExpiry?: number;
    totalAmount?: number;
    url?: string;
    thumbnailUrl?: string;
    assignedTo?: string;
    assignedOrder?: string;
    updatedAt?: Date;
    deactivatedAt?: Date;
    changes?: any[];
    notes?: any[];
    lastModifiedBy?: string;
  }
  
  interface Model<T, TQueryHelpers = {}, TMethods = {}, TVirtuals = {}, TSchema = any> {
    findByClient?: (clientId: string) => Promise<T[]>;
    findByStatus?: (status: string) => Promise<T[]>;
    findByCategory?: (category: string) => Promise<T[]>;
    findScheduled?: (startDate: Date, endDate: Date) => Promise<T[]>;
    findByEquipment?: (equipmentId: string) => Promise<T[]>;
    findPopular?: () => Promise<T[]>;
    findExpired?: () => Promise<T[]>;
    findExpiringSoon?: (days?: number) => Promise<T[]>;
    findOverdue?: () => Promise<T[]>;
    findDueSoon?: (days?: number) => Promise<T[]>;
    getStats?: () => Promise<any>;
    getAvailableEquipment?: (date: Date, excludeOrderId?: string) => Promise<any[]>;
    checkEquipmentDateConflict?: (equipmentId: string, date: Date, excludeOrderId?: string) => Promise<T[]>;
  }
}

export {};