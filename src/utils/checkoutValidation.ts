import type { ShippingAddress } from '../types';

export function validateShippingAddress(address: ShippingAddress): string | null {
  if (!address.fullName.trim() || !address.addressLine1.trim()
    || !address.city.trim() || !address.state.trim()) {
    return 'Please complete all required shipping fields.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email.trim())) {
    return 'Enter a valid email address.';
  }
  const phone = address.phone.replace(/[\s()-]/g, '');
  if (!/^(?:\+?91)?[6-9]\d{9}$/.test(phone)) {
    return 'Enter a valid 10-digit Indian mobile number.';
  }
  if (!/^[1-9]\d{5}$/.test(address.pincode.trim())) {
    return 'Enter a valid 6-digit Indian PIN code.';
  }
  return null;
}
