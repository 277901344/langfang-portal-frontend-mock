package com.zhzj.trading.util;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class ProductTypeSupportTest {

    @Test
    void shouldNormalizeLegacyProductTypeCodesForResponse() {
        assertEquals("API产品", ProductTypeSupport.normalizeForResponse("API_PRODUCT"));
        assertEquals("数据集", ProductTypeSupport.normalizeForResponse("DATASET_PRODUCT"));
        assertEquals("数字对象", ProductTypeSupport.normalizeForResponse("数据对象"));
        assertEquals("其他", ProductTypeSupport.normalizeForResponse(" STREAMING_PRODUCT "));
    }
}
