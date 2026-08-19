package com.zhzj.trading.model.marketplace;

import lombok.Data;

import java.util.List;

/**
 * 数据市场分类维度响应。
 *
 * @author Connector Team
 * @since 2026-05-22
 */
@Data
public class MarketplaceCategoriesResponse {

    private List<MarketplaceCategoryOption> productTypes;

    private List<MarketplaceCategoryOption> topicCategories;

    private List<MarketplaceCategoryOption> applicationCategories;

    private List<MarketplaceCategoryOption> industryCategories;

    private List<MarketplaceCategoryOption> organizationCategories;

    private List<MarketplaceCategoryOption> dataAcquisitions;

    private List<MarketplaceCategoryOption> updateFrequencies;

    private List<MarketplaceCategoryOption> qualityLevels;

    private List<MarketplaceCategoryOption> securityLevels;

    private List<MarketplaceCategoryOption> paymentMethods;
}
