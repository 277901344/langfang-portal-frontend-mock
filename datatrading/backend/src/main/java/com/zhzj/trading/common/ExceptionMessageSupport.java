package com.zhzj.trading.common;

import java.io.IOException;
import java.sql.SQLException;
import java.util.ConcurrentModificationException;
import java.util.NoSuchElementException;
import java.util.concurrent.TimeoutException;

public final class ExceptionMessageSupport {

    private ExceptionMessageSupport() {
    }

    public static String resolve(Throwable throwable, String fallbackMessage) {
        if (shouldUseFallback(throwable)) {
            return fallbackMessage;
        }
        String message = throwable == null ? null : throwable.getMessage();
        return hasText(message) ? message : fallbackMessage;
    }

    public static boolean shouldUseFallback(Throwable throwable) {
        Throwable current = throwable;
        int depth = 0;
        while (current != null && depth++ < 16) {
            if (isSystemException(current)) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }

    private static boolean isSystemException(Throwable throwable) {
        return throwable instanceof SQLException
                || throwable instanceof IOException
                || throwable instanceof ReflectiveOperationException
                || throwable instanceof TimeoutException
                || throwable instanceof NullPointerException
                || throwable instanceof ClassCastException
                || throwable instanceof IndexOutOfBoundsException
                || throwable instanceof ConcurrentModificationException
                || throwable instanceof NoSuchElementException
                || throwable instanceof ArithmeticException
                || isFrameworkSystemException(throwable);
    }

    private static boolean isFrameworkSystemException(Throwable throwable) {
        Class<?> type = throwable.getClass();
        while (type != null) {
            String className = type.getName();
            if (className.startsWith("org.springframework.dao.")
                    || className.startsWith("org.springframework.jdbc.")
                    || className.startsWith("org.mybatis.")
                    || className.startsWith("java.sql.")
                    || className.startsWith("javax.sql.")) {
                return true;
            }
            type = type.getSuperclass();
        }
        return false;
    }

    private static boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
