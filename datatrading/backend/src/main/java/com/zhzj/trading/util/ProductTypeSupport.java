package com.zhzj.trading.util;

import org.apache.commons.lang3.StringUtils;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public final class ProductTypeSupport {

    private static final Map<String, String> RESPONSE_LABELS = buildResponseLabels();

    private ProductTypeSupport() {
    }

    public static String normalizeForResponse(String productType) {
        if (StringUtils.isBlank(productType)) {
            return productType;
        }
        String trimmed = productType.trim();
        return RESPONSE_LABELS.getOrDefault(trimmed, trimmed);
    }

    private static Map<String, String> buildResponseLabels() {
        Map<String, String> labels = new HashMap<>();
        labels.put("数据集", "数据集");
        labels.put("API产品", "API产品");
        labels.put("数据应用", "数据应用");
        labels.put("数据报告", "数据报告");
        labels.put("数字对象", "数字对象");
        labels.put("数据对象", "数字对象");
        labels.put("其他", "其他");
        labels.put("DATASET", "数据集");
        labels.put("DATASET_PRODUCT", "数据集");
        labels.put("API_PRODUCT", "API产品");
        labels.put("STREAMING_PRODUCT", "其他");
        labels.put("FILE_PRODUCT", "数据集");
        return Collections.unmodifiableMap(labels);
    }
}
