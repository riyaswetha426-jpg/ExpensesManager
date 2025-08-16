export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (amount: number): string => {
  return new Intl.NumberFormat('en-IN').format(amount);
};

export const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/[₹,\s]/g, '')) || 0;
};