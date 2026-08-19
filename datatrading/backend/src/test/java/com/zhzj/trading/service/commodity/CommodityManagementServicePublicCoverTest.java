package com.zhzj.trading.service.commodity;

import com.zhzj.trading.dao.commodity.DataCommodityServiceDao;
import com.zhzj.trading.enums.CommodityStatusEnum;
import com.zhzj.trading.model.commodity.DataCommodityEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CommodityManagementServicePublicCoverTest {

    private CommodityManagementService service;
    private DataCommodityServiceDao commodityDao;

    @BeforeEach
    void setUp() {
        service = new CommodityManagementService();
        commodityDao = mock(DataCommodityServiceDao.class);
        ReflectionTestUtils.setField(service, "dataCommodityServiceDao", commodityDao);
    }

    @Test
    void returnsCoverOnlyForPublishedUnexpiredCommodity() {
        DataCommodityEntity commodity = commodity("commodity-1", CommodityStatusEnum.PUBLISHED.getCode());
        commodity.setCoverImage("/trading/1/public-cover.png");
        commodity.setExpiredTime(new Date(System.currentTimeMillis() + 60_000L));
        when(commodityDao.getById("commodity-1")).thenReturn(commodity);

        assertEquals("/trading/1/public-cover.png", service.getPublicMarketCommodityCover("commodity-1"));
    }

    @Test
    void rejectsCoverForUnpublishedCommodity() {
        DataCommodityEntity commodity = commodity("commodity-2", CommodityStatusEnum.UNPUBLISHED.getCode());
        commodity.setCoverImage("/trading/1/private-cover.png");
        when(commodityDao.getById("commodity-2")).thenReturn(commodity);

        assertThrows(IllegalArgumentException.class,
                () -> service.getPublicMarketCommodityCover("commodity-2"));
    }

    private DataCommodityEntity commodity(String commodityId, int status) {
        DataCommodityEntity commodity = new DataCommodityEntity();
        commodity.setCommodityId(commodityId);
        commodity.setStatus(status);
        return commodity;
    }
}
