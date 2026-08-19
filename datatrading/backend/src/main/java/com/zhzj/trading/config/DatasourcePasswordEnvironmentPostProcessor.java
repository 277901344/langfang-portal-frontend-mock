package com.zhzj.trading.config;

import com.zhzj.trading.util.Sm4PasswordUtil;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Decrypt sensitive passwords before framework components bind them.
 */
public class DatasourcePasswordEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    private static final String PROPERTY_SOURCE_NAME = "decryptedDatasourcePassword";
    private static final String[] PASSWORD_KEYS = {
            "spring.datasource.password",
            "spring.datasource.druid.password"
    };

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Map<String, Object> decrypted = new LinkedHashMap<>();
        for (String key : PASSWORD_KEYS) {
            String value = environment.getProperty(key);
            if (Sm4PasswordUtil.isEncrypted(value)) {
                decrypted.put(key, Sm4PasswordUtil.decrypt(value, resolveKey(environment)));
            }
        }
        if (!decrypted.isEmpty()) {
            environment.getPropertySources().addFirst(new MapPropertySource(PROPERTY_SOURCE_NAME, decrypted));
        }
    }

    private String resolveKey(ConfigurableEnvironment environment) {
        String key = environment.getProperty(Sm4PasswordUtil.KEY_PROPERTY);
        if (!StringUtils.hasText(key)) {
            key = environment.getProperty("db.password.sm4-key");
        }
        if (!StringUtils.hasText(key)) {
            key = System.getenv(Sm4PasswordUtil.KEY_ENV);
        }
        if (!StringUtils.hasText(key)) {
            key = System.getProperty(Sm4PasswordUtil.KEY_ENV);
        }
        if (!StringUtils.hasText(key)) {
            key = Sm4PasswordUtil.DEFAULT_KEY;
        }
        return Sm4PasswordUtil.requireKey(key);
    }

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }
}
