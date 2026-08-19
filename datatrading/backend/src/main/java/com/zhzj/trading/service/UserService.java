package com.zhzj.trading.service;

import com.zhzj.trading.model.User;
import com.zhzj.trading.model.resource.LoginRequest;
import org.apache.commons.lang3.StringUtils;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.UsernamePasswordToken;
import org.apache.shiro.subject.Subject;
import org.springframework.stereotype.Service;

/**
 * Trading 用户服务
 *
 * @author Connector Team
 * @since 2026-05-21
 */
@Service
public class UserService {

    public User login(LoginRequest request) {
        UsernamePasswordToken usernamePasswordToken =
                new UsernamePasswordToken(request.getUsername(), request.getPassword(), false);
        Subject subject = SecurityUtils.getSubject();
        if (subject.getPrincipal() != null) {
            subject.logout();
        }
        subject.getSession().setAttribute("loginCaptcha", request.getCaptcha());
        subject.getSession().setAttribute("loginCaptchaId", request.getCaptchaId());
        try {
            subject.login(usernamePasswordToken);
        } catch (AuthenticationException e) {
            throw new IllegalArgumentException(StringUtils.defaultIfBlank(e.getMessage(), "登录失败，请稍后重试"));
        } finally {
            subject.getSession().removeAttribute("loginCaptcha");
            subject.getSession().removeAttribute("loginCaptchaId");
        }
        return (User) subject.getPrincipal();
    }
}
