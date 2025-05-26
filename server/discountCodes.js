// Admin discount codes for Rich Habits Wrestling Camps
export const discountCodes = {
  'RH25-TKD8W-GZ1PQ-XJUM3-YBF4A': {
    code: 'RH25-TKD8W-GZ1PQ-XJUM3-YBF4A',
    type: 'admin',
    discountType: 'percentage',
    discountValue: 100, // 100% off - FREE
    description: 'Admin 100% Discount - FREE',
    validFrom: new Date('2025-01-01'),
    validUntil: new Date('2025-12-31'),
    maxUses: null, // Unlimited uses
    currentUses: 0,
    active: true,
    applicableEvents: 'all' // Can be used for any event
  },
  'CAMP25-RH7M-XL9K-4TPQ': {
    code: 'CAMP25-RH7M-XL9K-4TPQ',
    type: 'promotional',
    discountType: 'percentage',
    discountValue: 25, // 25% off
    description: '25% Off Wrestling Camp Registration',
    validFrom: new Date('2025-01-01'),
    validUntil: new Date('2025-12-31'),
    maxUses: 100, // Limited to 100 uses
    currentUses: 0,
    active: true,
    applicableEvents: 'all'
  }
};

export function validateDiscountCode(code, options = {}) {
  const discount = discountCodes[code];
  
  if (!discount) {
    return { valid: false, error: 'Invalid discount code' };
  }
  
  if (!discount.active) {
    return { valid: false, error: 'This discount code is no longer active' };
  }
  
  const now = new Date();
  if (now < discount.validFrom || now > discount.validUntil) {
    return { valid: false, error: 'This discount code has expired' };
  }
  
  if (discount.maxUses && discount.currentUses >= discount.maxUses) {
    return { valid: false, error: 'This discount code has reached its usage limit' };
  }
  
  // Team registration minimum requirement
  if (options.isTeamRegistration && options.teamSize < 5) {
    return { 
      valid: false, 
      error: 'Team registrations must have at least 5 athletes to use this discount code' 
    };
  }
  
  return { 
    valid: true, 
    discount: discount 
  };
}

export function applyDiscount(originalPrice, discountCode) {
  const validation = validateDiscountCode(discountCode);
  
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
      finalPrice: originalPrice
    };
  }
  
  const discount = validation.discount;
  let discountAmount = 0;
  let finalPrice = originalPrice;
  
  if (discount.discountType === 'percentage') {
    discountAmount = (originalPrice * discount.discountValue) / 100;
    finalPrice = originalPrice - discountAmount;
  } else if (discount.discountType === 'fixed') {
    discountAmount = discount.discountValue;
    finalPrice = Math.max(0, originalPrice - discountAmount);
  }
  
  return {
    success: true,
    originalPrice: originalPrice,
    discountAmount: discountAmount,
    finalPrice: finalPrice,
    discountPercentage: discount.discountValue,
    discountDescription: discount.description
  };
}

export function incrementDiscountCodeUsage(code) {
  if (discountCodes[code]) {
    discountCodes[code].currentUses++;
  }
}