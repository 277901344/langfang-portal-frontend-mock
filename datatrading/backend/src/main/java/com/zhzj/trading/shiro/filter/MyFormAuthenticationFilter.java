package com.zhzj.trading.shiro.filter;

import cn.hutool.json.JSONUtil;
import com.zhzj.trading.common.ResponseCode;
import com.zhzj.trading.common.Result;
import com.zhzj.trading.util.JWTUtil;
import io.jsonwebtoken.Claims;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.web.filter.authc.FormAuthenticationFilter;

import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Trading 登录态过滤器。
 *
 * @author Connector Team
 * @since 2026-05-21
 */
@Slf4j
public class MyFormAuthenticationFilter extends FormAuthenticationFilter {

    @SneakyThrows
    @Override
    protected boolean isAccessAllowed(ServletRequest request, ServletResponse response, Object mappedValue) {
        if (request instanceof HttpServletRequest) {
            if (((HttpServletRequest) request).getMethod().toUpperCase().equals("OPTIONS")) {
                return true;
            }
        }
        boolean verified = userVerify();
        if (!verified) {
            return false;
        }
        return super.isAccessAllowed(request, response, mappedValue);
    }

    @Override
    protected boolean onAccessDenied(ServletRequest request, ServletResponse response) throws IOException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpServletResponse = (HttpServletResponse) response;
        log.warn("Trading 鉴权拒绝(authc): uri={}, method={}, remoteAddr={}, origin={}, userAgent={}",
                httpRequest.getRequestURI(),
                httpRequest.getMethod(),
                httpRequest.getRemoteAddr(),
                httpRequest.getHeader("Origin"),
                httpRequest.getHeader("User-Agent"));
        httpServletResponse.setHeader("Access-Control-Allow-Origin", httpRequest.getHeader("Origin"));
        httpServletResponse.setHeader("Access-Control-Allow-Credentials", "true");
        httpServletResponse.setCharacterEncoding("UTF-8");
        httpServletResponse.setContentType("application/json");
        response.setContentType("application/Json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().print(JSONUtil.toJsonStr(Result.fail(ResponseCode.LOGIN_COOKIE_EXPIRED)));
        return false;
    }

    private boolean userVerify() {
        String authorizationUserId = null;
        String sessionUserId = null;

        String authorization = JWTUtil.getRequestHeader("Authorization");
        if (StringUtils.isNotEmpty(authorization)) {
            Claims claims = JWTUtil.parseRequestJWT();
            if (claims != null) {
                authorizationUserId = claims.getId();
            } else {
                return false;
            }
        }
        try {
            if (SecurityUtils.getSubject() != null) {
                Object userId = SecurityUtils.getSubject().getSession().getAttribute("userId");
                if (userId != null && StringUtils.isNotEmpty(userId.toString())) {
                    sessionUserId = userId.toString();
                }
            }
        } catch (Exception e) {
            log.warn("Trading 鉴权上下文校验异常", e);
            return false;
        }

        return !(StringUtils.isNotEmpty(authorizationUserId)
                && StringUtils.isNotEmpty(sessionUserId)
                && !authorizationUserId.equals(sessionUserId));
    }
}
