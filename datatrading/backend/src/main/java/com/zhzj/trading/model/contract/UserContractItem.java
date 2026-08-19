package com.zhzj.trading.model.contract;

import lombok.Data;

import java.util.Date;

/**
 * User contract list item.
 *
 * @author Connector Team
 * @since 2026-05-27
 */
@Data
public class UserContractItem {

    private String contractId;

    private String contractName;

    private String contractAbstract;

    private String contractStatus;

    private Date activationTime;

    private Date endTime;

    private Date createTime;

    private String issuerId;

    private String issuerEntityId;

    private String partuserId;

    private String partuserEntityId;

    private Date signTime;

    private String expansionItem;

    private String issuerName;

    private String partuserName;
}
