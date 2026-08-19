package com.zhzj.trading.controller;

import com.zhzj.trading.common.Result;
import com.zhzj.trading.model.User;
import com.zhzj.trading.model.resource.CaptchaResponse;
import com.zhzj.trading.model.resource.LoginRequest;
import com.zhzj.trading.service.UserService;
import com.zhzj.trading.service.client.PlatformAuthClient;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.subject.Subject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

/**
 * Trading 登录控制器
 *
 * @author Connector Team
 * @since 2026-05-21
 */
@RestController
@RequestMapping("/auth")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private PlatformAuthClient platformAuthClient;

    @GetMapping("/captcha")
    public Result<CaptchaResponse> getCaptcha() {
        CaptchaResponse captcha = platformAuthClient.getCaptcha();
        return Result.ok(captcha);
    }

    @PostMapping("/login")
    public Result<User> login(@Valid @RequestBody LoginRequest request) {
        User user = userService.login(request);
        return Result.ok("登录成功", user);
    }

    @PostMapping("/logout")
    public Result<String> logout() {
        try {
            Subject subject = SecurityUtils.getSubject();
            subject.logout();
            return Result.ok("退出成功", "");
        } catch (Exception e) {
            return Result.fail("退出成功");
        }
    }
}
