import express from 'express';
import cors from 'cors';
import pool from './connection.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// --- SETORES ---

app.get('/setores', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id_setor AS id, nome AS name FROM setores ORDER BY nome ASC'
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar setores' });
  }
});

app.post('/setores', async (req, res) => {
  const { name } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO setores (nome) VALUES (?)',
      [name]
    );

    res.status(201).json({ id: result.insertId, name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar setor' });
  }
});

app.put('/setores/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    await pool.query(
      'UPDATE setores SET nome = ? WHERE id_setor = ?',
      [name, id]
    );

    await pool.query(
      'UPDATE movimentacoes SET nome_setor = ? WHERE id_setor = ?',
      [name, id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar setor' });
  }
});

app.delete('/setores/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [movimentacoes] = await pool.query(
      'SELECT COUNT(*) AS count FROM movimentacoes WHERE id_setor = ?',
      [id]
    );

    await pool.query(
      'DELETE FROM setores WHERE id_setor = ?',
      [id]
    );

    res.json({
      success: true,
      movimentacoes_vinculadas: movimentacoes[0].count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir setor' });
  }
});

// --- MOVIMENTAÇÕES ---

app.get('/movimentacoes', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        id_movimentacao AS id,
        tipo AS type,
        id_setor AS sectorId,
        nome_setor AS sectorName,
        data_movimentacao AS date,
        descricao AS description,
        categoria AS category,
        quantidade AS quantity,
        id_patrimonio AS assetId,
        timestamp_ms AS timestamp
      FROM movimentacoes
      ORDER BY data_movimentacao DESC, timestamp_ms DESC
    `);

    const movimentacoes = rows.map(row => ({
      ...row,
      date: typeof row.date === 'string'
        ? row.date
        : row.date.toISOString().split('T')[0]
    }));

    res.json(movimentacoes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar transações' });
  }
});

app.post('/movimentacoes', async (req, res) => {
  const t = req.body;

  try {
    const query = `
      INSERT INTO movimentacoes
        (tipo, id_setor, nome_setor, data_movimentacao, descricao, categoria, quantidade, id_patrimonio, timestamp_ms)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // const values = [
    //   t.tipo,
    //   t.id_setor || null,
    //   t.nome_setor,
    //   t.data_movimentacao,
    //   t.descricao,
    //   t.categoria,
    //   t.quantity,
    //   t.id_patrimonio || null,
    //   t.timestamp_ms
    // ];

    const values = [
      t.type,
      t.sectorId || null,
      t.sectorName,          // 👈 vai direto pro nome_setor
      t.date,
      t.description,
      t.category,
      t.quantity,
      t.assetId || null,
      t.timestamp
    ];


    const [result] = await pool.query(query, values);

    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao salvar transação' });
  }
});

app.put('/movimentacoes/:id', async (req, res) => {
  const { id } = req.params
  const t = req.body

  try {
    await pool.query(
      `UPDATE movimentacoes
       SET 
         tipo = ?,
         id_setor = ?,
         nome_setor = ?,
         data_movimentacao = ?,
         descricao = ?,
         categoria = ?,
         quantidade = ?,
         id_patrimonio = ?,
         timestamp_ms = ?
       WHERE id_movimentacao = ?`,
      [
        t.type,
        t.sectorId || null,
        t.sectorName,
        t.date,
        t.description,
        t.category,
        t.quantity,
        t.assetId || null,
        t.timestamp,
        id
      ]
    )

    res.json({ sucesso: true })
  } catch (erro) {
    console.error(erro)
    res.status(500).json({ erro: 'Erro ao atualizar movimentação' })
  }
})


app.delete('/movimentacoes/:id', async (req, res) => {
  const { id } = req.params

  try {
    await pool.query(
      'DELETE FROM movimentacoes WHERE id_movimentacao = ?',
      [id]
    )

    res.json({ sucesso: true })
  } catch (erro) {
    console.error(erro)
    res.status(500).json({ erro: 'Erro ao excluir movimentação' })
  }
})


app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log('Certifique-se de que o MySQL está rodando e o schema "teste" foi criado.');
});
