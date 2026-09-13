import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if token exists (checking both common token keys)
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Reject errors cleanly so components can handle fallbacks without forcing a page reload
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Return rejected promise to allow try/catch blocks in checkout page to handle errors locally
    return Promise.reject(error);
  }
);

// --- Order API Calls ---
export const createOrderApi = (data: { deliveryAddress: string; paymentMethod: string; items?: any[]; totalAmount?: number }) =>
  apiClient.post('/orders', data);

export const getMyOrdersApi = () => 
  apiClient.get('/orders/my-orders');

export const getRestaurantOrdersApi = (restaurantId: string) =>
  apiClient.get(`/orders/restaurant/${restaurantId}`);

export const getOrderByIdApi = (id: string) => 
  apiClient.get(`/orders/${id}`);

export const updateOrderStatusApi = (id: string, status: string) =>
  apiClient.patch(`/orders/${id}/status`, { status });

// --- Payment API Calls ---
export const processPaymentApi = (data: { orderId: string; paymentMethod: string; shouldFail?: boolean }) =>
  apiClient.post('/payments/process', data);