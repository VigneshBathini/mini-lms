import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from './types';
import { useAuthStore } from '../../store/authStore';
import { clearAuthTokens, getAccessToken, getRefreshToken, saveAccessToken, saveRefreshToken } from '../auth/tokenStorage';
import { endpoints } from './endpoints';

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

const tryRefreshAccessToken = async (client: AxiosInstance) => {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  const refreshClient = axios.create({
    baseURL: client.defaults.baseURL,
    timeout: client.defaults.timeout,
  });

  try {
    const response = await refreshClient.post(endpoints.refreshToken, { refreshToken });
    const accessToken =
      response.data?.accessToken ??
      response.data?.data?.accessToken ??
      response.data?.access_token ??
      response.data?.data?.access_token;
    const nextRefreshToken =
      response.data?.refreshToken ??
      response.data?.data?.refreshToken ??
      response.data?.refresh_token ??
      response.data?.data?.refresh_token;

    if (!accessToken) {
      return null;
    }

    await saveAccessToken(accessToken);
    if (nextRefreshToken) {
      await saveRefreshToken(nextRefreshToken);
    }

    return accessToken as string;
  } catch {
    return null;
  }
};

export const attachInterceptors = (client: AxiosInstance) => {
  client.interceptors.request.use(async config => {
    const token = await getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  client.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryableRequest | undefined;
      const isRefreshCall = originalRequest?.url?.includes(endpoints.refreshToken);

      if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isRefreshCall) {
        originalRequest._retry = true;
        const nextAccessToken = await tryRefreshAccessToken(client);

        if (nextAccessToken) {
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
          return client(originalRequest);
        }
      }

      // if unauthorized, clear auth
      if (error.response?.status === 401) {
        const auth = useAuthStore.getState();
        await clearAuthTokens();
        await auth.logout();
      }

      const apiError: ApiError = {
        message:
          (error.response?.data as any)?.message ||
          error.message ||
          "Something went wrong",
        status: error.response?.status || 500,
      };

      return Promise.reject(apiError);
    }
  );
};
