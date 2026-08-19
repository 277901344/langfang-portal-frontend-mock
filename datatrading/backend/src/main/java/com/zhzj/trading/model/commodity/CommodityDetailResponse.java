package com.zhzj.trading.model.commodity;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

/**
 * Commodity detail response.
 *
 * @author Connector Team
 * @since 2026-05-25
 */
@Data
public class CommodityDetailResponse {

    private String commodityId;

    private String commodityName;

    private String coverImage;

    private String description;

    private String commodityType;

    private String pricingModel;

    private BigDecimal price;

    private BigDecimal discount;

    private BigDecimal discountPrice;

    private BigDecimal offerPer;

    private BigDecimal businessPer;

    private Integer deliveryMethod;

    private Date expiredTime;

    private Integer status;

    private Long userId;

    private String userIdentityCode;

    private String connectorId;

    private String productId;

    private String versionId;

    private Date createdAt;

    private Date updatedAt;

    private CommodityProductItem product;

    private CommodityProviderInfo providerInfo;

    private List<CommodityStatusInfoEntity> statusLogs;
}
