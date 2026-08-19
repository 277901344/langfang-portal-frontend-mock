-- trading fund account tables
-- conservative version for older PostgreSQL / openGauss variants
-- avoid using any "IF NOT EXISTS" DDL syntax directly

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'trading'
          AND table_name = 'fund_account'
    ) THEN
        EXECUTE 'CREATE TABLE trading.fund_account (
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
        )';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trading'
          AND c.relname = 'fund_account_flow_id_seq'
          AND c.relkind = 'S'
    ) THEN
        EXECUTE 'CREATE SEQUENCE trading.fund_account_flow_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'trading'
          AND table_name = 'fund_account_flow'
    ) THEN
        EXECUTE 'CREATE TABLE trading.fund_account_flow (
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
        )';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'commodity_id'
    ) AND EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'product_id'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order RENAME COLUMN product_id TO commodity_id';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'commodity_name'
    ) AND EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'product_name'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order RENAME COLUMN product_name TO commodity_name';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'commodity_type'
    ) AND EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'product_type'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order RENAME COLUMN product_type TO commodity_type';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'buyer_user_identity_code'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order ADD COLUMN buyer_user_identity_code VARCHAR(64)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'buyer_subject_name'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order ADD COLUMN buyer_subject_name VARCHAR(256)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'seller_user_identity_code'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order ADD COLUMN seller_user_identity_code VARCHAR(64)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'seller_subject_name'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order ADD COLUMN seller_subject_name VARCHAR(256)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'payment_status'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order ADD COLUMN payment_status VARCHAR(20) DEFAULT ''UNPAID''';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'paid_amount'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order ADD COLUMN paid_amount NUMERIC(12, 2)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'paid_at'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order ADD COLUMN paid_at TIMESTAMP';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'debit_flow_id'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order ADD COLUMN debit_flow_id BIGINT';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'income_flow_id'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order ADD COLUMN income_flow_id BIGINT';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trading'
          AND c.relname = 'uk_fund_account_identity_role'
          AND c.relkind = 'i'
    ) THEN
        EXECUTE 'CREATE UNIQUE INDEX uk_fund_account_identity_role ON trading.fund_account (user_identity_code, account_role)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trading'
          AND c.relname = 'idx_fund_account_identity'
          AND c.relkind = 'i'
    ) THEN
        EXECUTE 'CREATE INDEX idx_fund_account_identity ON trading.fund_account (user_identity_code)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trading'
          AND c.relname = 'idx_fund_flow_identity'
          AND c.relkind = 'i'
    ) THEN
        EXECUTE 'CREATE INDEX idx_fund_flow_identity ON trading.fund_account_flow (user_identity_code)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trading'
          AND c.relname = 'idx_fund_flow_order'
          AND c.relkind = 'i'
    ) THEN
        EXECUTE 'CREATE INDEX idx_fund_flow_order ON trading.fund_account_flow (order_id)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trading'
          AND c.relname = 'idx_fund_flow_type'
          AND c.relkind = 'i'
    ) THEN
        EXECUTE 'CREATE INDEX idx_fund_flow_type ON trading.fund_account_flow (flow_type)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trading'
          AND c.relname = 'idx_trade_order_payment_status'
          AND c.relkind = 'i'
    ) THEN
        EXECUTE 'CREATE INDEX idx_trade_order_payment_status ON trading.trade_order (payment_status)';
    END IF;
END $$;
