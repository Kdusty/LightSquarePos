/**
 * Role-based permission system
 * Usage: can(currentStaff, 'void')
 */
export const PERMISSIONS = {
  owner:   ['pos','analytics','transactions','inventory','inventory_edit','settings','staff','void','refund','discount_any','kitchen'],
  manager: ['pos','analytics','transactions','inventory','void','refund','discount_any','kitchen'],
  cashier: ['pos','kitchen'],
}

/**
 * @param {Object} staff - current logged-in staff object with a `role` field
 * @param {string} action - permission key to check
 * @returns {boolean}
 */
export const can = (staff, action) => {
  if (!staff) return false
  return PERMISSIONS[staff.role]?.includes(action) ?? false
}

export const ROLE_LABELS = { owner: 'Owner', manager: 'Manager', cashier: 'Cashier' }
export const ROLE_COLORS = { owner: 'var(--accent-text)', manager: 'var(--green-text)', cashier: 'var(--text2)' }
export const ROLE_BG     = { owner: 'var(--accent-bg)',   manager: 'var(--green-bg)',   cashier: 'var(--surface3)' }
