package com.zhzj.trading.model.commodity;

import lombok.Data;

import java.util.List;

/**
 * Commodity list response.
 *
 * @author Connector Team
 * @since 2026-05-25
 */
@Data
public class CommodityListResponse {

    private List<CommodityListItem> data;

    private Integer dataCount;

    private Integer pageCount;
}
