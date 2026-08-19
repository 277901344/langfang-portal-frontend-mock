package com.zhzj.trading.config;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Trading 平台远程调用基础配置。
 *
 * @author Connector Team
 * @since 2026-05-21
 */
@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate plainRestTemplate() {
        return new RestTemplate();
    }

    @Bean
    @LoadBalanced
    public RestTemplate loadBalancedRestTemplate() {
        return new RestTemplate();
    }
}
