package com.zhzj.trading.shiro;

import com.zhzj.trading.shiro.filter.MyFormAuthenticationFilter;
import com.zhzj.trading.shiro.filter.MyPermsFilter;
import com.zhzj.trading.shiro.realm.CustRelam;
import com.zhzj.trading.shiro.session.MySessionListener;
import com.zhzj.trading.shiro.session.SessionDao;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.mgt.SecurityManager;
import org.apache.shiro.session.InvalidSessionException;
import org.apache.shiro.session.Session;
import org.apache.shiro.session.SessionListener;
import org.apache.shiro.session.mgt.SessionKey;
import org.apache.shiro.session.mgt.SessionManager;
import org.apache.shiro.spring.LifecycleBeanPostProcessor;
import org.apache.shiro.spring.security.interceptor.AuthorizationAttributeSourceAdvisor;
import org.apache.shiro.spring.web.ShiroFilterFactoryBean;
import org.apache.shiro.web.mgt.DefaultWebSecurityManager;
import org.apache.shiro.web.servlet.SimpleCookie;
import org.apache.shiro.web.session.mgt.DefaultWebSessionManager;
import org.springframework.aop.framework.autoproxy.DefaultAdvisorAutoProxyCreator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import jakarta.servlet.Filter;

@Configuration
public class ShiroConfig {

    private static final String DEFAULT_SESSION_COOKIE_NAME = "TRADING_SID";
    private static final String DEFAULT_SESSION_COOKIE_PATH = "/";
    private static final long DEFAULT_SESSION_TIMEOUT_MS = 3600000L;

    @Value("${shiro.session.timeout:3600000}")
    private long sessionTimeout;

    @Value("${shiro.session.cookie-name:TRADING_SID}")
    private String sessionCookieName;

    @Value("${shiro.session.cookie-path:/}")
    private String sessionCookiePath;

    @Bean(name = "lifecycleBeanPostProcessor")
    public LifecycleBeanPostProcessor getLifecycleBeanPostProcessor() {
        return new LifecycleBeanPostProcessor();
    }

    @Bean
    public DefaultAdvisorAutoProxyCreator getDefaultAdvisorAutoProxyCreator() {
        DefaultAdvisorAutoProxyCreator autoProxyCreator = new DefaultAdvisorAutoProxyCreator();
        autoProxyCreator.setProxyTargetClass(true);
        return autoProxyCreator;
    }

    @Bean
    public AuthorizationAttributeSourceAdvisor getAuthorizationAttributeSourceAdvisor(SecurityManager securityManager) {
        AuthorizationAttributeSourceAdvisor advisor = new AuthorizationAttributeSourceAdvisor();
        advisor.setSecurityManager(securityManager);
        return advisor;
    }

    @Bean
    public ShiroFilterFactoryBean shirFilter(SecurityManager securityManager) {
        ShiroFilterFactoryBean shiroFilterFactoryBean = new ShiroFilterFactoryBean();
        shiroFilterFactoryBean.setSecurityManager(securityManager);

        Map<String, String> filterChainDefinitionMap = new LinkedHashMap<>();
        filterChainDefinitionMap.put("/auth/captcha", "anon");
        filterChainDefinitionMap.put("/auth/login", "anon");
        filterChainDefinitionMap.put("/auth/logout", "anon");
        filterChainDefinitionMap.put("/callback/**", "anon");
        filterChainDefinitionMap.put("/marketplace/categories", "anon");
        filterChainDefinitionMap.put("/marketplace/commodities", "anon");
        filterChainDefinitionMap.put("/marketplace/commodities/detail", "anon");
        filterChainDefinitionMap.put("/marketplace/commodities/*/cover", "anon");
        filterChainDefinitionMap.put("/demand-center/demands", "anon");
        filterChainDefinitionMap.put("/demand-center/demands/*", "anon");
        filterChainDefinitionMap.put("/authz/current/**", "authc");
        filterChainDefinitionMap.put("/**", "authc");

        Map<String, Filter> filters = shiroFilterFactoryBean.getFilters();
        filters.put("perm", new MyPermsFilter());
        filters.put("authc", new MyFormAuthenticationFilter());
        shiroFilterFactoryBean.setFilters(filters);
        shiroFilterFactoryBean.setFilterChainDefinitionMap(filterChainDefinitionMap);
        return shiroFilterFactoryBean;
    }

    @Bean
    public CustRelam myShiroRealm() {
        return new CustRelam();
    }

    @Bean
    public SimpleCookie sessionIdCookie() {
        String resolvedCookieName = hasText(sessionCookieName) ? sessionCookieName.trim() : DEFAULT_SESSION_COOKIE_NAME;
        String resolvedCookiePath = hasText(sessionCookiePath) ? sessionCookiePath.trim() : DEFAULT_SESSION_COOKIE_PATH;
        long resolvedSessionTimeout = sessionTimeout > 0 ? sessionTimeout : DEFAULT_SESSION_TIMEOUT_MS;
        int resolvedCookieMaxAgeSeconds = (int) Math.max(1L, TimeUnit.MILLISECONDS.toSeconds(resolvedSessionTimeout));
        SimpleCookie cookie = new SimpleCookie(resolvedCookieName);
        cookie.setHttpOnly(true);
        cookie.setPath(resolvedCookiePath);
        cookie.setMaxAge(resolvedCookieMaxAgeSeconds);
        return cookie;
    }

    @Bean
    public SessionManager sessionManager() {
        DefaultWebSessionManager sessionManager = new DefaultWebSessionManager() {
            @Override
            public void touch(SessionKey key) throws InvalidSessionException {
                Session session = doGetSession(key);
                if (session != null) {
                    long oldTime = session.getLastAccessTime().getTime();
                    session.touch();
                    long newTime = session.getLastAccessTime().getTime();
                    if (newTime - oldTime > 300000) {
                        onChange(session);
                    }
                }
            }
        };
        List<SessionListener> listeners = new ArrayList<>();
        listeners.add(new MySessionListener());
        sessionManager.setSessionListeners(listeners);
        sessionManager.setSessionDAO(dbSessionDAO());
        long resolvedSessionTimeout = sessionTimeout > 0 ? sessionTimeout : DEFAULT_SESSION_TIMEOUT_MS;
        sessionManager.setGlobalSessionTimeout(resolvedSessionTimeout);
        sessionManager.setSessionIdCookie(sessionIdCookie());
        sessionManager.setSessionIdCookieEnabled(true);
        return sessionManager;
    }

    @Bean
    public SessionDao dbSessionDAO() {
        return new SessionDao();
    }

    @Bean
    public SecurityManager securityManager(SessionManager sessionManager) {
        DefaultWebSecurityManager securityManager = new DefaultWebSecurityManager();
        securityManager.setSessionManager(sessionManager);
        securityManager.setRealm(myShiroRealm());
        SecurityUtils.setSecurityManager(securityManager);
        return securityManager;
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
