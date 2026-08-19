package com.zhzj.trading.config;

import com.zhzj.trading.util.Sm4PasswordUtil;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.context.config.ConfigDataEnvironmentPostProcessor;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.boot.env.YamlPropertySourceLoader;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MutablePropertySources;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.PropertySource;
import org.springframework.core.env.StandardEnvironment;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Decrypt Nacos credentials early enough for config import bootstrap.
 */
public class NacosPasswordEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    private static final String PROPERTY_SOURCE_NAME = "decryptedNacosBootstrapPassword";
    private static final String[] PASSWORD_KEYS = {
            "NACOS_PASSWORD",
            "NACOS_CONFIG_PASSWORD",
            "spring.cloud.nacos.discovery.password",
            "spring.cloud.nacos.config.password"
    };

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        ConfigurableEnvironment configFileAwareEnvironment = buildConfigFileAwareEnvironment(environment);
        Map<String, Object> decrypted = new LinkedHashMap<>();
        for (String key : PASSWORD_KEYS) {
            String value = configFileAwareEnvironment.getProperty(key);
            if (Sm4PasswordUtil.isEncrypted(value)) {
                decrypted.put(key, Sm4PasswordUtil.decrypt(value, resolveKey(configFileAwareEnvironment)));
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
        return ConfigDataEnvironmentPostProcessor.ORDER - 1;
    }

    private ConfigurableEnvironment buildConfigFileAwareEnvironment(ConfigurableEnvironment environment) {
        StandardEnvironment copy = new StandardEnvironment();
        MutablePropertySources target = copy.getPropertySources();
        List<String> existingNames = new ArrayList<>();
        for (PropertySource<?> propertySource : target) {
            existingNames.add(propertySource.getName());
        }
        for (String name : existingNames) {
            target.remove(name);
        }
        for (PropertySource<?> propertySource : environment.getPropertySources()) {
            target.addLast(propertySource);
        }
        loadYamlIfPresent(target, "application.yml");
        loadYamlIfPresent(target, "application.yaml");
        String activeProfiles = copy.getProperty("spring.profiles.active");
        if (StringUtils.hasText(activeProfiles)) {
            Arrays.stream(activeProfiles.split(","))
                    .map(String::trim)
                    .filter(StringUtils::hasText)
                    .forEach(profile -> {
                        loadYamlIfPresent(target, "application-" + profile + ".yml");
                        loadYamlIfPresent(target, "application-" + profile + ".yaml");
                    });
        }
        return copy;
    }

    private void loadYamlIfPresent(MutablePropertySources propertySources, String resourcePath) {
        Resource resource = new ClassPathResource(resourcePath);
        if (!resource.exists()) {
            return;
        }
        try {
            YamlPropertySourceLoader loader = new YamlPropertySourceLoader();
            List<PropertySource<?>> loaded = loader.load("bootstrap-" + resourcePath, resource);
            for (PropertySource<?> propertySource : loaded) {
                propertySources.addLast(propertySource);
            }
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to load " + resourcePath + " for early Nacos password decryption", ex);
        }
    }
}
