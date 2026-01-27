const BASE_URL = 'http://localhost:3000/api/discount-voucher'

// Helper untuk mendapatkan Bearer Token
const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  
  if (!token) {
    throw new Error('No authentication token found. Please login.')
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

// GET semua voucher (Superadmin only)
export const getVouchers = async () => {
  try {
    const res = await fetch(BASE_URL, { 
      headers: getAuthHeader() 
    })
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Failed to fetch vouchers' }))
      throw new Error(errorData.message || 'Failed to fetch vouchers')
    }
    
    return res.json()
  } catch (error) {
    console.error('❌ getVouchers error:', error)
    throw error
  }
}

// GET voucher by ID (Superadmin only)
export const getVoucherById = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/${id}`, { 
      headers: getAuthHeader() 
    })
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Failed to fetch voucher' }))
      throw new Error(errorData.message || 'Failed to fetch voucher')
    }
    
    return res.json()
  } catch (error) {
    console.error('❌ getVoucherById error:', error)
    throw error
  }
}

// POST tambah voucher (Superadmin only)
export const createVoucher = async (voucherData) => {
  try {
    console.log('📤 Sending voucher data:', voucherData)
    
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(voucherData)
    })
    
    const responseText = await res.text()
    console.log('📥 Response:', responseText)
    
    if (!res.ok) {
      let errorMessage = 'Failed to create voucher'
      try {
        const errorData = JSON.parse(responseText)
        errorMessage = errorData.message || errorMessage
        
        // Jika ada detail validasi error
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.map(e => `${e.field}: ${e.message}`).join(', ')
        }
      } catch (e) {
        errorMessage = responseText
      }
      throw new Error(errorMessage)
    }
    
    return JSON.parse(responseText)
  } catch (error) {
    console.error('❌ createVoucher error:', error)
    throw error
  }
}

// PATCH update voucher (Superadmin only)
export const updateVoucher = async (id, voucherData) => {
  try {
    console.log('📤 Updating voucher:', id, voucherData)
    
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      body: JSON.stringify(voucherData)
    })
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Failed to update voucher' }))
      throw new Error(errorData.message || 'Failed to update voucher')
    }
    
    return res.json()
  } catch (error) {
    console.error('❌ updateVoucher error:', error)
    throw error
  }
}

// DELETE voucher (Superadmin only)
export const deleteVoucher = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    })
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Failed to delete voucher' }))
      throw new Error(errorData.message || 'Failed to delete voucher')
    }
    
    return res.json()
  } catch (error) {
    console.error('❌ deleteVoucher error:', error)
    throw error
  }
}

// GET validasi & hitung diskon (All authenticated users)
export const validateVoucher = async (code, amount) => {
  try {
    const res = await fetch(`${BASE_URL}/count-discount/${code}/${amount}`, {
      headers: getAuthHeader()
    })
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Voucher validation failed' }))
      throw new Error(errorData.message || 'Voucher validation failed')
    }
    
    return res.json()
  } catch (error) {
    console.error('❌ validateVoucher error:', error)
    throw error
  }
}

