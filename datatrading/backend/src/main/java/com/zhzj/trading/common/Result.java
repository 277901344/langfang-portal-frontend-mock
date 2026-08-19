package com.zhzj.trading.common;

import lombok.Data;

import java.io.Serializable;

/**
 * 统一响应结果封装类
 *
 * @param <T> 数据类型
 * @author Connector Team
 * @since 2026-05-20
 */
@Data
public class Result<T> implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 响应码：10000-成功，11xxx-参数错误，12xxx-系统错误，13xxx-业务错误
     */
    private Integer code;

    /**
     * 响应消息
     */
    private String message;

    /**
     * 响应数据
     */
    private T data;

    /**
     * 成功响应（无数据）
     */
    public static <T> Result<T> ok() {
        Result<T> result = new Result<>();
        result.setCode(ResponseCode.SUCCESS.getCode());
        result.setMessage(ResponseCode.SUCCESS.getMessage());
        return result;
    }

    /**
     * 成功响应（带数据）
     */
    public static <T> Result<T> ok(T data) {
        Result<T> result = new Result<>();
        result.setCode(ResponseCode.SUCCESS.getCode());
        result.setMessage("success");
        result.setData(data);
        return result;
    }

    /**
     * 成功响应（自定义消息和数据）
     */
    public static <T> Result<T> ok(String message, T data) {
        Result<T> result = new Result<>();
        result.setCode(ResponseCode.SUCCESS.getCode());
        result.setMessage(message);
        result.setData(data);
        return result;
    }

    /**
     * 失败响应
     */
    public static <T> Result<T> fail(String message) {
        Result<T> result = new Result<>();
        result.setCode(ResponseCode.UNKNOWN_ERROR.getCode());
        result.setMessage(message);
        return result;
    }

    public static <T> Result<T> fail(Throwable throwable, String fallbackMessage) {
        return fail(ExceptionMessageSupport.resolve(throwable, fallbackMessage));
    }

    /**
     * 失败响应（自定义错误码）
     */
    public static <T> Result<T> fail(Integer code, String message) {
        Result<T> result = new Result<>();
        result.setCode(code);
        result.setMessage(message);
        return result;
    }

    public static <T> Result<T> fail(Integer code, Throwable throwable, String fallbackMessage) {
        return fail(code, ExceptionMessageSupport.resolve(throwable, fallbackMessage));
    }

    /**
     * 失败响应（使用响应码枚举）
     *
     * @param responseCode 响应码枚举
     * @return 失败响应结果
     */
    public static <T> Result<T> fail(ResponseCode responseCode) {
        Result<T> result = new Result<>();
        result.setCode(responseCode.getCode());
        result.setMessage(responseCode.getMessage());
        return result;
    }

    /**
     * 失败响应（使用响应码枚举，并自定义消息）
     *
     * @param responseCode 响应码枚举
     * @param message      自定义消息
     * @return 失败响应结果
     */
    public static <T> Result<T> fail(ResponseCode responseCode, String message) {
        Result<T> result = new Result<>();
        result.setCode(responseCode.getCode());
        result.setMessage(message);
        return result;
    }

    public static <T> Result<T> fail(ResponseCode responseCode, Throwable throwable, String fallbackMessage) {
        return fail(responseCode, ExceptionMessageSupport.resolve(throwable, fallbackMessage));
    }

    public static <T> Result<T> fail(ResponseCode responseCode, Throwable throwable) {
        return fail(responseCode, throwable, responseCode.getMessage());
    }
}
