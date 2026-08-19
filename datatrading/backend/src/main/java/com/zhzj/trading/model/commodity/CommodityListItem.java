package com.zhzj.trading.model.commodity;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

/**
 * Commodity list item.
 *
 * @author Connector Team
 * @since 2026-05-25
 */
@Data
public class CommodityListItem {

    private String commodityId;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Long userId;

    private String commodityName;

    private String coverImage;

    private String description;

    private String commodityType;

    private String pricingModel;

    private BigDecimal price;

    private BigDecimal discount;

    private BigDecimal discountPrice;

    private Integer deliveryMethod;

    private Date expiredTime;

    private Integer status;

    private String productId;

    private String productName;

    private String connectorId;

    private Date createdAt;

    private Date updatedAt;
}
