package com.zhzj.trading.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 * 验证码缓存表
 *
 * @author Connector Team
 * @since 2026-05-21
 */
@Data
@TableName(value = "captcha_cache")
public class CaptchaCache implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "captcha_id", type = IdType.INPUT)
    private String captchaId;

    private String captchaCode;

    private Date createTime;
}
