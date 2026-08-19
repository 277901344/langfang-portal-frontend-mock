-- trading 初始化脚本
-- 兼容 PostgreSQL 9.6 / openGauss，避免直接使用 CREATE ... IF NOT EXISTS 语法。
-- 本脚本面向新环境初始化，表结构直接采用当前最终形态，不包含历史 ADD / DROP / RENAME 字段迁移。

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.schemata
        WHERE schema_name = 'trading'
    ) THEN
        EXECUTE 'CREATE SCHEMA trading';
    END IF;
END;
$$;

-- ============================================================================
-- 认证基础
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'trading' AND table_name = 'captcha_cache'
    ) THEN
        EXECUTE '
            CREATE TABLE trading.captcha_cache (
                captcha_id VARCHAR(32) PRIMARY KEY,
                captcha_code VARCHAR(16) NOT NULL,
                create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        ';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'trading' AND table_name = 'sys_session'
    ) THEN
        EXECUTE '
            CREATE TABLE trading.sys_session (
                id VARCHAR(64) PRIMARY KEY,
                session TEXT NOT NULL,
                username VARCHAR(128)
            )
        ';
    END IF;
END;
$$;

-- ============================================================================
-- 需求中心
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'trading' AND table_name = 'data_demand'
    ) THEN
        EXECUTE '
            CREATE TABLE trading.data_demand (
                id VARCHAR(32) PRIMARY KEY,
                demand_no VARCHAR(64) NOT NULL UNIQUE,
                title VARCHAR(256) NOT NULL,
                description TEXT,
                topic_category VARCHAR(64),
                application_category VARCHAR(64),
                product_type VARCHAR(32),
                update_frequency VARCHAR(32),
                expected_fields_json TEXT,
                usage_purpose VARCHAR(512),
                budget_type VARCHAR(32),
                budget_amount NUMERIC(12, 2),
                expected_delivery VARCHAR(32),
                deadline TIMESTAMP,
                status VARCHAR(20) NOT NULL,
                publisher_id BIGINT NOT NULL,
                publisher_name VARCHAR(128),
                matched_response_id VARCHAR(32),
                order_id VARCHAR(32),
                response_count INTEGER DEFAULT 0,
                view_count INTEGER DEFAULT 0,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                published_at TIMESTAMP,
                closed_at TIMESTAMP,
                deleted INTEGER NOT NULL DEFAULT 0
            )
        ';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'trading' AND table_name = 'demand_response'
    ) THEN
        EXECUTE '
            CREATE TABLE trading.demand_response (
                id VARCHAR(32) PRIMARY KEY,
                demand_id VARCHAR(32) NOT NULL,
                responder_id BIGINT NOT NULL,
                responder_name VARCHAR(128),
                product_id VARCHAR(65),
                version_id VARCHAR(65),
                connector_id VARCHAR(128),
                proposal TEXT NOT NULL,
                quoted_price NUMERIC(12, 2),
                pricing_model VARCHAR(32),
                delivery_type VARCHAR(32),
                status VARCHAR(20) NOT NULL,
                reject_reason VARCHAR(512),
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        ';
    END IF;
END;
$$;

-- ============================================================================
-- 商品管理
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'trading' AND table_name = 'data_commodity'
    ) THEN
        EXECUTE '
            CREATE TABLE trading.data_commodity (
                commodity_id VARCHAR(65) PRIMARY KEY,
                commodity_name VARCHAR(128) NOT NULL,
                cover_image VARCHAR(512),
                description TEXT,
                commodity_type VARCHAR(32) NOT NULL DEFAULT ''0'',
                pricing_model VARCHAR(32) NOT NULL DEFAULT ''FREE'',
                price NUMERIC(10, 2) NOT NULL,
                discount NUMERIC(10, 2) DEFAULT 1.00,
                discount_price NUMERIC(10, 2),
                offer_per NUMERIC(5, 2),
                business_per NUMERIC(5, 2),
                delivery_method INT2 NOT NULL DEFAULT 1,
                expired_time TIMESTAMP,
                status INTEGER NOT NULL DEFAULT 0,
                deleted INTEGER DEFAULT 0,
                user_id BIGINT,
                user_identity_code VARCHAR(128),
                connector_id VARCHAR(128),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'trading' AND table_name = 'data_product_commodity_rel'
    ) THEN
        EXECUTE '
            CREATE TABLE trading.data_product_commodity_rel (
                id VARCHAR(32) PRIMARY KEY,
                product_id VARCHAR(65) NOT NULL,
                version_id VARCHAR(65),
                commodity_id VARCHAR(65) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT uk_product_commodity UNIQUE (product_id, version_id, commodity_id)
            )
        ';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'trading' AND table_name = 'commodity_status_info'
    ) THEN
        EXECUTE '
            CREATE TABLE trading.commodity_status_info (
                id VARCHAR(32) PRIMARY KEY,
                commodity_id VARCHAR(65) NOT NULL,
                status INT2 NOT NULL,
                create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                errors TEXT,
                operation_user BIGINT
            )
        ';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'trading' AND table_name = 'commodity_order'
    ) THEN
        EXECUTE '
            CREATE TABLE trading.commodity_order (
                id VARCHAR(32) PRIMARY KEY,
                order_id VARCHAR(65) NOT NULL,
                commodity_id VARCHAR(65) NOT NULL,
                commodity_snapshot TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ';
    END IF;
END;
$$;

-- ============================================================================
-- 交易订单
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'trading' AND table_name = 'trade_order'
    ) THEN
        EXECUTE '
            CREATE TABLE trading.trade_order (
                id VARCHAR(32) PRIMARY KEY,
                order_no VARCHAR(64) NOT NULL UNIQUE,
                order_title VARCHAR(256) NOT NULL,
                source_type VARCHAR(32) NOT NULL,
                source_id VARCHAR(65) NOT NULL,
                demand_id VARCHAR(32),
                demand_no VARCHAR(64),
                response_id VARCHAR(32) UNIQUE,
                contract_id VARCHAR(47),
                commodity_id VARCHAR(65),
                product_id VARCHAR(65),
                version_id VARCHAR(65),
                commodity_name VARCHAR(256),
                commodity_type VARCHAR(32),
                delivery_type VARCHAR(32),
                buyer_id BIGINT NOT NULL,
                buyer_name VARCHAR(128),
                buyer_user_identity_code VARCHAR(64),
                buyer_subject_name VARCHAR(256),
                seller_id BIGINT NOT NULL,
                seller_name VARCHAR(128),
                seller_user_identity_code VARCHAR(64),
                seller_subject_name VARCHAR(256),
                connector_id VARCHAR(128),
                quoted_price NUMERIC(12, 2),
                pricing_model VARCHAR(32),
                unit_price NUMERIC(12, 2),
                quantity INTEGER NOT NULL DEFAULT 1,
                free_quota NUMERIC(12, 2),
                estimated_amount NUMERIC(12, 2),
                actual_amount NUMERIC(12, 2) DEFAULT 0,
                status VARCHAR(20) NOT NULL,
                payment_status VARCHAR(20) DEFAULT ''UNPAID'',
                paid_amount NUMERIC(12, 2),
                paid_at TIMESTAMP,
                debit_flow_id BIGINT,
                income_flow_id BIGINT,
                remark VARCHAR(512),
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                confirmed_at TIMESTAMP,
                completed_at TIMESTAMP,
                fulfillment_status INTEGER NOT NULL DEFAULT 0,
                fulfillment_expire_at TIMESTAMP,
                deleted INTEGER NOT NULL DEFAULT 0
            )
        ';
    END IF;
END;
$$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'trading' AND table_name = 'trade_order'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'trading'
              AND table_name = 'trade_order'
              AND column_name = 'fulfillment_status'
        ) THEN
            EXECUTE 'ALTER TABLE trading.trade_order ADD COLUMN fulfillment_status INTEGER NOT NULL DEFAULT 0';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'trading'
              AND table_name = 'trade_order'
              AND column_name = 'fulfillment_expire_at'
        ) THEN
            EXECUTE 'ALTER TABLE trading.trade_order ADD COLUMN fulfillment_expire_at TIMESTAMP';
        END IF;
    END IF;
END;
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trading'
          AND c.relname = 'order_status_log_id_seq'
          AND c.relkind = 'S'
    ) THEN
        EXECUTE 'CREATE SEQUENCE trading.order_status_log_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'trading' AND table_name = 'order_status_log'
    ) THEN
        EXECUTE '
            CREATE TABLE trading.order_status_log (
                id BIGINT NOT NULL DEFAULT nextval(''trading.order_status_log_id_seq'') PRIMARY KEY,
                order_id VARCHAR(32) NOT NULL,
                from_status VARCHAR(20),
                to_status VARCHAR(20) NOT NULL,
                operator_id BIGINT,
                operator_name VARCHAR(128),
                reason VARCHAR(512),
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        ';
    END IF;
END;
$$;

-- ============================================================================
-- 资金账户
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'trading' AND table_name = 'fund_account'
    ) THEN
        EXECUTE '
            CREATE TABLE trading.fund_account (
                id VARCHAR(32) PRIMARY KEY,
                account_no VARCHAR(64) NOT NULL UNIQUE,
                user_identity_code VARCHAR(64) NOT NULL,
                subject_name VARCHAR(256) NOT NULL,
                account_role VARCHAR(20) NOT NULL,
                available_balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
                total_recharge_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
                total_debit_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
                total_income_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
                status VARCHAR(20) NOT NULL DEFAULT ''ACTIVE'',
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        ';
    END IF;
END;
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trading'
          AND c.relname = 'fund_account_flow_id_seq'
          AND c.relkind = 'S'
    ) THEN
        EXECUTE 'CREATE SEQUENCE trading.fund_account_flow_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'trading' AND table_name = 'fund_account_flow'
    ) THEN
        EXECUTE '
            CREATE TABLE trading.fund_account_flow (
                id BIGINT NOT NULL DEFAULT nextval(''trading.fund_account_flow_id_seq'') PRIMARY KEY,
                flow_no VARCHAR(64) NOT NULL UNIQUE,
                user_identity_code VARCHAR(64) NOT NULL,
                subject_name VARCHAR(256) NOT NULL,
                account_role VARCHAR(20) NOT NULL,
                flow_type VARCHAR(20) NOT NULL,
                amount NUMERIC(12, 2) NOT NULL,
                before_balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
                after_balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
                order_id VARCHAR(32),
                order_no VARCHAR(64),
                related_flow_id BIGINT,
                attachment_url VARCHAR(512),
                remark VARCHAR(512),
                operator_id BIGINT,
                operator_name VARCHAR(128),
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        ';
    END IF;
END;
$$;

-- ============================================================================
-- 计量计费
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'trading' AND table_name = 'usage_record'
    ) THEN
        EXECUTE '
            CREATE TABLE trading.usage_record (
                id BIGSERIAL PRIMARY KEY,
                contract_id VARCHAR(47) NOT NULL,
                order_id VARCHAR(32) NOT NULL,
                transfer_id VARCHAR(64),
                consumer_id BIGINT NOT NULL,
                consumer_user_identity_code VARCHAR(128),
                provider_id BIGINT NOT NULL,
                provide_user_identity_code VARCHAR(128),
                usage_type VARCHAR(20) NOT NULL,
                usage_value NUMERIC(16, 4) NOT NULL,
                billable_usage NUMERIC(16, 4) DEFAULT 0,
                amount NUMERIC(12, 2) DEFAULT 0,
                source_type VARCHAR(20) DEFAULT ''CONNECTOR'',
                source_status VARCHAR(20) DEFAULT ''RECORDED'',
                recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                raw_payload TEXT
            )
        ';
    END IF;
END;
$$;

-- ============================================================================
-- 索引
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'idx_captcha_cache_create_time' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE INDEX idx_captcha_cache_create_time ON trading.captcha_cache (create_time DESC)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'idx_sys_session_username' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE INDEX idx_sys_session_username ON trading.sys_session (username)';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'idx_data_demand_status' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE INDEX idx_data_demand_status ON trading.data_demand (status)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'idx_data_demand_publisher' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE INDEX idx_data_demand_publisher ON trading.data_demand (publisher_id)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'idx_data_demand_topic_category' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE INDEX idx_data_demand_topic_category ON trading.data_demand (topic_category)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'idx_data_demand_created_at' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE INDEX idx_data_demand_created_at ON trading.data_demand (created_at DESC)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'idx_demand_response_demand_id' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE INDEX idx_demand_response_demand_id ON trading.demand_response (demand_id)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'idx_demand_response_responder_id' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE INDEX idx_demand_response_responder_id ON trading.demand_response (responder_id)';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'idx_commodity_user' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE INDEX idx_commodity_user ON trading.data_commodity (user_id, deleted, created_at DESC)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'idx_commodity_status' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE INDEX idx_commodity_status ON trading.data_commodity (status, deleted, created_at DESC)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'idx_commodity_name' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE INDEX idx_commodity_name ON trading.data_commodity (commodity_name)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'idx_commodity_connector' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE INDEX idx_commodity_connector ON trading.data_commodity (connector_id, deleted, created_at DESC)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'uk_commodity_user_name_active' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE UNIQUE INDEX uk_commodity_user_name_active ON trading.data_commodity (user_id, commodity_name) WHERE deleted = 0';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'idx_rel_product' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE INDEX idx_rel_product ON trading.data_product_commodity_rel (product_id, created_at DESC)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'idx_rel_product_version' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE INDEX idx_rel_product_version ON trading.data_product_commodity_rel (product_id, version_id, created_at DESC)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'idx_rel_commodity' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE INDEX idx_rel_commodity ON trading.data_product_commodity_rel (commodity_id, created_at DESC)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'idx_commodity_order_order_id' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE INDEX idx_commodity_order_order_id ON trading.commodity_order (order_id)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'idx_commodity_order_commodity_id' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE INDEX idx_commodity_order_commodity_id ON trading.commodity_order (commodity_id)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'idx_commodity_order_created_at' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE INDEX idx_commodity_order_created_at ON trading.commodity_order (created_at DESC)';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'idx_trade_order_commodity' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE INDEX idx_trade_order_commodity ON trading.trade_order (commodity_id)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'idx_trade_order_contract' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE INDEX idx_trade_order_contract ON trading.trade_order (contract_id)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'idx_trade_order_buyer' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE INDEX idx_trade_order_buyer ON trading.trade_order (buyer_id)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'idx_trade_order_seller' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE INDEX idx_trade_order_seller ON trading.trade_order (seller_id)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'idx_trade_order_status' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE INDEX idx_trade_order_status ON trading.trade_order (status)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'idx_trade_order_created_at' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE INDEX idx_trade_order_created_at ON trading.trade_order (created_at DESC)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'idx_trade_order_payment_status' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE INDEX idx_trade_order_payment_status ON trading.trade_order (payment_status)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'idx_trade_order_fulfillment_admission' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE INDEX idx_trade_order_fulfillment_admission ON trading.trade_order (contract_id, product_id, status, deleted, fulfillment_status, fulfillment_expire_at, created_at)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'idx_order_status_log_order_id' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE INDEX idx_order_status_log_order_id ON trading.order_status_log (order_id)';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'uk_fund_account_identity_role' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE UNIQUE INDEX uk_fund_account_identity_role ON trading.fund_account (user_identity_code, account_role)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'idx_fund_account_identity' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE INDEX idx_fund_account_identity ON trading.fund_account (user_identity_code)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'idx_fund_flow_identity' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE INDEX idx_fund_flow_identity ON trading.fund_account_flow (user_identity_code)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'idx_fund_flow_order' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE INDEX idx_fund_flow_order ON trading.fund_account_flow (order_id)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'idx_fund_flow_type' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE INDEX idx_fund_flow_type ON trading.fund_account_flow (flow_type)';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'idx_usage_contract' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE INDEX idx_usage_contract ON trading.usage_record (contract_id)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'idx_usage_order' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE INDEX idx_usage_order ON trading.usage_record (order_id)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'idx_usage_recorded' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE INDEX idx_usage_recorded ON trading.usage_record (recorded_at DESC)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'idx_usage_transfer' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE INDEX idx_usage_transfer ON trading.usage_record (transfer_id)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'trading' AND c.relname = 'uk_usage_order_transfer' AND c.relkind = 'i') THEN
        EXECUTE 'CREATE UNIQUE INDEX uk_usage_order_transfer ON trading.usage_record (order_id, transfer_id) WHERE transfer_id IS NOT NULL';
    END IF;
END;
$$;

-- ============================================================================
-- 注释
-- ============================================================================

COMMENT ON TABLE trading.captcha_cache IS '交易平台验证码缓存表';
COMMENT ON COLUMN trading.captcha_cache.captcha_id IS '验证码ID';
COMMENT ON COLUMN trading.captcha_cache.captcha_code IS '验证码内容';
COMMENT ON COLUMN trading.captcha_cache.create_time IS '创建时间';

COMMENT ON TABLE trading.sys_session IS '交易平台 Shiro 会话表';
COMMENT ON COLUMN trading.sys_session.id IS '会话ID';
COMMENT ON COLUMN trading.sys_session.session IS '序列化后的会话内容';
COMMENT ON COLUMN trading.sys_session.username IS '登录用户名';

COMMENT ON TABLE trading.data_demand IS '需求中心需求表';
COMMENT ON TABLE trading.demand_response IS '需求响应表';

COMMENT ON TABLE trading.data_commodity IS '数据商品主表';
COMMENT ON COLUMN trading.data_commodity.commodity_id IS '商品ID，主键，全网唯一标识';
COMMENT ON COLUMN trading.data_commodity.commodity_name IS '商品名称';
COMMENT ON COLUMN trading.data_commodity.cover_image IS '商品封面图片URL';
COMMENT ON COLUMN trading.data_commodity.description IS '商品描述';
COMMENT ON COLUMN trading.data_commodity.commodity_type IS '商品类型：数据集、API产品、数据应用、数据报告、数字对象、其他';
COMMENT ON COLUMN trading.data_commodity.pricing_model IS '定价模式：FREE 免费、PER_CALL 按次计费、MONTHLY 包月';
COMMENT ON COLUMN trading.data_commodity.price IS '产品原价';
COMMENT ON COLUMN trading.data_commodity.discount IS '产品折扣率，默认为 1.00 表示无折扣';
COMMENT ON COLUMN trading.data_commodity.discount_price IS '产品折扣后的价格';
COMMENT ON COLUMN trading.data_commodity.offer_per IS '数据提供方分成比例';
COMMENT ON COLUMN trading.data_commodity.business_per IS '平台运营方分成比例';
COMMENT ON COLUMN trading.data_commodity.delivery_method IS '交付方式：0-线下合同，1-线上交付';
COMMENT ON COLUMN trading.data_commodity.expired_time IS '产品过期时间，NULL 代表永久';
COMMENT ON COLUMN trading.data_commodity.status IS '商品状态：0-待完善，1-待审核，2-审核通过，3-已驳回，4-上架，5-已下架';
COMMENT ON COLUMN trading.data_commodity.deleted IS '删除标记：0-未删除，1-已删除';
COMMENT ON COLUMN trading.data_commodity.user_id IS '创建人ID';
COMMENT ON COLUMN trading.data_commodity.user_identity_code IS '创建人身份编码';
COMMENT ON COLUMN trading.data_commodity.connector_id IS '连接器ID';
COMMENT ON COLUMN trading.data_commodity.created_at IS '创建时间';
COMMENT ON COLUMN trading.data_commodity.updated_at IS '更新时间';

COMMENT ON TABLE trading.data_product_commodity_rel IS '数据产品与商品关系表';
COMMENT ON COLUMN trading.data_product_commodity_rel.id IS '内部ID, 32位uuid';
COMMENT ON COLUMN trading.data_product_commodity_rel.product_id IS '数据产品ID';
COMMENT ON COLUMN trading.data_product_commodity_rel.version_id IS '数据产品版本ID，用于锁定商品关联的产品版本';
COMMENT ON COLUMN trading.data_product_commodity_rel.commodity_id IS '商品ID';
COMMENT ON COLUMN trading.data_product_commodity_rel.created_at IS '创建时间';

COMMENT ON TABLE trading.commodity_status_info IS '商品上架周期表';
COMMENT ON TABLE trading.commodity_order IS '商品订单表';
COMMENT ON COLUMN trading.commodity_order.id IS '记录ID，主键';
COMMENT ON COLUMN trading.commodity_order.order_id IS '订单ID';
COMMENT ON COLUMN trading.commodity_order.commodity_id IS '商品ID';
COMMENT ON COLUMN trading.commodity_order.commodity_snapshot IS '商品快照信息（JSON格式）';
COMMENT ON COLUMN trading.commodity_order.created_at IS '创建时间';

COMMENT ON TABLE trading.trade_order IS '交易订单表';
COMMENT ON COLUMN trading.trade_order.id IS '订单主键 ID';
COMMENT ON COLUMN trading.trade_order.order_no IS '订单编号';
COMMENT ON COLUMN trading.trade_order.order_title IS '订单标题';
COMMENT ON COLUMN trading.trade_order.source_type IS '订单来源类型';
COMMENT ON COLUMN trading.trade_order.source_id IS '订单来源记录 ID';
COMMENT ON COLUMN trading.trade_order.demand_id IS '关联需求 ID';
COMMENT ON COLUMN trading.trade_order.demand_no IS '关联需求编号';
COMMENT ON COLUMN trading.trade_order.response_id IS '关联响应 ID';
COMMENT ON COLUMN trading.trade_order.contract_id IS '外部合约 ID';
COMMENT ON COLUMN trading.trade_order.commodity_id IS '商品 ID';
COMMENT ON COLUMN trading.trade_order.product_id IS '外部产品 ID 快照';
COMMENT ON COLUMN trading.trade_order.version_id IS '外部产品版本 ID 快照';
COMMENT ON COLUMN trading.trade_order.commodity_name IS '商品名称快照';
COMMENT ON COLUMN trading.trade_order.commodity_type IS '商品类型快照';
COMMENT ON COLUMN trading.trade_order.delivery_type IS '交付方式快照';
COMMENT ON COLUMN trading.trade_order.buyer_id IS '买方用户 ID';
COMMENT ON COLUMN trading.trade_order.buyer_name IS '买方用户名/展示名快照';
COMMENT ON COLUMN trading.trade_order.buyer_user_identity_code IS '买方主体 identity code 快照';
COMMENT ON COLUMN trading.trade_order.buyer_subject_name IS '买方主体名称快照';
COMMENT ON COLUMN trading.trade_order.seller_id IS '卖方用户 ID';
COMMENT ON COLUMN trading.trade_order.seller_name IS '卖方用户名/展示名快照';
COMMENT ON COLUMN trading.trade_order.seller_user_identity_code IS '卖方主体 identity code 快照';
COMMENT ON COLUMN trading.trade_order.seller_subject_name IS '卖方主体名称快照';
COMMENT ON COLUMN trading.trade_order.connector_id IS '连接器 ID';
COMMENT ON COLUMN trading.trade_order.quoted_price IS '响应报价快照';
COMMENT ON COLUMN trading.trade_order.pricing_model IS '定价模式快照';
COMMENT ON COLUMN trading.trade_order.unit_price IS '订单单价快照';
COMMENT ON COLUMN trading.trade_order.quantity IS '购买数量';
COMMENT ON COLUMN trading.trade_order.free_quota IS '免费额度快照';
COMMENT ON COLUMN trading.trade_order.estimated_amount IS '预计金额快照';
COMMENT ON COLUMN trading.trade_order.actual_amount IS '当前累计金额';
COMMENT ON COLUMN trading.trade_order.status IS '订单状态';
COMMENT ON COLUMN trading.trade_order.payment_status IS '扣费状态';
COMMENT ON COLUMN trading.trade_order.paid_amount IS '已扣费金额';
COMMENT ON COLUMN trading.trade_order.paid_at IS '扣费完成时间';
COMMENT ON COLUMN trading.trade_order.debit_flow_id IS '扣费流水 ID';
COMMENT ON COLUMN trading.trade_order.income_flow_id IS '收入流水 ID';
COMMENT ON COLUMN trading.trade_order.remark IS '订单备注';
COMMENT ON COLUMN trading.trade_order.created_at IS '创建时间';
COMMENT ON COLUMN trading.trade_order.updated_at IS '更新时间';
COMMENT ON COLUMN trading.trade_order.confirmed_at IS '确认进入履约时间';
COMMENT ON COLUMN trading.trade_order.completed_at IS '完成订单时间';
COMMENT ON COLUMN trading.trade_order.fulfillment_status IS '履约准入状态：0 可履约，1 已关闭准入（按次用尽、包月过期等）';
COMMENT ON COLUMN trading.trade_order.fulfillment_expire_at IS '履约准入过期时间，包月等限时定价模式使用；为空表示不按时间过期';
COMMENT ON COLUMN trading.trade_order.deleted IS '逻辑删除标记 0否 1是';

COMMENT ON TABLE trading.order_status_log IS '订单状态日志表';
COMMENT ON COLUMN trading.order_status_log.id IS '日志主键 ID';
COMMENT ON COLUMN trading.order_status_log.order_id IS '关联订单 ID';
COMMENT ON COLUMN trading.order_status_log.from_status IS '原订单状态';
COMMENT ON COLUMN trading.order_status_log.to_status IS '目标订单状态';
COMMENT ON COLUMN trading.order_status_log.operator_id IS '操作人用户 ID';
COMMENT ON COLUMN trading.order_status_log.operator_name IS '操作人名称快照';
COMMENT ON COLUMN trading.order_status_log.reason IS '状态变更说明';
COMMENT ON COLUMN trading.order_status_log.created_at IS '日志创建时间';

COMMENT ON TABLE trading.fund_account IS '资金账户表';
COMMENT ON TABLE trading.fund_account_flow IS '资金账户流水表';

COMMENT ON TABLE trading.usage_record IS '计量计费使用事实表：记录 connector 在真实履约、传输或调用过程中产生的原始使用事实，一期基于该表实时聚合订单累计用量和累计金额';
COMMENT ON COLUMN trading.usage_record.id IS '使用事实主键 ID，系统自增，仅用于表内唯一标识，不作为外部业务编号';
COMMENT ON COLUMN trading.usage_record.contract_id IS '关联合约 ID，来源于订单绑定的外部合约，用于把履约事实与合约关系对应起来';
COMMENT ON COLUMN trading.usage_record.order_id IS '关联交易订单 ID，对应 trading.trade_order.id，是订单计量汇总、刷新和扣费金额回写的核心关联字段；商品信息不在本表冗余保存，需通过订单关联 trade_order.commodity_id / commodity_name 获取';
COMMENT ON COLUMN trading.usage_record.transfer_id IS '外部传输或调用事实 ID，由 connector 侧生成；与 order_id 组成幂等键，避免同一次履约事实重复入库';
COMMENT ON COLUMN trading.usage_record.consumer_id IS '使用方用户 ID，通常为订单买方用户 ID，用于区分本次计量事实的消费方';
COMMENT ON COLUMN trading.usage_record.consumer_user_identity_code IS '使用方主体 identity code 快照，通常来源于订单买方主体标识，用于按主体统计消费侧用量';
COMMENT ON COLUMN trading.usage_record.provider_id IS '提供方用户 ID，通常为订单卖方用户 ID，用于区分本次计量事实的数据或服务提供方';
COMMENT ON COLUMN trading.usage_record.provide_user_identity_code IS '提供方主体 identity code 快照，通常来源于订单卖方主体标识，用于按主体统计提供侧收入和用量';
COMMENT ON COLUMN trading.usage_record.usage_type IS '使用量类型，表示本次事实的计量口径，例如调用次数、传输次数、文件大小、数据行数等';
COMMENT ON COLUMN trading.usage_record.usage_value IS '原始使用量，记录 connector 回调传入的实际发生用量，保留 4 位小数用于不同计量单位汇总';
COMMENT ON COLUMN trading.usage_record.billable_usage IS '可计费用量，在原始使用量基础上扣除免费额度或按计费规则折算后的用量；一期默认可与 usage_value 保持一致或由服务端计算';
COMMENT ON COLUMN trading.usage_record.amount IS '本条使用事实折算金额，基于订单价格快照、可计费用量和免费额度计算，用于实时汇总订单当前累计金额';
COMMENT ON COLUMN trading.usage_record.source_type IS '使用事实来源类型，默认 CONNECTOR，表示由 connector 履约回调产生；后续可扩展为轮询同步、人工补录等来源';
COMMENT ON COLUMN trading.usage_record.source_status IS '使用事实处理状态，默认 RECORDED，表示已记录；后续可扩展为已汇总、异常、已忽略等处理状态';
COMMENT ON COLUMN trading.usage_record.recorded_at IS '事实发生或记录时间，用于计量趋势统计、使用明细筛选和最近计量时间展示';
COMMENT ON COLUMN trading.usage_record.raw_payload IS '原始回调载荷文本，保存 connector 传入的完整 JSON 字符串，使用 TEXT 兼容 PG 9.6 及不支持 jsonb 的环境，便于排查和追溯';
