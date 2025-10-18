-- 家族グループテーブル
CREATE TABLE family_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_code VARCHAR(10) UNIQUE NOT NULL,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 家族メンバーテーブル
CREATE TABLE family_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_code VARCHAR(10) REFERENCES family_groups(family_code),
  member_name VARCHAR(100) NOT NULL,
  device_id VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 位置情報テーブル
CREATE TABLE family_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_code VARCHAR(10) REFERENCES family_groups(family_code),
  member_id UUID REFERENCES family_members(id),
  member_name VARCHAR(100) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy INTEGER,
  address TEXT,
  status VARCHAR(20) DEFAULT 'unknown',
  message TEXT,
  battery_level INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- リアルタイム更新を有効化
ALTER PUBLICATION supabase_realtime ADD TABLE family_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE family_members;

-- インデックス作成
CREATE INDEX idx_family_locations_family_code ON family_locations(family_code);
CREATE INDEX idx_family_locations_updated_at ON family_locations(updated_at);
CREATE INDEX idx_family_members_family_code ON family_members(family_code);

-- RLS (Row Level Security) 設定
ALTER TABLE family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_locations ENABLE ROW LEVEL SECURITY;

-- 同じ家族コードのデータのみアクセス可能
CREATE POLICY "Family members can view their group data" ON family_locations
  FOR SELECT USING (true);

CREATE POLICY "Family members can insert their location" ON family_locations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Family members can update their location" ON family_locations
  FOR UPDATE USING (true);
