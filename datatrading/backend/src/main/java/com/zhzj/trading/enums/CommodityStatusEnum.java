package com.zhzj.trading.enums;

/**
 * Commodity lifecycle status.
 *
 * @author Connector Team
 * @since 2026-05-25
 */
public enum CommodityStatusEnum {

    DRAFT(0, "待完善"),
    REVIEWING(1, "待审核"),
    APPROVED(2, "审核通过"),
    REJECTED(3, "已驳回"),
    PUBLISHED(4, "上架"),
    UNPUBLISHED(5, "已下架");

    private final int code;

    private final String label;

    CommodityStatusEnum(int code, String label) {
        this.code = code;
        this.label = label;
    }

    public int getCode() {
        return code;
    }

    public String getLabel() {
        return label;
    }

    public static CommodityStatusEnum fromCode(Integer code) {
        if (code == null) {
            return null;
        }
        for (CommodityStatusEnum value : values()) {
            if (value.code == code) {
                return value;
            }
        }
        return null;
    }
}
