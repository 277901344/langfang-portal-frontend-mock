package com.zhzj.trading.common;

/**
 * Trading API response codes.
 *
 * @author Connector Team
 * @since 2026-05-20
 */
public enum ResponseCode implements ResultCode {

    SUCCESS(10000, "请求成功"),

    PARAM_ERROR(11000, "参数错误"),
    PARAM_FORMAT_ERROR(11003, "参数格式错误"),
    REQUIRED_PARAM_EMPTY(11005, "必填参数为空"),

    SYSTEM_ERROR(12000, "系统错误"),
    SERVICE_BUSY(12010, "服务繁忙，请稍后重试"),
    LOGIN_COOKIE_EXPIRED(-99999, "登录过期，请重新登录"),

    BIZ_ERROR(13000, "业务错误"),
    ACCESS_DENIED(13003, "无权限访问"),
    UNKNOWN_ERROR(13000, "未知错误");

    private final Integer code;

    private final String message;

    ResponseCode(Integer code, String message) {
        this.code = code;
        this.message = message;
    }

    @Override
    public Integer getCode() {
        return code;
    }

    @Override
    public String getMessage() {
        return message;
    }
}
