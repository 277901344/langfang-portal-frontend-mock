package com.zhzj.trading.dao.commodity;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhzj.trading.model.commodity.DataProductHistory;
import org.apache.ibatis.annotations.Mapper;

/**
 * 数据产品历史 Mapper 接口。
 *
 * @author Connector Team
 * @since 2026-06-04
 */
@Mapper
public interface DataProductHistoryDao extends BaseMapper<DataProductHistory> {
}
