DROP DATABASE IF EXISTS jstack_live049;
CREATE DATABASE jstack_live049;

\c jstack_live049

CREATE TABLE posts(
  id TEXT PRIMARY KEY,
  title VARCHAR(255),
  content TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE system_summary(
  entity VARCHAR(100) PRIMARY KEY,
  total_count INTEGER DEFAULT 0
);

-- Functions
CREATE FUNCTION update_posts_total_count() RETURNS TRIGGER AS $$
  BEGIN
    IF TG_OP = 'INSERT' THEN
      UPDATE system_summary
      SET total_count = total_count + 1
      WHERE entity = 'posts';

    ELSIF TG_OP = 'DELETE' THEN
      UPDATE system_summary
      SET total_count = total_count - 1
      WHERE entity = 'posts';
    END IF;

    RETURN NULL;
  END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_posts_total_count_trigger
AFTER INSERT OR DELETE ON posts
FOR EACH ROW EXECUTE FUNCTION update_posts_total_count();

-- Seeds
INSERT INTO system_summary(entity) VALUES('posts');

-- DO $$
--   DECLARE
--     i INTEGER;
--   BEGIN
--     FOR i IN 1..100 LOOP
--       INSERT INTO posts(title, content)
--       VALUES ('Post ' || i, 'Conteúdo do post ' || i);
--     END LOOP;
-- END $$
