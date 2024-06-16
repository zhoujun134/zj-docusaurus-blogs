import axios, {AxiosInstance, AxiosError, InternalAxiosRequestConfig} from 'axios';
import {IResult} from "@site/src/utils/interface/zjType";

// 设置 axios 默认配置
axios.defaults.withCredentials = true;

// 创建 axios 实例
const service: AxiosInstance = axios.create({
    baseURL: "https://zbus.top", // 确保这是正确的 baseURL
    timeout: 15000,
    headers: {'Content-Type': 'application/json;charset=utf-8'},
});

let loading: any;
let requestCount: number = 0; // 正在请求的数量

// 显示 loading
const showLoading = () => {
    if (requestCount === 0 && !loading) {
        // 这里可以使用 Element UI 的 Loading 组件，或者您选择的其他库
        // loading = ElLoading.service({
        //   lock: true,
        //   text: "拼命加载中，请稍后...",
        //   background: 'rgba(0, 0, 0, 0.7)',
        // });
    }
    requestCount++;
};

// 隐藏 loading
const hideLoading = () => {
    requestCount--;
    if (requestCount === 0 && loading) {
        loading.close();
    }
};

// 请求拦截器
service.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    showLoading();
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
    hideLoading();
    const result: IResult<any> = response.data;
    // 处理其他逻辑
    return response.data
}, (error: AxiosError) => {
    console.error('err' + error);
    hideLoading();
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
    const errResult: IResult<object> = {
        code: "-1",
        message: errorMsg,
        data: {},
    }
    return Promise.reject(errResult);
});

export default service;
