import { apiClient } from './client';
import { endpoints } from './endpoints';
import { User } from '../../types/user';

interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

interface RegisterPayload {
  fullName: string;
  username: string;
  email: string;
  password: string;
}

type ApiAuthResponse = {
  data?: {
    accessToken?: string;
    refreshToken?: string;
    user?: RawApiUser;
  };
};

type RawApiUser = {
  _id?: string;
  id?: string;
  fullName?: string;
  username?: string;
  email?: string;
  avatar?: {
    url?: string;
  };
};

const toUser = (raw?: RawApiUser): User => ({
  id: String(raw?._id ?? raw?.id ?? ''),
  name: raw?.fullName ?? raw?.username ?? 'User',
  email: String(raw?.email ?? ''),
  avatar: raw?.avatar?.url,
});

export const authService = {
  async login(email: string, password: string) {
    const response = await apiClient.post<ApiAuthResponse>(endpoints.login, {
      email,
      password,
    });

    const data = response.data?.data;
    if (!data?.accessToken || !data?.user) {
      throw new Error('Invalid login response');
    }

    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: toUser(data.user),
    } as LoginResponse;
  },

  async register(payload: RegisterPayload) {
    const response = await apiClient.post<ApiAuthResponse>(endpoints.register, payload);
    const data = response.data?.data;
    if (data?.accessToken && data?.user) {
      return {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: toUser(data.user),
      } as LoginResponse;
    }

    // FreeAPI register can return user without tokens. Auto-login to keep app flow consistent.
    return this.login(payload.email, payload.password);
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get<{ data?: RawApiUser }>('/users/current-user');
    return toUser(response.data?.data);
  },
};
