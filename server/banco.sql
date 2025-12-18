CREATE DATABASE IF NOT EXISTS teste
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE teste;

CREATE TABLE setores (
  id_setor INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE movimentacoes (
  id_movimentacao BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  
  -- ENTRADA ou SAIDA (TransactionType)
  tipo ENUM('ENTRADA', 'SAIDA') NOT NULL,
  
  -- Relação com a tabela de setores
  id_setor INT UNSIGNED NULL,
  nome_setor VARCHAR(100) NOT NULL,
  
  -- Data informada no formulário (YYYY-MM-DD)
  data_movimentacao DATE NOT NULL,
  
  -- Descrição livre do item / operação
  descricao VARCHAR(255) NOT NULL,
  
  -- PATRIMONIO ou CARGA (ItemCategory)
  categoria ENUM('PATRIMONIO', 'CARGA') NOT NULL,
  
  -- Quantidade movimentada
  quantidade INT NOT NULL,
  
  -- Somente para PATRIMONIO – código de 4 dígitos do bem
  id_patrimonio CHAR(4) NULL,
  
  -- Timestamp numérico (ms desde 1970, igual ao usado no front)
  timestamp_ms BIGINT UNSIGNED NOT NULL,
  
  CONSTRAINT fk_mov_setor
    FOREIGN KEY (id_setor)
    REFERENCES setores(id_setor)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  
  INDEX idx_mov_setor_data (id_setor, data_movimentacao),
  INDEX idx_mov_tipo_data (tipo, data_movimentacao),
  INDEX idx_mov_categoria (categoria),
  INDEX idx_mov_nome_setor (nome_setor),
  INDEX idx_mov_timestamp (timestamp_ms)
);

INSERT INTO setores (nome) VALUES
 ('Almoxarifado'),
 ('TI'),
 ('Administrativo');
