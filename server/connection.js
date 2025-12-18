// Este arquivo deve ser executado em um ambiente Node.js (Backend),
// não diretamente no navegador (Frontend React).
// Você precisa instalar a dependência: npm install mysql2 dotenv

import mysql from 'mysql2/promise';

// Configurações do banco de dados
// Em produção, use variáveis de ambiente (process.env)
const dbConfig = {
  host: 'localhost',      // Endereço do servidor MySQL
  user: 'root',           // Seu usuário do MySQL
  password: 'Fesanfe2811$',   // Sua senha do MySQL
  database: 'teste', // Nome do banco de dados
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Criação do pool de conexões
const pool = mysql.createPool(dbConfig);

// Função auxiliar para testar a conexão
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Conexão com MySQL estabelecida com sucesso!');
    connection.release();
    return true;
  } catch (error) {
    console.error('Erro ao conectar no MySQL:', error.message);
    return false;
  }
}

export default pool;
