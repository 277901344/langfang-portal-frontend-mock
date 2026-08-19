package com.zhzj.trading.service.marketplace;

import cn.hutool.json.JSONObject;
import com.zhzj.trading.model.marketplace.MarketplaceCategoriesResponse;
import com.zhzj.trading.service.client.MarketplaceCatalogClient;
import org.junit.jupiter.api.Test;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class MarketplaceServiceCategoryDictionaryTest {

    @Test
    void returnsAllProductDetailDictionaries() {
        MarketplaceCatalogClient client = mock(MarketplaceCatalogClient.class);
        when(client.getTopicCategories()).thenReturn(Collections.singletonList(option("A0100", "人口数据")));
        when(client.getApplicationCategories()).thenReturn(Collections.singletonList(option("S0100", "市场监测")));
        when(client.getIndustryCategories()).thenReturn(Collections.singletonList(option("I65", "软件和信息技术服务业")));
        when(client.getOrganizationCategories()).thenReturn(Collections.singletonList(option("ORG1", "企业单位")));
        when(client.getDataAcquisitions()).thenReturn(Collections.singletonList(option("1", "收集取得")));
        when(client.getUpdateFrequencies()).thenReturn(Collections.singletonList(option("1", "每周")));
        when(client.getQualityLevels()).thenReturn(Collections.singletonList(option("A", "A级")));
        when(client.getSecurityLevels()).thenReturn(Collections.singletonList(option("1", "一级")));

        MarketplaceCategoriesResponse response = new MarketplaceService(client).getCategories();

        assertEquals("人口数据", response.getTopicCategories().get(0).getLabel());
        assertEquals("市场监测", response.getApplicationCategories().get(0).getLabel());
        assertEquals("软件和信息技术服务业", response.getIndustryCategories().get(0).getLabel());
        assertEquals("企业单位", response.getOrganizationCategories().get(0).getLabel());
        assertEquals("收集取得", response.getDataAcquisitions().get(0).getLabel());
        assertEquals("每周", response.getUpdateFrequencies().get(0).getLabel());
        assertEquals("A级", response.getQualityLevels().get(0).getLabel());
        assertEquals("一级", response.getSecurityLevels().get(0).getLabel());
    }

    private JSONObject option(String code, String name) {
        JSONObject item = new JSONObject();
        item.set("code", code);
        item.set("name", name);
        return item;
    }
}
