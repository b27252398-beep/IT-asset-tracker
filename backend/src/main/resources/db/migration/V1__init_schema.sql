-- ============================================================
-- IT Asset Tracker — Supabase / PostgreSQL Schema
-- ============================================================

CREATE TYPE asset_status AS ENUM ('AVAILABLE', 'ASSIGNED', 'IN_REPAIR', 'RETIRED');

CREATE TYPE asset_category AS ENUM (
    'LAPTOP', 'DESKTOP', 'MONITOR', 'PRINTER',
    'EMBEDDED_SYSTEM', 'IOT_SENSOR', 'NETWORK_DEVICE',
    'MOBILE_DEVICE', 'SERVER', 'OTHER'
);

CREATE TABLE assets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_tag       VARCHAR(50)  NOT NULL UNIQUE,
    name            VARCHAR(150) NOT NULL,
    category        asset_category NOT NULL,
    status          asset_status   NOT NULL DEFAULT 'AVAILABLE',
    serial_number   VARCHAR(100),
    current_user    VARCHAR(100),
    location        VARCHAR(150),
    purchase_date   DATE,
    notes           TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assets_updated_at
    BEFORE UPDATE ON assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_assets_status   ON assets(status);
CREATE INDEX idx_assets_category ON assets(category);
CREATE INDEX idx_assets_tag      ON assets(asset_tag);

CREATE TABLE assignment_logs (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id      UUID         NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    action        VARCHAR(50)  NOT NULL,
    assigned_to   VARCHAR(100),
    performed_by  VARCHAR(100),
    notes         TEXT,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_logs_asset_id   ON assignment_logs(asset_id);
CREATE INDEX idx_logs_created_at ON assignment_logs(created_at DESC);

INSERT INTO assets (asset_tag, name, category, status, serial_number, location) VALUES
    ('ASSET-001', 'Dell XPS 15 Laptop',       'LAPTOP',          'AVAILABLE',  'SN-DX15-001', 'IT Storeroom'),
    ('ASSET-002', 'Raspberry Pi 4 Module',     'EMBEDDED_SYSTEM', 'AVAILABLE',  'SN-RPI4-002', 'Lab A'),
    ('ASSET-003', 'MacBook Pro 14"',           'LAPTOP',          'ASSIGNED',   'SN-MBP14-003','IT Storeroom'),
    ('ASSET-004', 'Cisco IoT Sensor v2',       'IOT_SENSOR',      'IN_REPAIR',  'SN-CIS2-004', 'Lab B'),
    ('ASSET-005', 'HP LaserJet Pro Printer',   'PRINTER',         'AVAILABLE',  'SN-HPL-005',  'Floor 2'),
    ('ASSET-006', 'Dell 27" Monitor',          'MONITOR',         'ASSIGNED',   'SN-DM27-006', 'Floor 1'),
    ('ASSET-007', 'Arduino Mega 2560',         'EMBEDDED_SYSTEM', 'AVAILABLE',  'SN-ARD-007',  'Lab A'),
    ('ASSET-008', 'Ubiquiti UniFi AP',         'NETWORK_DEVICE',  'AVAILABLE',  'SN-UNF-008',  'Server Room');

UPDATE assets SET current_user = 'Sarah Chen'  WHERE asset_tag = 'ASSET-003';
UPDATE assets SET current_user = 'James Okafor' WHERE asset_tag = 'ASSET-006';
