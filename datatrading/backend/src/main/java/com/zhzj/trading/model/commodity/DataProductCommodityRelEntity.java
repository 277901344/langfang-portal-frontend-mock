package com.zhzj.trading.model.commodity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.util.Date;

/**
 * Product and commodity relation entity.
 *
 * @author Connector Team
 * @since 2026-05-25
 */
@Data
@TableName("trading.data_product_commodity_rel")
public class DataProductCommodityRelEntity {

    @TableId(type = IdType.INPUT)
    private String id;

    private String productId;

    @TableField("version_id")
    private String versionId;

    private String commodityId;

    private Date createdAt;
}
