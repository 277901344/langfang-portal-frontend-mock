package com.zhzj.trading.model.commodity;

import lombok.Data;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

/**
 * Unified commodity request.
 *
 * @author Connector Team
 * @since 2026-05-25
 */
@Data
public class CommodityRequest {

    private String commodityId;

    private String productId;

    private String versionId;

    @Size(max = 128, message = "商品名称不能超过128个字符")
    private String commodityName;

    @Size(max = 512, message = "封面图片地址不能超过512个字符")
    private String coverImage;

    private String description;

    private String commodityType;

    @DecimalMin(value = "0.00", message = "商品原价不能小于0")
    private BigDecimal price;

    @DecimalMin(value = "0.00", message = "商品折扣不能小于0")
    private BigDecimal discount;

    @DecimalMin(value = "0.00", message = "折扣价不能小于0")
    private BigDecimal discountPrice;

    private BigDecimal offerPer;

    private BigDecimal businessPer;

    private Integer deliveryMethod;

    private String expiredTime;

    private String keyword;

    private String pricingModel;

    private String errors;

    private Integer status;

    private String topicCategory;

    private String applicationCategory;

    private Boolean marketView;

    private Integer pageNum;

    private Integer pageSize;
}
