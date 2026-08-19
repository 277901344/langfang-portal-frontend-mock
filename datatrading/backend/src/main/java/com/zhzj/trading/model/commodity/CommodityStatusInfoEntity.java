package com.zhzj.trading.model.commodity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.util.Date;

/**
 * Commodity lifecycle log entity.
 *
 * @author Connector Team
 * @since 2026-05-25
 */
@Data
@TableName("trading.commodity_status_info")
public class CommodityStatusInfoEntity {

    @TableId(type = IdType.INPUT)
    private String id;

    private String commodityId;

    private Integer status;

    @TableField("create_time")
    private Date createTime;

    private String errors;

    @TableField("operation_user")
    private Long operationUser;
}
