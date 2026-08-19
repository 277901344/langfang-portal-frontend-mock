package com.zhzj.trading.model.commodity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

/**
 * Commodity entity.
 *
 * @author Connector Team
 * @since 2026-05-25
 */
@Data
@TableName("trading.data_commodity")
public class DataCommodityEntity {

    @TableId(value = "commodity_id", type = IdType.INPUT)
    private String commodityId;

    private String commodityName;

    private String coverImage;

    private String description;

    private String commodityType;

    @TableField("pricing_model")
    private String pricingModel;

    private BigDecimal price;

    private BigDecimal discount;

    private BigDecimal discountPrice;

    private BigDecimal offerPer;

    private BigDecimal businessPer;

    @TableField("delivery_method")
    private Integer deliveryMethod;

    @TableField("expired_time")
    private Date expiredTime;

    private Integer status;

    @TableLogic
    private Integer deleted;

    @TableField("user_id")
    private Long userId;

    @TableField("user_identity_code")
    private String userIdentityCode;

    @TableField("connector_id")
    private String connectorId;

    @TableField("created_at")
    private Date createdAt;

    @TableField("updated_at")
    private Date updatedAt;
}
