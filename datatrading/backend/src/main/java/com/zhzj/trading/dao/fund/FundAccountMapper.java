package com.zhzj.trading.dao.fund;

import com.zhzj.trading.model.fund.FundAccountEntity;
import com.zhzj.trading.model.fund.FundAccountItem;
import com.zhzj.trading.model.resource.fund.FundAccountQueryRequest;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Mapper
public interface FundAccountMapper {

    int insert(FundAccountEntity entity);

    FundAccountEntity selectByIdentityAndRole(@Param("userIdentityCode") String userIdentityCode,
                                              @Param("accountRole") String accountRole);

    int updateBalanceSnapshot(@Param("id") String id,
                              @Param("subjectName") String subjectName,
                              @Param("status") String status,
                              @Param("availableBalance") BigDecimal availableBalance,
                              @Param("totalRechargeAmount") BigDecimal totalRechargeAmount,
                              @Param("totalDebitAmount") BigDecimal totalDebitAmount,
                              @Param("totalIncomeAmount") BigDecimal totalIncomeAmount,
                              @Param("updatedAt") Date updatedAt);

    int countAdminList(@Param("query") FundAccountQueryRequest query);

    List<FundAccountItem> selectAdminList(@Param("query") FundAccountQueryRequest query,
                                          @Param("offset") int offset,
                                          @Param("limit") int limit);

    List<FundAccountItem> selectByIdentityCode(@Param("userIdentityCode") String userIdentityCode);
}
