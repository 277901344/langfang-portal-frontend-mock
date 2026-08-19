package com.zhzj.trading.dao.tradeorder;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhzj.trading.model.tradeorder.CommodityOrderSnapshotEntity;
import org.apache.ibatis.annotations.Mapper;

/**
 * Commodity order snapshot Mapper.
 *
 * @author Connector Team
 * @since 2026-05-26
 */
@Mapper
public interface CommodityOrderSnapshotDao extends BaseMapper<CommodityOrderSnapshotEntity> {
}
