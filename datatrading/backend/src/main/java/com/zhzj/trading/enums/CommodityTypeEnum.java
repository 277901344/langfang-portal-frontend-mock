package com.zhzj.trading.enums;

import org.apache.commons.lang3.StringUtils;

/**
 * Commodity business type.
 *
 * @author Connector Team
 * @since 2026-05-26
 */
public enum CommodityTypeEnum {

    DATASET("数据集", "数据集"),
    API_PRODUCT("API产品", "API产品"),
    DATA_APPLICATION("数据应用", "数据应用"),
    DATA_REPORT("数据报告", "数据报告"),
    DIGITAL_OBJECT("数字对象", "数字对象"),
    OTHER("其他", "其他");

    private final String code;

    private final String label;

    CommodityTypeEnum(String code, String label) {
        this.code = code;
        this.label = label;
    }

    public String getCode() {
        return code;
    }

    public String getLabel() {
        return label;
    }

    public static CommodityTypeEnum fromCode(String code) {
        if (StringUtils.isBlank(code)) {
            return null;
        }
        String normalized = StringUtils.trim(code);
        for (CommodityTypeEnum value : values()) {
            if (value.code.equals(normalized)) {
                return value;
            }
        }
        return null;
    }

    public static CommodityTypeEnum fromValue(String value) {
        if (StringUtils.isBlank(value)) {
            return null;
        }
        String normalized = StringUtils.trim(value);
        for (CommodityTypeEnum item : values()) {
            if (item.code.equals(normalized) || item.label.equals(normalized)) {
                return item;
            }
        }
        return fromLegacyProductType(normalized);
    }

    public static String normalizeCode(String value) {
        CommodityTypeEnum type = fromValue(value);
        if (type == null) {
            return DATASET.code;
        }
        return type.code;
    }

    public static String normalizeNullableCode(String value) {
        if (StringUtils.isBlank(value)) {
            return null;
        }
        return normalizeCode(value);
    }

    public static String labelOfCode(String code) {
        CommodityTypeEnum type = fromValue(code);
        return type == null ? DATASET.label : type.label;
    }

    private static CommodityTypeEnum fromLegacyProductType(String value) {
        if ("DATASET".equals(value) || "DATASET_PRODUCT".equals(value) || "FILE_PRODUCT".equals(value)) {
            return DATASET;
        }
        if ("API_PRODUCT".equals(value)) {
            return API_PRODUCT;
        }
        if ("数据对象".equals(value)) {
            return DIGITAL_OBJECT;
        }
        if ("STREAMING_PRODUCT".equals(value)) {
            return OTHER;
        }
        return null;
    }
}
