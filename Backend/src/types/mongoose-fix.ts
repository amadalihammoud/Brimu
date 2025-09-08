// Type fixes for Mongoose issues
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
}

export {};