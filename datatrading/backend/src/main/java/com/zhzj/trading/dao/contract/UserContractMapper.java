package com.zhzj.trading.dao.contract;

import com.zhzj.trading.model.contract.UserContractItem;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * User contract query mapper.
 *
 * @author Connector Team
 * @since 2026-05-27
 */
@Mapper
public interface UserContractMapper {

    List<UserContractItem> selectUserContracts(@Param("productId") String productId,
                                               @Param("userIdentityCode") String userIdentityCode,
                                               @Param("consumerPlatformUserId") Long consumerPlatformUserId,
                                               @Param("consumerSubjectPlatformUserId") Long consumerSubjectPlatformUserId);
}
