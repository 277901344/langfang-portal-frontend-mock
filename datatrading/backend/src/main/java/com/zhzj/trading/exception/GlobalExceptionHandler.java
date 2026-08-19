package com.zhzj.trading.exception;

import com.zhzj.trading.common.ResponseCode;
import com.zhzj.trading.common.Result;
import org.apache.shiro.authz.AuthorizationException;
import org.apache.shiro.authz.UnauthenticatedException;
import org.apache.shiro.authz.UnauthorizedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Trading global exception handler.
 *
 * @author Connector Team
 * @since 2026-05-20
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<?> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        FieldError fieldError = e.getBindingResult().getFieldError();
        String message = fieldError != null ? fieldError.getDefaultMessage() : "参数校验失败";
        log.warn("参数校验失败: {}", message, e);
        return Result.fail(ResponseCode.REQUIRED_PARAM_EMPTY, message);
    }

    @ExceptionHandler(BindException.class)
    public Result<?> handleBindException(BindException e) {
        FieldError fieldError = e.getFieldError();
        String message = fieldError != null ? fieldError.getDefaultMessage() : "参数校验失败";
        log.warn("参数校验失败: {}", message, e);
        return Result.fail(ResponseCode.REQUIRED_PARAM_EMPTY, message);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public Result<?> handleIllegalArgumentException(IllegalArgumentException e) {
        log.warn("非法参数: {}", e.getMessage(), e);
        return Result.fail(ResponseCode.PARAM_FORMAT_ERROR, e, ResponseCode.PARAM_FORMAT_ERROR.getMessage());
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public Result<?> handleHttpMessageNotReadableException(HttpMessageNotReadableException e) {
        log.warn("请求体格式错误: {}", e.getMessage(), e);
        return Result.fail(ResponseCode.PARAM_FORMAT_ERROR, "请求体格式错误");
    }

    @ExceptionHandler(UnauthenticatedException.class)
    public Result<?> handleUnauthenticatedException(UnauthenticatedException e) {
        log.warn("未登录或登录已失效: {}", e.getMessage(), e);
        return Result.fail(ResponseCode.LOGIN_COOKIE_EXPIRED, e, ResponseCode.LOGIN_COOKIE_EXPIRED.getMessage());
    }

    @ExceptionHandler({UnauthorizedException.class, AuthorizationException.class})
    public Result<?> handleUnauthorizedException(Exception e) {
        log.warn("权限校验失败: {}", e.getMessage(), e);
        return Result.fail(ResponseCode.ACCESS_DENIED, e, ResponseCode.ACCESS_DENIED.getMessage());
    }

    @ExceptionHandler(RuntimeException.class)
    public Result<?> handleRuntimeException(RuntimeException e) {
        log.error("系统异常: {}", e.getMessage(), e);
        return Result.fail(ResponseCode.UNKNOWN_ERROR, e, ResponseCode.UNKNOWN_ERROR.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public Result<?> handleException(Exception e) {
        log.error("未知异常: {}", e.getMessage(), e);
        return Result.fail(ResponseCode.SERVICE_BUSY, e, "系统繁忙，请稍后重试");
    }
}
