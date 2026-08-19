package com.zhzj.trading.model.resource;

import lombok.Data;

import jakarta.validation.constraints.NotEmpty;

/**
 * Trading 登录请求
 *
 * @author Connector Team
 * @since 2026-05-21
 */
@Data
public class LoginRequest {

    @NotEmpty(message = "用户名不能为空")
    private String username;

    @NotEmpty(message = "密码不能为空")
    private String password;

    @NotEmpty(message = "验证码不能为空")
    private String captcha;

    @NotEmpty(message = "验证码ID不能为空")
    private String captchaId;
}
