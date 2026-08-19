package com.zhzj.trading.service.impl;

import java.io.InputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

import jakarta.servlet.http.HttpServletResponse;

import org.apache.shiro.SecurityUtils;
import org.apache.shiro.subject.Subject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriUtils;
import org.springframework.web.util.UriComponentsBuilder;

import com.zhzj.oss.client.OssClient;
import com.zhzj.oss.client.model.OssDownloadResource;
import com.zhzj.trading.service.FileService;
import com.zhzj.trading.service.support.file.UploadFileTypeValidator;
import com.zhzj.trading.util.UuidUtil;
import org.apache.commons.lang3.StringUtils;
import org.apache.shiro.session.Session;

@Service
public class FileServiceImpl implements FileService {

    private static final Logger logger = LoggerFactory.getLogger(FileServiceImpl.class);
    private static final long MAX_UPLOAD_SIZE = 100L * 1024 * 1024;
    private static final String DEFAULT_USER = "defaultUnLoginUser";
    private static final String PROJECT_PREFIX = "trading";

    @Autowired
    private OssClient ossClient;

    @Autowired
    @Qualifier("plainRestTemplate")
    private RestTemplate plainRestTemplate;

    @Autowired
    @Qualifier("loadBalancedRestTemplate")
    private RestTemplate loadBalancedRestTemplate;

    @Value("${trading.platform-auth.base-url:http://sp-service}")
    private String spBaseUrl;

    @Value("${trading.platform-auth.file-download-path:/file/download}")
    private String spFileDownloadPath;

    @Override
    public String uploadFile(MultipartFile file) {
        validateUploadFile(file);
        String objectKey = buildObjectKey(file.getOriginalFilename());
        try {
            ossClient.upload(objectKey, file.getInputStream(), file.getContentType(), file.getSize());
            return objectKey;
        } catch (Exception e) {
            logger.error("文件上传失败, objectKey={}", objectKey, e);
            throw new RuntimeException("文件上传失败，请稍后重试", e);
        }
    }

    @Override
    public void downloadFile(String objectKey, HttpServletResponse response) {
        String normalizedObjectKey = normalizeObjectKey(objectKey);
        try {
            OssDownloadResource resource = ossClient.download(normalizedObjectKey);
            if (resource.getContentType() != null && !resource.getContentType().trim().isEmpty()) {
                response.setContentType(resource.getContentType());
            }
            if (resource.getContentLength() > 0) {
                response.setContentLengthLong(resource.getContentLength());
            }
            response.setHeader(HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename*=UTF-8''"
                            + UriUtils.encode(resolveFileName(normalizedObjectKey), StandardCharsets.UTF_8));
            try (InputStream inputStream = resource.getInputStream()) {
                StreamUtils.copy(inputStream, response.getOutputStream());
            }
            response.flushBuffer();
        } catch (Exception e) {
            logger.error("文件下载失败, objectKey={}", normalizedObjectKey, e);
            throw new RuntimeException("文件下载失败: " + e.getMessage(), e);
        }
    }

    @Override
    public void downloadSpFile(String fileUrl, HttpServletResponse response) {
        String normalizedFileUrl = normalizeSpFileUrl(fileUrl);
        try {
            ResponseEntity<byte[]> fileResponse = resolveRestTemplate().exchange(
                    UriComponentsBuilder.fromHttpUrl(resolveSpFileDownloadUrl())
                            .queryParam("fileUrl", normalizedFileUrl)
                            .build()
                            .encode()
                            .toUri(),
                    HttpMethod.GET,
                    new HttpEntity<>(buildSpHeaders()),
                    byte[].class
            );
            byte[] body = fileResponse.getBody();
            if (body == null) {
                throw new IllegalStateException("文件内容为空");
            }
            copyDownloadHeaders(fileResponse, response);
            StreamUtils.copy(body, response.getOutputStream());
            response.flushBuffer();
        } catch (IOException e) {
            throw new RuntimeException("SP文件下载失败: " + e.getMessage(), e);
        } catch (Exception e) {
            logger.error("SP文件下载失败, fileUrl={}", normalizedFileUrl, e);
            throw new RuntimeException("SP文件下载失败: " + e.getMessage(), e);
        }
    }

    @Override
    public void removeFile(String fileUrl) {
        String objectKey = normalizeObjectKey(fileUrl);
        try {
            ossClient.delete(objectKey);
        } catch (Exception e) {
            logger.error("删除文件失败, objectKey={}", objectKey, e);
            throw new RuntimeException("删除文件失败: " + e.getMessage(), e);
        }
    }

    private void validateUploadFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("上传文件不能为空");
        }
        if (file.getSize() > MAX_UPLOAD_SIZE) {
            throw new IllegalArgumentException("文件大小超出100M最大限制！");
        }
        String validationError = UploadFileTypeValidator.validate(file);
        if (validationError != null) {
            throw new IllegalArgumentException(validationError);
        }
    }

    private String buildObjectKey(String originalFilename) {
        String fileName = normalizeFileName(originalFilename);
        return PROJECT_PREFIX + "/" + resolveUserId() + "/" + UuidUtil.get32UUID() + "/" + fileName;
    }

    private String resolveUserId() {
        try {
            Subject subject = SecurityUtils.getSubject();
            if (subject != null && subject.isAuthenticated() && subject.getSession(false) != null) {
                Object userId = subject.getSession(false).getAttribute("userId");
                if (userId != null && !String.valueOf(userId).trim().isEmpty()) {
                    return String.valueOf(userId).trim();
                }
            }
        } catch (Exception ignored) {
        }
        return DEFAULT_USER;
    }

    private String normalizeObjectKey(String objectKey) {
        if (objectKey == null || objectKey.trim().isEmpty()) {
            throw new IllegalArgumentException("文件地址不能为空");
        }
        String normalized = objectKey.trim();
        if (normalized.contains("%")) {
            try {
                normalized = UriUtils.decode(normalized, StandardCharsets.UTF_8);
            } catch (Exception e) {
                logger.warn("文件地址解码失败，使用原值继续处理, objectKey={}", objectKey, e);
            }
        }
        rejectRemoteFileUrl(normalized);
        while (normalized.startsWith("/")) {
            normalized = normalized.substring(1);
        }
        if (normalized.isEmpty()) {
            throw new IllegalArgumentException("文件地址不能为空");
        }
        return normalized;
    }

    private String normalizeSpFileUrl(String fileUrl) {
        if (fileUrl == null || fileUrl.trim().isEmpty()) {
            throw new IllegalArgumentException("文件地址不能为空");
        }
        return fileUrl.trim();
    }

    private void rejectRemoteFileUrl(String objectKey) {
        if (StringUtils.isBlank(objectKey)) {
            return;
        }
        String normalized = objectKey.trim().toLowerCase(java.util.Locale.ROOT);
        if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
            throw new IllegalArgumentException("非法文件地址");
        }
    }

    private HttpHeaders buildSpHeaders() {
        HttpHeaders headers = new HttpHeaders();
        String sessionCookie = resolvePlatformSessionCookie();
        if (StringUtils.isNotBlank(sessionCookie)) {
            headers.add(HttpHeaders.COOKIE, sessionCookie);
        }
        return headers;
    }

    private RestTemplate resolveRestTemplate() {
        String normalizedBaseUrl = StringUtils.lowerCase(StringUtils.trimToEmpty(spBaseUrl));
        if (normalizedBaseUrl.startsWith("http://127.0.0.1")
                || normalizedBaseUrl.startsWith("https://127.0.0.1")
                || normalizedBaseUrl.startsWith("http://localhost")
                || normalizedBaseUrl.startsWith("https://localhost")) {
            return plainRestTemplate;
        }
        return loadBalancedRestTemplate;
    }

    private String resolveSpFileDownloadUrl() {
        return StringUtils.removeEnd(StringUtils.trimToEmpty(spBaseUrl), "/")
                + StringUtils.prependIfMissing(StringUtils.trimToEmpty(spFileDownloadPath), "/");
    }

    private String resolvePlatformSessionCookie() {
        Subject subject = SecurityUtils.getSubject();
        if (subject == null) {
            return null;
        }
        Session session = subject.getSession(false);
        if (session == null) {
            return null;
        }
        Object sessionCookie = session.getAttribute("platformSessionCookie");
        return sessionCookie == null ? null : String.valueOf(sessionCookie);
    }

    private void copyDownloadHeaders(ResponseEntity<byte[]> source, HttpServletResponse target) {
        HttpHeaders headers = source.getHeaders();
        if (headers.getContentType() != null) {
            target.setContentType(headers.getContentType().toString());
        }
        if (headers.getContentLength() > 0) {
            target.setContentLengthLong(headers.getContentLength());
        }
        String contentDisposition = headers.getFirst(HttpHeaders.CONTENT_DISPOSITION);
        if (StringUtils.isNotBlank(contentDisposition)) {
            target.setHeader(HttpHeaders.CONTENT_DISPOSITION, contentDisposition);
        }
    }

    private String normalizeFileName(String originalFilename) {
        String fileName = originalFilename == null ? "file" : originalFilename.trim();
        int slashIndex = Math.max(fileName.lastIndexOf('/'), fileName.lastIndexOf('\\'));
        if (slashIndex >= 0) {
            fileName = fileName.substring(slashIndex + 1);
        }
        return fileName.isEmpty() ? "file" : fileName;
    }

    private String resolveFileName(String objectKey) {
        String normalized = objectKey == null ? "" : objectKey.replace('\\', '/');
        int slashIndex = normalized.lastIndexOf('/');
        return slashIndex >= 0 ? normalized.substring(slashIndex + 1) : normalized;
    }
}
