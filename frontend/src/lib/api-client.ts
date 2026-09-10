import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if accessToken exists
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto-logout on 401 Unauthorized responses (ignoring login page errors)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 && 
      typeof window !== 'undefined' && 
      !window.location.pathname.includes('/login')
    ) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// --- Order API Calls ---
export const createOrderApi = (data: { deliveryAddress: string; paymentMethod: string }) =>
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