package com.zhzj.trading.service;

import cn.hutool.captcha.CaptchaUtil;
import cn.hutool.captcha.LineCaptcha;
import cn.hutool.captcha.generator.RandomGenerator;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.zhzj.trading.dao.CaptchaCacheDao;
import com.zhzj.trading.model.CaptchaCache;
import com.zhzj.trading.model.resource.CaptchaResponse;
import com.zhzj.trading.util.UuidUtil;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

/**
 * 验证码服务
 *
 * @author Connector Team
 * @since 2026-05-21
 */
@Service
public class CaptchaService {

    @Autowired
    private CaptchaCacheDao captchaCacheDao;

    private static final long EXPIRATION_MINUTES = 5;
    private static final int CAPTCHA_WIDTH = 110;
    private static final int CAPTCHA_HEIGHT = 40;
    private static final int CAPTCHA_CODE_LENGTH = 4;
    private static final int CAPTCHA_LINE_COUNT = 20;
    private static final String CAPTCHA_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

    @Transactional
    public CaptchaResponse generateCaptcha() {
        LineCaptcha lineCaptcha = CaptchaUtil.createLineCaptcha(
                CAPTCHA_WIDTH,
                CAPTCHA_HEIGHT,
                CAPTCHA_CODE_LENGTH,
                CAPTCHA_LINE_COUNT
        );
        lineCaptcha.setGenerator(new RandomGenerator(CAPTCHA_CHARS, CAPTCHA_CODE_LENGTH));
        String code = lineCaptcha.getCode();
        String imageBase64 = lineCaptcha.getImageBase64();

        CaptchaCache captchaCache = new CaptchaCache();
        captchaCache.setCaptchaId(UuidUtil.get32UUID());
        captchaCache.setCaptchaCode(code);
        captchaCache.setCreateTime(new Date());
        captchaCacheDao.insert(captchaCache);

        return new CaptchaResponse(captchaCache.getCaptchaId(), imageBase64);
    }

    @Transactional
    public boolean verifyCaptcha(String captchaId, String captchaCode) {
        String normalizedCaptchaId = StringUtils.trimToNull(captchaId);
        String normalizedCaptchaCode = StringUtils.trimToNull(captchaCode);
        if (normalizedCaptchaId == null || normalizedCaptchaCode == null) {
            return false;
        }

        QueryWrapper<CaptchaCache> queryWrapper = new QueryWrapper<>();
        CaptchaCache captchaCache = captchaCacheDao.selectOne(queryWrapper.eq("captcha_id", normalizedCaptchaId));
        if (captchaCache == null) {
            return false;
        }

        Instant creationTime = captchaCache.getCreateTime().toInstant();
        Instant now = Instant.now();
        if (creationTime.plus(EXPIRATION_MINUTES, ChronoUnit.MINUTES).isBefore(now)) {
            captchaCacheDao.deleteById(normalizedCaptchaId);
            return false;
        }

        captchaCacheDao.deleteById(normalizedCaptchaId);
        return StringUtils.equalsIgnoreCase(captchaCache.getCaptchaCode(), normalizedCaptchaCode);
    }

    @Scheduled(fixedRate = 1000 * 60 * 60)
    @Transactional
    public void cleanupExpiredCaptchas() {
        Instant expirationTime = Instant.now().minus(EXPIRATION_MINUTES, ChronoUnit.MINUTES);
        captchaCacheDao.delete(new QueryWrapper<CaptchaCache>()
                .le("create_time", Date.from(expirationTime)));
    }
}
