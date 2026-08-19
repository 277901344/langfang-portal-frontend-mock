package com.zhzj.trading.dao.fund;

import com.zhzj.trading.model.fund.FundAccountFlowEntity;
import com.zhzj.trading.model.fund.FundFlowItem;
import com.zhzj.trading.model.resource.fund.FundFlowQueryRequest;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FundAccountFlowMapper {

    int insert(FundAccountFlowEntity entity);

    FundAccountFlowEntity selectById(@Param("id") Long id);

    FundAccountFlowEntity selectIncomeFlowByRelatedFlowId(@Param("relatedFlowId") Long relatedFlowId);

    int countByRelatedFlowId(@Param("relatedFlowId") Long relatedFlowId);

    int countAdminList(@Param("query") FundFlowQueryRequest query);

    List<FundFlowItem> selectAdminList(@Param("query") FundFlowQueryRequest query,
                                       @Param("offset") int offset,
                                       @Param("limit") int limit);

    int countByIdentityCode(@Param("userIdentityCode") String userIdentityCode,
                            @Param("query") FundFlowQueryRequest query);

    List<FundFlowItem> selectByIdentityCode(@Param("userIdentityCode") String userIdentityCode,
                                            @Param("query") FundFlowQueryRequest query,
                                            @Param("offset") int offset,
                                            @Param("limit") int limit);
}
