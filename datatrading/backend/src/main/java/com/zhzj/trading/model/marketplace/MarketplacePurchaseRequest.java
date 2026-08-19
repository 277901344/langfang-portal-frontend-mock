package com.zhzj.trading.model.marketplace;

import lombok.Data;

/**
 * Marketplace commodity purchase request.
 *
 * @author Connector Team
 * @since 2026-05-26
 */
@Data
public class MarketplacePurchaseRequest {

    private String commodityId;

    private Integer quantity;
}
