export const parseStringParam = (param: any): string => 
  Array.isArray(param) ? param[0]?.toString() || '' : param?.toString() || '';

export const parseNumberParam = (param: any): number => 
  parseInt(parseStringParam(param)) || 0;

export const parseDateParam = (param: any): Date => 
  new Date(parseStringParam(param));

export const parseBooleanParam = (param: any): boolean => {
  const str = parseStringParam(param);
  return str === 'true' || str === '1';
};

export interface QueryParams {
  status?: string;
  client?: string;
  type?: string;
  category?: string;
  search?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
  [key: string]: any;
}