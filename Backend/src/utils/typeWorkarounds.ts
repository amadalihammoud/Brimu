// Aggressive type workarounds for deployment

export function forceString(value: any): string {
  if (Array.isArray(value)) return value[0]?.toString() || '';
  return value?.toString() || '';
}

export function forceNumber(value: any): number {
  if (Array.isArray(value)) return parseInt(value[0]?.toString()) || 0;
  return parseInt(value?.toString()) || 0;
}

export function forceDate(value: any): Date {
  if (Array.isArray(value)) return new Date(value[0]?.toString() || '');
  return new Date(value?.toString() || '');
}

export function forceAny(value: any): any {
  return value as any;
}