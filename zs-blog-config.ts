// 基础配置文件 zs-blog-config.ts
const zsBlogConfig = {
    apiConfig: {
        // 接口请求的baseUrl
        baseUrl: "https://zbus.top",
        // baseUrl: "http://localhost:8080/zs",
        // 接口的超时时间设置
        timeout: 15000,
        headers: {'Content-Type': 'application/json;charset=utf-8'}
    }
}
export default zsBlogConfig;
