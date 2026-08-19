package com.zhzj.trading.model.marketplace;

import lombok.Data;

/**
 * 数据市场分类选项。
 *
 * @author Connector Team
 * @since 2026-05-22
 */
@Data
public class MarketplaceCategoryOption {

    private String label;

    private String value;

    public static MarketplaceCategoryOption of(String value) {
        MarketplaceCategoryOption option = new MarketplaceCategoryOption();
        option.setLabel(value);
        option.setValue(value);
        return option;
    }

    public static MarketplaceCategoryOption of(String label, String value) {
        MarketplaceCategoryOption option = new MarketplaceCategoryOption();
        option.setLabel(label);
        option.setValue(value);
        return option;
    }
}
