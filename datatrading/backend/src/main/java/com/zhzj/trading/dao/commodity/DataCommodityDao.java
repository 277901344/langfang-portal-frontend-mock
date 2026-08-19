package com.zhzj.trading.dao.commodity;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhzj.trading.model.commodity.CommodityListItem;
import com.zhzj.trading.model.commodity.CommodityRequest;
import com.zhzj.trading.model.commodity.DataCommodityEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Date;
import java.util.List;

/**
 * 商品 Mapper 接口。
 *
 * @author Connector Team
 * @since 2026-05-25
 */
@Mapper
public interface DataCommodityDao extends BaseMapper<DataCommodityEntity> {

    IPage<CommodityListItem> selectCommodityPage(Page<CommodityListItem> page,
                                                 @Param("query") CommodityRequest query,
                                                 @Param("userId") Long userId,
                                                 @Param("isAdmin") boolean isAdmin,
                                                 @Param("canManageOwnCommodity") boolean canManageOwnCommodity);

    List<String> selectExpiredPublishedCommodityIds(@Param("updatedAt") Date updatedAt);

    int unpublishExpiredCommodity(@Param("commodityId") String commodityId,
                                  @Param("updatedAt") Date updatedAt);
}
