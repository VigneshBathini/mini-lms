import axios from "axios";
import { attachInterceptors } from "./interceptors";

const API_BASE = "https://api.freeapi.app/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

attachInterceptors(apiClient);