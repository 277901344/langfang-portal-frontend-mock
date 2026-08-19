package com.zhzj.trading.util;

import cn.hutool.core.util.HexUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.crypto.CryptoException;
import org.bouncycastle.crypto.BufferedBlockCipher;
import org.bouncycastle.crypto.InvalidCipherTextException;
import org.bouncycastle.crypto.engines.SM4Engine;
import org.bouncycastle.crypto.paddings.PKCS7Padding;
import org.bouncycastle.crypto.paddings.PaddedBufferedBlockCipher;
import org.bouncycastle.crypto.params.KeyParameter;

import java.nio.charset.StandardCharsets;

/**
 * spring.datasource.password 的 SM4 加解密工具。
 * 配置文件中的密文格式约定为：SM4:十六进制密文
 *
 * @author Connector Team
 * @since 2026-05-21
 */
public final class Sm4PasswordUtil {

    public static final String PREFIX = "SM4:";
    public static final String KEY_PROPERTY = "app.crypto.sm4-key";
    public static final String KEY_ENV = "DB_PASSWORD_SM4_KEY";
    public static final String DEFAULT_KEY = "1234567890abcdef";

    private Sm4PasswordUtil() {
    }

    public static String encrypt(String plainText, String key) {
        if (plainText == null) {
            return null;
        }
        return PREFIX + encryptRaw(plainText, key);
    }

    public static String encrypt(String plainText) {
        return encrypt(plainText, DEFAULT_KEY);
    }

    public static String encryptPassword(String plainPassword, String key) {
        return encrypt(plainPassword, key);
    }

    public static String encryptPassword(String plainPassword) {
        return encryptPassword(plainPassword, DEFAULT_KEY);
    }

    public static String encryptRaw(String plainText, String key) {
        return HexUtil.encodeHexStr(process(true, plainText.getBytes(StandardCharsets.UTF_8), key));
    }

    public static String decrypt(String cipherText, String key) {
        if (cipherText == null) {
            return null;
        }
        String raw = unwrap(cipherText);
        return new String(process(false, HexUtil.decodeHex(raw), key), StandardCharsets.UTF_8);
    }

    public static String decrypt(String cipherText) {
        return decrypt(cipherText, DEFAULT_KEY);
    }

    public static String decryptPassword(String cipherPassword, String key) {
        return decrypt(cipherPassword, key);
    }

    public static String decryptPassword(String cipherPassword) {
        return decryptPassword(cipherPassword, DEFAULT_KEY);
    }

    public static boolean isEncrypted(String value) {
        return StrUtil.isNotBlank(value) && StrUtil.startWithIgnoreCase(value, PREFIX);
    }

    public static String requireKey(String key) {
        if (StrUtil.isBlank(key)) {
            throw new IllegalArgumentException(
                    "SM4 key is required. Please set property '" + KEY_PROPERTY + "' or env '" + KEY_ENV + "'."
            );
        }
        String normalized = StrUtil.trim(key);
        if (normalized.length() != 16) {
            throw new IllegalArgumentException("SM4 key must be exactly 16 characters.");
        }
        return normalized;
    }

    private static String unwrap(String cipherText) {
        String trimmed = StrUtil.trim(cipherText);
        if (!isEncrypted(trimmed)) {
            return trimmed;
        }
        return trimmed.substring(PREFIX.length());
    }

    private static byte[] process(boolean encrypt, byte[] input, String key) {
        try {
            BufferedBlockCipher cipher = new PaddedBufferedBlockCipher(new SM4Engine(), new PKCS7Padding());
            cipher.init(encrypt, new KeyParameter(requireKey(key).getBytes(StandardCharsets.UTF_8)));
            byte[] output = new byte[cipher.getOutputSize(input.length)];
            int length = cipher.processBytes(input, 0, input.length, output, 0);
            length += cipher.doFinal(output, length);
            byte[] result = new byte[length];
            System.arraycopy(output, 0, result, 0, length);
            return result;
        } catch (InvalidCipherTextException ex) {
            throw new CryptoException(ex);
        }
    }
}
