/* eslint-disable @typescript-eslint/no-explicit-any */
import { config } from "@/config";
import axios from "axios";

const BASE_URL = config.base_url;

export default class BaseRequest {
  baseUrl: string;
  constructor() {
    this.baseUrl = BASE_URL;
    this.setAuth();
  }

  setAuth() {
    axios.interceptors.request.use(
      (config) => {
        const lang = localStorage.getItem("language") || "en-US";
        const accessToken = localStorage.getItem("access_token");
        if (accessToken) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        config.headers["lang"] = lang;
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    axios.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  async get(path = "", params = {}): Promise<any> {
    try {
      return await axios.get(BASE_URL + `${path}`, {
        params: params,
      });
    } catch (error) {
      return error;
    }
  }
  async post(path = "", data = {}): Promise<any> {
    try {
      return await axios.post(BASE_URL + path, data);
    } catch (error) {
      return this._errorHandler(error);
    }
  }
  async put(path = "", data = {}): Promise<any> {
    try {
      return await axios.put(BASE_URL + path, data);
    } catch (error) {
      return this._errorHandler(error);
    }
  }
  async delete(path = "", params = {}): Promise<any> {
    try {
      return await axios.delete(BASE_URL + path, params);
    } catch (error) {
      return this._errorHandler(error);
    }
  }
  async patch(path = "", data = {}): Promise<any> {
    try {
      return await axios.patch(BASE_URL + path, data);
    } catch (error) {
      return this._errorHandler(error);
    }
  }
  async _errorHandler(err: any) {
    console.log(err, "err");

    throw err;
  }
}
