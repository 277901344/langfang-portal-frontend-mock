package com.zhzj.trading.model.commodity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

/**
 * Lightweight SP connector entity.
 *
 * @author Connector Team
 * @since 2026-05-26
 */
@Data
@TableName("sp.sp_connector")
public class SpConnector {

    @TableId(value = "connector_id", type = IdType.INPUT)
    private String connectorId;

    @TableField("connector_name")
    private String connectorName;
}
