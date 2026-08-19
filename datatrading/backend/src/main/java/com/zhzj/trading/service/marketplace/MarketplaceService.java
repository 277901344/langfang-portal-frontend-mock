package com.zhzj.trading.service.marketplace;

import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import com.zhzj.trading.enums.CommodityTypeEnum;
import com.zhzj.trading.model.marketplace.MarketplaceCategoriesResponse;
import com.zhzj.trading.model.marketplace.MarketplaceCategoryOption;
import com.zhzj.trading.service.client.MarketplaceCatalogClient;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 数据市场只读服务。
 * <p>当前仅提供分类字典；商品列表与详情由 CommodityManagementService 的市场模式提供。</p>
 */
@Service
public class MarketplaceService {

    private static final Logger log = LoggerFactory.getLogger(MarketplaceService.class);

    private final MarketplaceCatalogClient marketplaceCatalogClient;

    public MarketplaceService(MarketplaceCatalogClient marketplaceCatalogClient) {
        this.marketplaceCatalogClient = marketplaceCatalogClient;
    }

    public MarketplaceCategoriesResponse getCategories() {
        Map<String, String> topicCategoryMap = safeTreeCategoryMap(
                marketplaceCatalogClient::getTopicCategories,
                "主题分类"
        );
        Map<String, String> applicationCategoryMap = safeTreeCategoryMap(
                marketplaceCatalogClient::getApplicationCategories,
                "应用场景"
        );
        Map<String, String> industryCategoryMap = safeTreeCategoryMap(
                marketplaceCatalogClient::getIndustryCategories,
                "行业分类"
        );
        Map<String, String> organizationCategoryMap = safeFlatCategoryMap(
                marketplaceCatalogClient::getOrganizationCategories,
                "机构分类"
        );
        Map<String, String> dataAcquisitionMap = safeFlatCategoryMap(
                marketplaceCatalogClient::getDataAcquisitions,
                "数据来源"
        );
        Map<String, String> updateFrequencyMap = safeFlatCategoryMap(
                marketplaceCatalogClient::getUpdateFrequencies,
                "更新频次"
        );
        Map<String, String> qualityLevelMap = safeFlatCategoryMap(
                marketplaceCatalogClient::getQualityLevels,
                "质量等级"
        );
        Map<String, String> securityLevelMap = safeFlatCategoryMap(
                marketplaceCatalogClient::getSecurityLevels,
                "安全等级"
        );

        MarketplaceCategoriesResponse response = new MarketplaceCategoriesResponse();
        response.setProductTypes(buildStaticProductTypes());
        response.setTopicCategories(toOptions(topicCategoryMap));
        response.setApplicationCategories(toOptions(applicationCategoryMap));
        response.setIndustryCategories(toOptions(industryCategoryMap));
        response.setOrganizationCategories(toOptions(organizationCategoryMap));
        response.setDataAcquisitions(toOptions(dataAcquisitionMap));
        response.setUpdateFrequencies(toOptions(updateFrequencyMap));
        response.setQualityLevels(toOptions(qualityLevelMap));
        response.setSecurityLevels(toOptions(securityLevelMap));
        response.setPaymentMethods(buildStaticPaymentMethods());
        return response;
    }

    private List<MarketplaceCategoryOption> buildStaticProductTypes() {
        List<MarketplaceCategoryOption> options = new ArrayList<>();
        for (CommodityTypeEnum type : CommodityTypeEnum.values()) {
            options.add(MarketplaceCategoryOption.of(type.getLabel(), type.getCode()));
        }
        return options;
    }

    private List<MarketplaceCategoryOption> buildStaticPaymentMethods() {
        List<MarketplaceCategoryOption> options = new ArrayList<>();
        options.add(MarketplaceCategoryOption.of("线下支付", "0"));
        options.add(MarketplaceCategoryOption.of("线上交付", "1"));
        return options;
    }

    private List<MarketplaceCategoryOption> toOptions(Map<String, String> map) {
        return map.entrySet().stream()
                .map(entry -> MarketplaceCategoryOption.of(entry.getValue(), entry.getKey()))
                .collect(Collectors.toList());
    }

    private Map<String, String> safeTreeCategoryMap(CategorySupplier supplier, String categoryName) {
        try {
            return flattenTreeCategoryMap(supplier.get());
        } catch (Exception ex) {
            log.warn("查询{}列表失败，本次使用空列表继续响应数据市场页面。原因: {}", categoryName, ex.getMessage());
            return Collections.emptyMap();
        }
    }

    private Map<String, String> safeFlatCategoryMap(CategorySupplier supplier, String categoryName) {
        try {
            return flattenFlatCategoryMap(supplier.get());
        } catch (Exception ex) {
            log.warn("查询{}列表失败，本次使用空列表继续响应数据市场页面。原因: {}", categoryName, ex.getMessage());
            return Collections.emptyMap();
        }
    }

    private Map<String, String> flattenFlatCategoryMap(List<JSONObject> items) {
        Map<String, String> result = new LinkedHashMap<>();
        if (items == null) {
            return result;
        }
        for (JSONObject item : items) {
            String code = item.getStr("code");
            String name = item.getStr("name");
            if (StringUtils.isNotBlank(code) && StringUtils.isNotBlank(name)) {
                result.put(code, name);
            }
        }
        return result;
    }

    private Map<String, String> flattenTreeCategoryMap(List<JSONObject> items) {
        Map<String, String> result = new LinkedHashMap<>();
        if (items == null) {
            return result;
        }
        for (JSONObject item : items) {
            walkTree(item, result);
        }
        return result;
    }

    private void walkTree(JSONObject item, Map<String, String> result) {
        if (item == null) {
            return;
        }
        String code = item.getStr("code");
        String name = item.getStr("name");
        if (StringUtils.isNotBlank(code) && StringUtils.isNotBlank(name)) {
            result.put(code, name);
        }
        Object childrenObj = item.get("children");
        if (childrenObj instanceof JSONArray) {
            JSONArray children = (JSONArray) childrenObj;
            for (int i = 0; i < children.size(); i++) {
                walkTree(children.getJSONObject(i), result);
            }
        }
    }

    @FunctionalInterface
    private interface CategorySupplier {

        List<JSONObject> get();
    }
}
