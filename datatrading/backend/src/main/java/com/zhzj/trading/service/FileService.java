package com.zhzj.trading.service;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.web.multipart.MultipartFile;

public interface FileService {

    /**
     * 上传文件，返回 OSS objectKey。
     *
     * @param file 文件
     * @return OSS objectKey
     */
    String uploadFile(MultipartFile file);

    /**
     * 下载文件。
     *
     * @param objectKey OSS objectKey
     * @param response  HTTP 响应
     */
    void downloadFile(String objectKey, HttpServletResponse response);

    /**
     * 从 SP 下载文件并透传到当前响应。
     *
     * @param fileUrl  SP 文件 objectKey
     * @param response HTTP 响应
     */
    void downloadSpFile(String fileUrl, HttpServletResponse response);

    /**
     * 删除文件。
     *
     * @param fileUrl 文件访问地址或 OSS objectKey
     */
    void removeFile(String fileUrl);
}
