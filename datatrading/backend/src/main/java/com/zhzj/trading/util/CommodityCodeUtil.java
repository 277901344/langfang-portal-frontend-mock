package com.zhzj.trading.util;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * 商品编号生成工具。
 */
public final class CommodityCodeUtil {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    private static final char[] CODE_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".toCharArray();
    private static final int RANDOM_LENGTH = 14;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private CommodityCodeUtil() {
    }

    public static String nextCode() {
        return "DS-" + LocalDateTime.now().format(TIME_FORMATTER) + "-" + randomSuffix();
    }

    private static String randomSuffix() {
        StringBuilder builder = new StringBuilder(RANDOM_LENGTH);
        for (int i = 0; i < RANDOM_LENGTH; i++) {
            builder.append(CODE_CHARS[SECURE_RANDOM.nextInt(CODE_CHARS.length)]);
        }
        return builder.toString();
    }
}
