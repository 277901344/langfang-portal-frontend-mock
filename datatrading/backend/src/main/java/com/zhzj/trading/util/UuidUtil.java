package com.zhzj.trading.util;

import cn.hutool.core.date.DateUtil;

import java.util.Date;
import java.util.UUID;

/**
 * UUID 工具
 *
 * @author Connector Team
 * @since 2026-05-21
 */
public class UuidUtil {

    public static String get32UUID() {
        return UUID.randomUUID().toString().trim().replaceAll("-", "");
    }

    public static String get30Id() {
        String formatDate = DateUtil.format(new Date(), "yyyyMMddHHmmssSSS");
        return formatDate + get13UUID();
    }

    private static String get13UUID() {
        return get32UUID().substring(19);
    }
}
