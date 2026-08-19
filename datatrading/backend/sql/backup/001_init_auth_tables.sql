-- trading 认证基础表初始化
-- 说明：
-- 1. 当前脚本仅补充 trading 登录所需的验证码缓存表
-- 2. 同时补充 Shiro 会话落库所需的 sys_session 表
-- 3. 目标 schema 为 trading
-- 4. 兼容 PostgreSQL / openGauss，避免直接使用 CREATE SCHEMA IF NOT EXISTS

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.schemata
        WHERE schema_name = 'trading'
    ) THEN
        EXECUTE 'CREATE SCHEMA trading';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'trading'
          AND table_name = 'captcha_cache'
    ) THEN
        EXECUTE '
            CREATE TABLE trading.captcha_cache (
                captcha_id   VARCHAR(32) PRIMARY KEY,
                captcha_code VARCHAR(16) NOT NULL,
                create_time  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        ';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'trading'
          AND table_name = 'sys_session'
    ) THEN
        EXECUTE '
            CREATE TABLE trading.sys_session (
                id       VARCHAR(64) PRIMARY KEY,
                session  TEXT NOT NULL,
                username VARCHAR(128)
            )
        ';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trading'
          AND c.relname = 'idx_captcha_cache_create_time'
          AND c.relkind = 'i'
    ) THEN
        EXECUTE 'CREATE INDEX idx_captcha_cache_create_time ON trading.captcha_cache (create_time DESC)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trading'
          AND c.relname = 'idx_sys_session_username'
          AND c.relkind = 'i'
    ) THEN
        EXECUTE 'CREATE INDEX idx_sys_session_username ON trading.sys_session (username)';
    END IF;
END $$;

COMMENT ON TABLE trading.captcha_cache IS '交易平台验证码缓存表';
COMMENT ON COLUMN trading.captcha_cache.captcha_id IS '验证码ID';
COMMENT ON COLUMN trading.captcha_cache.captcha_code IS '验证码内容';
COMMENT ON COLUMN trading.captcha_cache.create_time IS '创建时间';

COMMENT ON TABLE trading.sys_session IS '交易平台 Shiro 会话表';
COMMENT ON COLUMN trading.sys_session.id IS '会话ID';
COMMENT ON COLUMN trading.sys_session.session IS '序列化后的会话内容';
COMMENT ON COLUMN trading.sys_session.username IS '登录用户名';
