package com.zhzj.trading.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.concurrent.TimeUnit;

/**
 * JWT 工具类。
 *
 * @author Connector Team
 * @since 2026-05-21
 */
public final class JWTUtil {

    private JWTUtil() {
    }

    public static String createJWT(String id, String subject, long second) {
        SignatureAlgorithm signatureAlgorithm = SignatureAlgorithm.HS256;
        long nowMillis = System.currentTimeMillis();
        Date now = new Date(nowMillis);
        SecretKey key = generalKey();
        JwtBuilder builder = Jwts.builder()
                .setId(id)
                .setIssuedAt(now)
                .setSubject(subject)
                .signWith(signatureAlgorithm, key);
        if (second >= 0) {
            long expMillis = nowMillis + TimeUnit.MILLISECONDS.convert(second, TimeUnit.SECONDS);
            builder.setExpiration(new Date(expMillis));
        }
        return builder.compact();
    }

    public static Claims parseJWT(String jwt) throws Exception {
        SecretKey key = generalKey();
        return Jwts.parser().setSigningKey(key).build().parseClaimsJws(jwt).getBody();
    }

    public static void createResponseJWT(String id, String subject, long second) {
        String jwt = createJWT(id, subject, second);
        ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getResponse()
                .setHeader("Authorization", jwt);
    }

    public static Claims parseRequestJWT() {
        Claims claims = null;
        String authorization = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest()
                .getHeader("Authorization");
        try {
            claims = parseJWT(authorization);
            return claims;
        } catch (Exception e) {
            return null;
        }
    }

    public static String getRequestHeader(String headerName) {
        return ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest()
                .getHeader(headerName);
    }

    private static SecretKey generalKey() {
        String stringKey = "xBve2H2zjO86YKRgw0G9WEvfp0aOgcm7";
        return Keys.hmacShaKeyFor(stringKey.getBytes(StandardCharsets.UTF_8));
    }
}
