package com.zhzj.trading.dao.demandcenter;

import com.zhzj.trading.model.demandcenter.DemandEntity;
import com.zhzj.trading.model.resource.demandcenter.DemandListQueryRequest;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * Demand mapper.
 *
 * @author Connector Team
 * @since 2026-05-22
 */
@Mapper
public interface DemandMapper {

    int insert(DemandEntity entity);

    int update(DemandEntity entity);

    DemandEntity selectById(@Param("id") String id);

    int countByDemandNoPrefix(@Param("prefix") String prefix);

    int countList(@Param("query") DemandListQueryRequest query,
                  @Param("publisherId") Long publisherId,
                  @Param("isAdmin") boolean isAdmin,
                  @Param("publicStatuses") List<String> publicStatuses);

    List<DemandEntity> selectList(@Param("query") DemandListQueryRequest query,
                                  @Param("publisherId") Long publisherId,
                                  @Param("isAdmin") boolean isAdmin,
                                  @Param("publicStatuses") List<String> publicStatuses,
                                  @Param("offset") int offset,
                                  @Param("limit") int limit);

    int updateStatus(@Param("id") String id,
                     @Param("status") String status,
                     @Param("publishedAt") java.util.Date publishedAt,
                     @Param("closedAt") java.util.Date closedAt,
                     @Param("updatedAt") java.util.Date updatedAt);

    int incrementResponseCount(@Param("id") String id,
                               @Param("updatedAt") java.util.Date updatedAt);

    int markMatched(@Param("id") String id,
                    @Param("matchedResponseId") String matchedResponseId,
                    @Param("orderId") String orderId,
                    @Param("status") String status,
                    @Param("updatedAt") java.util.Date updatedAt);
}
