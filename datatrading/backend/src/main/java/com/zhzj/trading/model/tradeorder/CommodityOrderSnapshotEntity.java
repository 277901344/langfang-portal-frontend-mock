package com.zhzj.trading.model.tradeorder;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.util.Date;

/**
 * Commodity snapshot captured when a trade order is submitted.
 *
 * @author Connector Team
 * @since 2026-05-26
 */
@Data
@TableName(schema = "trading", value = "commodity_order")
public class CommodityOrderSnapshotEntity {

    @TableId(type = IdType.INPUT)
    private String id;

    @TableField("order_id")
    private String orderId;

    @TableField("commodity_id")
    private String commodityId;

    @TableField("commodity_snapshot")
    private String commoditySnapshot;

    @TableField("created_at")
    private Date createdAt;
}
