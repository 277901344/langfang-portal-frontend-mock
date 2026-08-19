package com.zhzj.trading.service.client;

import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.zhzj.trading.model.resource.CaptchaResponse;
import com.zhzj.trading.model.resource.LoginRequest;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * SP 认证客户端。
 *
 * @author Connector Team
 * @since 2026-05-21
 */
@Component
public class PlatformAuthClient {

    @Autowired
    @Qualifier("plainRestTemplate")
    private RestTemplate plainRestTemplate;

    @Autowired
    @Qualifier("loadBalancedRestTemplate")
    private RestTemplate loadBalancedRestTemplate;

    @Value("${trading.platform-auth.base-url:http://sp-service}")
    private String platformAuthBaseUrl;

    @Value("${trading.platform-auth.login-path:/auth/login}")
    private String platformLoginPath;

    @Value("${trading.platform-auth.captcha-path:/auth/captcha}")
    private String platformCaptchaPath;

    public CaptchaResponse getCaptcha() {
        HttpHeaders headers = new HttpHeaders();
        HttpServletRequest currentRequest = getCurrentRequest();
        copyForwardHeaders(currentRequest, headers);

        ResponseEntity<String> response = resolveRestTemplate().exchange(
                resolveCaptchaUrl(),
                HttpMethod.GET,
                new HttpEntity<>(headers),
                String.class
        );

        JSONObject body = JSONUtil.parseObj(response.getBody());
        JSONObject data = body.getJSONObject("data");
        if (data == null) {
            throw new IllegalStateException(StringUtils.defaultIfBlank(body.getStr("message"), "认证平台验证码响应异常"));
        }

        return JSONUtil.toBean(data, CaptchaResponse.class);
    }

    public PlatformLoginResponse authenticate(LoginRequest request) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("username", request.getUsername());
        payload.put("password", request.getPassword());
        payload.put("captcha", request.getCaptcha());
        payload.put("captchaId", request.getCaptchaId());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpServletRequest currentRequest = getCurrentRequest();
        copyForwardHeaders(currentRequest, headers);

        ResponseEntity<String> response = resolveRestTemplate().exchange(
                resolveLoginUrl(),
                HttpMethod.POST,
                new HttpEntity<>(payload, headers),
                String.class
        );
        PlatformLoginResponse loginResponse = new PlatformLoginResponse();
        loginResponse.setBody(JSONUtil.parseObj(response.getBody()));
        loginResponse.setSessionCookie(extractSessionCookie(response.getHeaders().get(HttpHeaders.SET_COOKIE)));
        return loginResponse;
    }

    private RestTemplate resolveRestTemplate() {
        String normalizedBaseUrl = StringUtils.lowerCase(StringUtils.trimToEmpty(platformAuthBaseUrl));
        if (normalizedBaseUrl.startsWith("http://127.0.0.1")
                || normalizedBaseUrl.startsWith("https://127.0.0.1")
                || normalizedBaseUrl.startsWith("http://localhost")
                || normalizedBaseUrl.startsWith("https://localhost")) {
            return plainRestTemplate;
        }
        return loadBalancedRestTemplate;
    }

    private String resolveLoginUrl() {
        String baseUrl = StringUtils.removeEnd(StringUtils.trimToEmpty(platformAuthBaseUrl), "/");
        String path = StringUtils.prependIfMissing(StringUtils.trimToEmpty(platformLoginPath), "/");
        return baseUrl + path;
    }

    private String resolveCaptchaUrl() {
        String baseUrl = StringUtils.removeEnd(StringUtils.trimToEmpty(platformAuthBaseUrl), "/");
        String path = StringUtils.prependIfMissing(StringUtils.trimToEmpty(platformCaptchaPath), "/");
        return baseUrl + path;
    }

    private void copyForwardHeaders(HttpServletRequest request, HttpHeaders headers) {
        if (request == null) {
            return;
        }

        String forwardedFor = StringUtils.trimToNull(request.getHeader("X-Forwarded-For"));
        if (forwardedFor != null) {
            headers.add("X-Forwarded-For", forwardedFor);
        }

        String realIp = StringUtils.trimToNull(request.getHeader("X-Real-IP"));
        if (realIp != null) {
            headers.add("X-Real-IP", realIp);
        }
    }

    private HttpServletRequest getCurrentRequest() {
        ServletRequestAttributes requestAttributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (requestAttributes == null) {
            return null;
        }
        return requestAttributes.getRequest();
    }

    private String extractSessionCookie(List<String> setCookieHeaders) {
        if (setCookieHeaders == null || setCookieHeaders.isEmpty()) {
            return null;
        }
        for (String header : setCookieHeaders) {
            if (StringUtils.isBlank(header)) {
                continue;
            }
            String[] segments = header.split(";", 2);
            String cookiePair = StringUtils.trimToNull(segments[0]);
            if (cookiePair != null && StringUtils.startsWith(cookiePair, "SP_SID=")) {
                return cookiePair;
            }
        }
        for (String header : setCookieHeaders) {
            if (StringUtils.isBlank(header)) {
                continue;
            }
            String[] segments = header.split(";", 2);
            String cookiePair = StringUtils.trimToNull(segments[0]);
            if (cookiePair != null) {
                return cookiePair;
            }
        }
        return null;
    }

    public static class PlatformLoginResponse {

        private JSONObject body;

        private String sessionCookie;

        public JSONObject getBody() {
            return body;
        }

        public void setBody(JSONObject body) {
            this.body = body;
        }

        public String getSessionCookie() {
            return sessionCookie;
        }

        public void setSessionCookie(String sessionCookie) {
            this.sessionCookie = sessionCookie;
        }
    }
}
