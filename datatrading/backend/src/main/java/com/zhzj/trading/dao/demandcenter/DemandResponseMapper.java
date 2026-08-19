package com.zhzj.trading.dao.demandcenter;

import com.zhzj.trading.model.demandcenter.DemandResponseEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * Demand response mapper.
 *
 * @author Connector Team
 * @since 2026-05-22
 */
@Mapper
public interface DemandResponseMapper {

    int insert(DemandResponseEntity entity);

    DemandResponseEntity selectById(@Param("id") String id);

    List<DemandResponseEntity> selectByDemandId(@Param("demandId") String demandId);

    int countByDemandIdAndResponderId(@Param("demandId") String demandId,
                                      @Param("responderId") Long responderId);

    int updateStatus(@Param("id") String id,
                     @Param("status") String status,
                     @Param("rejectReason") String rejectReason,
                     @Param("updatedAt") java.util.Date updatedAt);

    int rejectOtherPending(@Param("demandId") String demandId,
                           @Param("excludeId") String excludeId,
                           @Param("rejectReason") String rejectReason,
                           @Param("updatedAt") java.util.Date updatedAt);
}
