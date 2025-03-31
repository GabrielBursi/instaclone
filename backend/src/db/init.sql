DROP DATABASE IF EXISTS jstack_live049;
CREATE DATABASE jstack_live049;

\c jstack_live049

-- Tabela de usuários
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de posts
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  caption TEXT,
  image_url TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  likes_count INTEGER DEFAULT 0
);

-- Tabela de seguidores
CREATE TABLE followers (
  id SERIAL PRIMARY KEY,
  follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Tabela de likes
CREATE TABLE likes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Tabela para valores pré-computados
CREATE TABLE user_stats (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  posts_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para resumo do sistema
CREATE TABLE system_summary (
  entity VARCHAR(100) PRIMARY KEY,
  total_count INTEGER DEFAULT 0
);

-- Funções para atualizar contadores
CREATE OR REPLACE FUNCTION update_post_counts() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Atualiza contador de posts do usuário
    UPDATE user_stats
    SET posts_count = posts_count + 1
    WHERE user_id = NEW.user_id;

    -- Atualiza contador global de posts
    UPDATE system_summary
    SET total_count = total_count + 1
    WHERE entity = 'posts';

  ELSIF TG_OP = 'DELETE' THEN
    -- Atualiza contador de posts do usuário
    UPDATE user_stats
    SET posts_count = posts_count - 1
    WHERE user_id = OLD.user_id;

    -- Atualiza contador global de posts
    UPDATE system_summary
    SET total_count = total_count - 1
    WHERE entity = 'posts';
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_follower_counts() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Atualiza contador de seguidores (followers)
    UPDATE user_stats
    SET followers_count = followers_count + 1
    WHERE user_id = NEW.following_id;

    -- Atualiza contador de seguindo (following)
    UPDATE user_stats
    SET following_count = following_count + 1
    WHERE user_id = NEW.follower_id;

  ELSIF TG_OP = 'DELETE' THEN
    -- Atualiza contador de seguidores (followers)
    UPDATE user_stats
    SET followers_count = followers_count - 1
    WHERE user_id = OLD.following_id;

    -- Atualiza contador de seguindo (following)
    UPDATE user_stats
    SET following_count = following_count - 1
    WHERE user_id = OLD.follower_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_like_counts() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Aumenta contador de likes
    UPDATE posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;

  ELSIF TG_OP = 'DELETE' THEN
    -- Diminui contador de likes
    UPDATE posts
    SET likes_count = likes_count - 1
    WHERE id = OLD.post_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Função para criar user_stats ao criar um usuário
CREATE OR REPLACE FUNCTION create_user_stats() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_stats(user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER posts_counter_trigger
AFTER INSERT OR DELETE ON posts
FOR EACH ROW EXECUTE FUNCTION update_post_counts();

CREATE TRIGGER followers_counter_trigger
AFTER INSERT OR DELETE ON followers
FOR EACH ROW EXECUTE FUNCTION update_follower_counts();

CREATE TRIGGER likes_counter_trigger
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_like_counts();

CREATE TRIGGER create_user_stats_trigger
AFTER INSERT ON users
FOR EACH ROW EXECUTE FUNCTION create_user_stats();

-- Índices para otimizar paginação baseada em cursor
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_followers_follower_id ON followers(follower_id);
CREATE INDEX idx_followers_following_id ON followers(following_id);

-- Seeds
INSERT INTO system_summary(entity, total_count) VALUES('posts', 0);
INSERT INTO system_summary(entity, total_count) VALUES('users', 0);

-- Seeds para usuários
INSERT INTO users(username, name, email) VALUES
('john_doe', 'John Doe', 'john@example.com'),
('jane_smith', 'Jane Smith', 'jane@example.com'),
('mike_jones', 'Mike Jones', 'mike@example.com'),
('sarah_wilson', 'Sarah Wilson', 'sarah@example.com'),
('chris_taylor', 'Chris Taylor', 'chris@example.com');

-- Atualiza contador de usuários
UPDATE system_summary SET total_count = 5 WHERE entity = 'users';

-- Seeds para posts (20 por usuário)
DO $$
DECLARE
  user_id_var INTEGER;
  i INTEGER;
BEGIN
  FOR user_id_var IN 1..5 LOOP
    FOR i IN 1..20 LOOP
      INSERT INTO posts(user_id, caption)
      VALUES (
        user_id_var,
        'Este é o post ' || i || ' do usuário ' || user_id_var
      );
    END LOOP;
  END LOOP;
END $$;

-- Seeds para seguidores (relações aleatórias)
INSERT INTO followers(follower_id, following_id) VALUES
(1, 2), (1, 3), (1, 4),
(2, 1), (2, 3), (2, 5),
(3, 1), (3, 4), (3, 5),
(4, 1), (4, 2), (4, 5),
(5, 1), (5, 2), (5, 3);

-- Seeds para likes (alguns likes aleatórios)
DO $$
DECLARE
  post_id_var INTEGER;
  user_id_var INTEGER;
BEGIN
  FOR post_id_var IN 1..100 LOOP
    FOR user_id_var IN 1..5 LOOP
      -- Adiciona like com 40% de probabilidade
      IF random() < 0.4 THEN
        BEGIN
          INSERT INTO likes(user_id, post_id)
          VALUES (user_id_var, post_id_var);
        EXCEPTION WHEN OTHERS THEN
          -- Ignora duplicatas
        END;
      END IF;
    END LOOP;
  END LOOP;
END $$;
