package com.zhzj.trading.model.commodity;

import lombok.Data;

import java.util.List;

/**
 * Selectable data product list response.
 *
 * @author Connector Team
 * @since 2026-05-25
 */
@Data
public class CommodityProductListResponse {

    private List<CommodityProductItem> data;

    private Integer dataCount;

    private Integer pageCount;
}
