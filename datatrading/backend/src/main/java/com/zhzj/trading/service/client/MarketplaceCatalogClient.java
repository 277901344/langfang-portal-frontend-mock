package com.zhzj.trading.service.client;

import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import org.apache.commons.lang3.StringUtils;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.session.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

/**
 * 数据市场目录客户端。
 *
 * @author Connector Team
 * @since 2026-05-22
 */
@Component
public class MarketplaceCatalogClient {

    @Autowired
    @Qualifier("plainRestTemplate")
    private RestTemplate plainRestTemplate;

    @Autowired
    @Qualifier("loadBalancedRestTemplate")
    private RestTemplate loadBalancedRestTemplate;

    @Value("${trading.marketplace.catalog.base-url:${trading.platform-auth.base-url:http://sp-service}}")
    private String catalogBaseUrl;

    @Value("${trading.marketplace.catalog.search-path:/catalogService/search}")
    private String catalogSearchPath;

    @Value("${trading.marketplace.catalog.detail-path:/catalogService/detail}")
    private String catalogDetailPath;

    @Value("${trading.marketplace.catalog.topic-category-path:/basic/getTopicCategory}")
    private String topicCategoryPath;

    @Value("${trading.marketplace.catalog.application-category-path:/basic/getApplicationCategory}")
    private String applicationCategoryPath;

    @Value("${trading.marketplace.catalog.update-frequency-path:/basic/getDataUpdateFrequency}")
    private String updateFrequencyPath;

    @Value("${trading.marketplace.catalog.industry-category-path:/basic/getIndustryCategory}")
    private String industryCategoryPath;

    @Value("${trading.marketplace.catalog.organization-category-path:/basic/getOrganizationCategory}")
    private String organizationCategoryPath;

    @Value("${trading.marketplace.catalog.data-acquisition-path:/basic/getDataAcquisition}")
    private String dataAcquisitionPath;

    @Value("${trading.marketplace.catalog.quality-level-path:/basic/getQualityLevel}")
    private String qualityLevelPath;

    @Value("${trading.marketplace.catalog.security-level-path:/basic/getDataSecurityLevel}")
    private String securityLevelPath;

    public CatalogSearchResponse searchProducts(String keyword, Integer pageNum, Integer pageSize) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(resolveSearchUrl());
        if (StringUtils.isNotBlank(keyword)) {
            builder.queryParam("keyword", keyword);
        }
        if (pageNum != null) {
            builder.queryParam("offset", pageNum);
        }
        if (pageSize != null) {
            builder.queryParam("limit", pageSize);
        }
        URI uri = builder.build().encode().toUri();

        JSONObject body = executeGet(uri);
        JSONObject data = body.getJSONObject("data");
        CatalogSearchResponse response = new CatalogSearchResponse();
        if (data == null) {
            response.setTotal(0L);
            response.setItems(new ArrayList<>());
            return response;
        }

        response.setTotal(data.getLong("total", 0L));
        JSONArray resultData = data.getJSONArray("resultData");
        List<JSONObject> items = new ArrayList<>();
        if (resultData != null) {
            for (int i = 0; i < resultData.size(); i++) {
                JSONObject item = resultData.getJSONObject(i);
                if (item != null) {
                    items.add(item);
                }
            }
        }
        response.setItems(items);
        return response;
    }

    public JSONObject getProductDetail(String productId, String productName) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(resolveDetailUrl())
                .queryParam("productId", productId);
        if (StringUtils.isNotBlank(productName)) {
            builder.queryParam("productName", productName);
        }
        URI uri = builder.build().encode().toUri();

        JSONObject body = executeGet(uri);
        JSONObject product = body.getJSONObject("product");
        if (product == null) {
            throw new IllegalArgumentException("产品不存在或详情不可用");
        }
        return product;
    }

    public List<JSONObject> getTopicCategories() {
        return executeListGet(resolveBasicUrl(topicCategoryPath));
    }

    public List<JSONObject> getApplicationCategories() {
        return executeListGet(resolveBasicUrl(applicationCategoryPath));
    }

    public List<JSONObject> getUpdateFrequencies() {
        return executeListGet(resolveBasicUrl(updateFrequencyPath));
    }

    public List<JSONObject> getIndustryCategories() {
        return executeListGet(resolveBasicUrl(industryCategoryPath));
    }

    public List<JSONObject> getOrganizationCategories() {
        return executeListGet(resolveBasicUrl(organizationCategoryPath));
    }

    public List<JSONObject> getDataAcquisitions() {
        return executeListGet(resolveBasicUrl(dataAcquisitionPath));
    }

    public List<JSONObject> getQualityLevels() {
        return executeListGet(resolveBasicUrl(qualityLevelPath));
    }

    public List<JSONObject> getSecurityLevels() {
        return executeListGet(resolveBasicUrl(securityLevelPath));
    }

    private List<JSONObject> executeListGet(String url) {
        JSONObject body = executeGet(URI.create(url));
        Object data = body.get("data");
        List<JSONObject> items = new ArrayList<>();
        if (data instanceof JSONArray) {
            JSONArray array = (JSONArray) data;
            for (int i = 0; i < array.size(); i++) {
                JSONObject item = array.getJSONObject(i);
                if (item != null) {
                    items.add(item);
                }
            }
        }
        return items;
    }

    private JSONObject executeGet(URI uri) {
        HttpHeaders headers = new HttpHeaders();
        String sessionCookie = resolvePlatformSessionCookie();
        if (StringUtils.isNotBlank(sessionCookie)) {
            headers.add(HttpHeaders.COOKIE, sessionCookie);
        }

        ResponseEntity<String> response = resolveRestTemplate().exchange(
                uri,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                String.class
        );
        JSONObject body = JSONUtil.parseObj(response.getBody());
        Integer code = body.getInt("code");
        if (code == null || code != 10000) {
            throw new IllegalStateException(StringUtils.defaultIfBlank(body.getStr("message"), "目录服务调用失败"));
        }
        return body;
    }

    private RestTemplate resolveRestTemplate() {
        String normalizedBaseUrl = StringUtils.lowerCase(StringUtils.trimToEmpty(catalogBaseUrl));
        if (normalizedBaseUrl.startsWith("http://127.0.0.1")
                || normalizedBaseUrl.startsWith("https://127.0.0.1")
                || normalizedBaseUrl.startsWith("http://localhost")
                || normalizedBaseUrl.startsWith("https://localhost")) {
            return plainRestTemplate;
        }
        return loadBalancedRestTemplate;
    }

    private String resolveSearchUrl() {
        return normalizeBaseUrl(catalogBaseUrl) + normalizePath(catalogSearchPath);
    }

    private String resolveDetailUrl() {
        return normalizeBaseUrl(catalogBaseUrl) + normalizePath(catalogDetailPath);
    }

    private String resolveBasicUrl(String path) {
        return normalizeBaseUrl(catalogBaseUrl) + normalizePath(path);
    }

    private String normalizeBaseUrl(String baseUrl) {
        return StringUtils.removeEnd(StringUtils.trimToEmpty(baseUrl), "/");
    }

    private String normalizePath(String path) {
        return StringUtils.prependIfMissing(StringUtils.trimToEmpty(path), "/");
    }

    private String resolvePlatformSessionCookie() {
        Session session = SecurityUtils.getSubject().getSession(false);
        if (session == null) {
            return null;
        }
        Object sessionCookie = session.getAttribute("platformSessionCookie");
        return sessionCookie == null ? null : String.valueOf(sessionCookie);
    }
    public static class CatalogSearchResponse {

        private Long total;

        private List<JSONObject> items;

        public Long getTotal() {
            return total;
        }

        public void setTotal(Long total) {
            this.total = total;
        }

        public List<JSONObject> getItems() {
            return items;
        }

        public void setItems(List<JSONObject> items) {
            this.items = items;
        }
    }
}
