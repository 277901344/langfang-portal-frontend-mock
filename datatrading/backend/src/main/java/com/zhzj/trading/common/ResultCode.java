package com.zhzj.trading.common;

/**
 * 响应码接口契约
 * <p>
 * 定义所有响应码必须实现的方法，支持扩展自定义响应码
 *
 * @author Connector Team
 * @since 2026-05-20
 */
public interface ResultCode {

    /**
     * 获取响应码
     *
     * @return 响应码
     */
    Integer getCode();

    /**
     * 获取响应消息
     *
     * @return 响应消息
     */
    String getMessage();
}
