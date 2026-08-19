package com.zhzj.trading.model.resource;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 验证码响应
 *
 * @author Connector Team
 * @since 2026-05-21
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CaptchaResponse {

    private String captchaId;

    private String imageBase64;
}
