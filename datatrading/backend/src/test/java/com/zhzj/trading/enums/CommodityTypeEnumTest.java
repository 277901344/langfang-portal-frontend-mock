package com.zhzj.trading.enums;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class CommodityTypeEnumTest {

    @Test
    void shouldNormalizeLegacyProductTypeCodes() {
        assertEquals("API产品", CommodityTypeEnum.normalizeCode("API_PRODUCT"));
        assertEquals("数据集", CommodityTypeEnum.normalizeCode("DATASET_PRODUCT"));
        assertEquals("数字对象", CommodityTypeEnum.normalizeCode("数据对象"));
        assertEquals("其他", CommodityTypeEnum.normalizeCode("STREAMING_PRODUCT"));
    }
}
