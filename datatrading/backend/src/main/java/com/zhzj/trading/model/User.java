package com.zhzj.trading.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 * 用户表。
 *
 * @author Connector Team
 * @since 2026-05-21
 */
@Data
@TableName(schema = "sp", value = "user")
public class User implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @TableField("username")
    private String username;

    @TableField("password")
    private String password;

    @TableField("create_time")
    private Date createTime;

    @TableField("update_time")
    private Date updateTime;

    @TableField("auth_status")
    private Integer authStatus;

    @TableField("auth_type")
    private Integer authType;

    @TableField("display_name")
    private String displayName;

    @TableField("account_role")
    private String accountRole;

    @TableField("account_status")
    private String accountStatus;

    @TableField("last_login_time")
    private Date lastLoginTime;

    @TableField("avatar_url")
    private String avatarUrl;

    @TableField("account_type")
    private Integer accountType;

    @TableField(exist = false)
    private Long ownerUserId;

    @TableField(exist = false)
    private String userIdentityCode;

    @TableField(exist = false)
    private String subjectName;
}
