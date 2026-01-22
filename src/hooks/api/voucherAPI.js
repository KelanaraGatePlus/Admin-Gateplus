const BASE_URL = 'http://localhost:3000/api/discount-voucher'

// Helper untuk mendapatkan Bearer Token
const getAuthHeader = () => {
  const token = localStorage.getItem('adminToken')
  return { Authorization: `Bearer ${token}` }
}

// GET semua voucher (Superadmin only)
export const getVouchers = async () => {
  const res = await fetch(BASE_URL, { 
    headers: getAuthHeader() 
  })
  if (!res.ok) throw new Error('Failed to fetch vouchers')
  return res.json()
}

// GET voucher by ID (Superadmin only)
export const getVoucherById = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`, { 
    headers: getAuthHeader() 
  })
  if (!res.ok) throw new Error('Failed to fetch voucher')
  return res.json()
}

// POST tambah voucher (Superadmin only)
export const createVoucher = async (voucherData) => {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      ...getAuthHeader() 
    },
    body: JSON.stringify(voucherData)
  })
  if (!res.ok) throw new Error('Failed to create voucher')
  return res.json()
}

// PATCH update voucher (Superadmin only)
export const updateVoucher = async (id, voucherData) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json', 
      ...getAuthHeader() 
    },
    body: JSON.stringify(voucherData)
  })
  if (!res.ok) throw new Error('Failed to update voucher')
  return res.json()
}

// DELETE voucher (Superadmin only)
export const deleteVoucher = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  })
  if (!res.ok) throw new Error('Failed to delete voucher')
  return res.json()
}

// GET validasi & hitung diskon (All authenticated users)
export const validateVoucher = async (code, amount) => {
  const res = await fetch(`${BASE_URL}/count-discount/${code}/${amount}`, {
    headers: getAuthHeader()
  })
  if (!res.ok) throw new Error('Voucher validation failed')
  return res.json()
}