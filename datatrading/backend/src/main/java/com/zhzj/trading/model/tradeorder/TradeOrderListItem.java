package com.zhzj.trading.model.tradeorder;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

/**
 * Trade order list item.
 *
 * @author Connector Team
 * @since 2026-05-24
 */
@Data
public class TradeOrderListItem {

    private String id;

    private String orderNo;

    private String orderTitle;

    private String sourceType;

    private String demandId;

    private String demandNo;

    private String responseId;

    private String contractId;

    private String commodityId;

    private String productId;

    private String versionId;

    private String commodityName;

    private String commodityType;

    private String deliveryType;

    private Long buyerId;

    private String buyerName;

    private String buyerUserIdentityCode;

    private String buyerSubjectName;

    private Long sellerId;

    private String sellerName;

    private String sellerUserIdentityCode;

    private String sellerSubjectName;

    private String connectorId;

    private BigDecimal quotedPrice;

    private String pricingModel;

    private BigDecimal unitPrice;

    private Integer quantity;

    private BigDecimal freeQuota;

    private BigDecimal estimatedAmount;

    private BigDecimal actualAmount;

    private String status;

    private Date createdAt;

    private Date updatedAt;

    private Date confirmedAt;

    private Date completedAt;

    private String paymentStatus;

    private BigDecimal paidAmount;

    private Date paidAt;
}
