package com.zhzj.trading.config;

import com.zhzj.trading.util.Sm4PasswordUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.context.EnvironmentAware;
import org.springframework.core.Ordered;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.util.ReflectionUtils;
import org.springframework.util.StringUtils;

import java.lang.reflect.Method;

/**
 * Fallback decryption before DataSource bean initialization.
 */
@Slf4j
@Component
public class DatasourcePasswordDecryptBeanPostProcessor implements BeanPostProcessor, Ordered, EnvironmentAware {

    private Environment environment;

    @Override
    public void setEnvironment(Environment environment) {
        this.environment = environment;
    }

    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        Method getPassword = ReflectionUtils.findMethod(bean.getClass(), "getPassword");
        Method setPassword = ReflectionUtils.findMethod(bean.getClass(), "setPassword", String.class);
        if (getPassword == null || setPassword == null) {
            return bean;
        }

        try {
            Object current = ReflectionUtils.invokeMethod(getPassword, bean);
            if (!(current instanceof String)) {
                return bean;
            }
            String password = (String) current;
            if (!Sm4PasswordUtil.isEncrypted(password)) {
                return bean;
            }
            String plainPassword = Sm4PasswordUtil.decrypt(password, resolveKey());
            ReflectionUtils.invokeMethod(setPassword, bean, plainPassword);
            log.info("Datasource password decrypted before bean init, beanName={}", beanName);
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to decrypt datasource password for bean '" + beanName + "'", ex);
        }
        return bean;
    }

    private String resolveKey() {
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
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
