-- Add usage_record subject identity snapshots.
-- preferred for DBeaver + PostgreSQL / openGauss direct execution
-- PG 9.6 compatible

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'usage_record'
          AND column_name = 'consumer_user_identity_code'
    ) THEN
        EXECUTE 'ALTER TABLE trading.usage_record ADD COLUMN consumer_user_identity_code VARCHAR(128)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'usage_record'
          AND column_name = 'provide_user_identity_code'
    ) THEN
        EXECUTE 'ALTER TABLE trading.usage_record ADD COLUMN provide_user_identity_code VARCHAR(128)';
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'trading'
          AND table_name = 'usage_record'
    ) THEN
        EXECUTE 'COMMENT ON COLUMN trading.usage_record.consumer_user_identity_code IS ''使用方主体 identity code 快照，通常来源于订单买方主体标识，用于按主体统计消费侧用量''';
        EXECUTE 'COMMENT ON COLUMN trading.usage_record.provide_user_identity_code IS ''提供方主体 identity code 快照，通常来源于订单卖方主体标识，用于按主体统计提供侧收入和用量''';
    END IF;
END $$;
