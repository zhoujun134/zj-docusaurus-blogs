import axios, {AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig} from 'axios';
import zsBlogConfig from "@site/zs-blog-config";
import {createRequestState} from "@site/src/utils/requestState";

// 设置 axios 默认配置
axios.defaults.withCredentials = true;

// 创建 axios 实例
const service = axios.create({
    baseURL: zsBlogConfig.apiConfig.baseUrl, // 确保这是正确的 baseURL
    timeout: zsBlogConfig.apiConfig.timeout,
    headers: zsBlogConfig.apiConfig.headers,
});

const requestState = createRequestState();

// 请求拦截器
service.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    requestState.start();
    // 如果是 GET 请求且有 params 参数，则处理参数
    if (config.method === 'get' && config.params) {
        // 这里对 config.url 进行处理，将 params 转换为查询字符串
        // 请根据您的实际需求调整参数编码逻辑
    }
    return config;
}, (error: AxiosError) => {
    return Promise.reject(error);
});

// 响应拦截器
service.interceptors.response.use((response) => {
    requestState.finish();
    return response.data
}, (error: AxiosError) => {
    console.error('err' + error);
    requestState.finish();
    let errorMsg: string = '请求出现异常';
    if (error.response) {
        // 服务器端返回的异常信息
        errorMsg = error.message || errorMsg;
    } else if (error.request) {
        // 请求已发出，但没有收到响应
        errorMsg = '请求已发出，但没有收到响应';
    } else {
        // 发生了触发请求错误的问题
        errorMsg = error.message || errorMsg;
    }
    const errResult = {
        code: "-1",
        message: errorMsg,
        data: {},
    }
    return Promise.reject(errResult);
});

export default function request<T>(config: AxiosRequestConfig): Promise<T> {
    return service.request<unknown, T>(config);
}
