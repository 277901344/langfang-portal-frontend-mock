package com.zhzj.trading.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhzj.trading.model.CaptchaCache;
import org.apache.ibatis.annotations.Mapper;

/**
 * 验证码缓存表 Mapper 接口
 *
 * @author Connector Team
 * @since 2026-05-21
 */
@Mapper
public interface CaptchaCacheDao extends BaseMapper<CaptchaCache> {
}
