package com.zhzj.trading.model.commodity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

/**
 * Lightweight legal organization operator info entity.
 *
 * @author Connector Team
 * @since 2026-05-26
 */
@Data
@TableName("sp.legal_org_operator_info")
public class LegalOrgOperatorInfo {

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @TableField("user_id")
    private Long userId;

    @TableField("operator_name")
    private String operatorName;

    @TableField("operator_cert_type")
    private String operatorCertType;

    @TableField("operator_cert_number")
    private String operatorCertNumber;
}
