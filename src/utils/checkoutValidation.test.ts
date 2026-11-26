import { describe, expect, it } from 'vitest';
import type { ShippingAddress } from '../types';
import { validateShippingAddress } from './checkoutValidation';

const validAddress: ShippingAddress = {
  fullName: 'Asha Rao',
  email: 'asha@example.in',
  phone: '+91 98765 43210',
  addressLine1: '12 Market Road',
  city: 'Indore',
  state: 'Madhya Pradesh',
  pincode: '452001',
};

describe('checkout address validation', () => {
  it('accepts valid Indian address, phone, email, and PIN values', () => {
    expect(validateShippingAddress(validAddress)).toBeNull();
  });

  it('rejects invalid email, phone, and PIN values with specific errors', () => {
    expect(validateShippingAddress({ ...validAddress, email: 'not-an-email' })).toMatch(/email/i);
    expect(validateShippingAddress({ ...validAddress, phone: '1234567890' })).toMatch(/mobile/i);
    expect(validateShippingAddress({ ...validAddress, pincode: '012345' })).toMatch(/PIN/i);
  });

  it('requires the core shipping address fields', () => {
    expect(validateShippingAddress({ ...validAddress, city: ' ' })).toMatch(/required/i);
  });
});
