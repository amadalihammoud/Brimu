// Type fixes for Mongoose issues
declare module 'mongoose' {
  interface Document {
    comparePassword?: (password: string) => Promise<boolean>;
    updateStatus?: (status: string) => Promise<this>;
    approve?: (data?: any, approvedBy?: any) => Promise<this>;
    reject?: (reason: string) => Promise<this>;
    send?: (data: any) => Promise<this>;
    markAsPaid?: (paidBy?: any, notes?: string) => Promise<this>;
    cancel?: (reason?: string, cancelledBy?: any) => Promise<this>;
    addReceipt?: (receipt: any) => Promise<this>;
    requestRefund?: (requestedBy: any, reason: string, amount?: number) => Promise<this>;
    assignEquipment?: (equipmentId: string) => Promise<this>;
    removeEquipment?: (equipmentId: string) => Promise<this>;
    canUpload?: (fileSize: number, count: number) => boolean;
    canAccess?: (userId: string, action?: string) => boolean;
    incrementView?: () => Promise<this>;
    incrementDownload?: () => Promise<this>;
    hasPermission?: (permission: string) => boolean;
    updateUserStats?: (action: string) => Promise<this>;
    
    // Virtual properties
    daysUntilMaintenance?: number;
    daysUntilExpiry?: number;
    totalAmount?: number;
    url?: string;
    thumbnailUrl?: string;
    assignedTo?: any;
    assignedOrder?: any;
    updatedAt?: Date;
    deactivatedAt?: Date;
    changes?: any[];
    notes?: any[];
    lastModifiedBy?: any;
    category?: any;
    estimatedDuration?: any;
    preferredDate?: any;
  }
}

// Removed conflicting global declaration - using the one in auth.ts

export {};