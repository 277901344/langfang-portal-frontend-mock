package com.zhzj.trading.model.commodity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

/**
 * Lightweight legal organization auth info entity.
 *
 * @author Connector Team
 * @since 2026-05-26
 */
@Data
@TableName("sp.legal_org_auth_info")
public class LegalOrgAuthInfo {

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @TableField("user_id")
    private Long userId;

    @TableField("legal_org_name")
    private String legalOrgName;

    @TableField("unified_social_credit_code")
    private String unifiedSocialCreditCode;
}
