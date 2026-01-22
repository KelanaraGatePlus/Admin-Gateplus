// Use an explicit public env var when available. In development default to HTTP
// to match the Next dev server which typically runs without TLS.
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://localhost:3000');

export default backendUrl;