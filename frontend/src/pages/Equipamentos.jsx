import { useEffect, useState } from 'react';
import API_URL from '../config';

function Equipamentos() {
  const [equipamentos, setEquipamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    nome: '', tipo: '', marca: '', modelo: '', numeroSerie: '', localizacao: '', observacoes: ''
  });

  const tiposEquipamento = [
    'Notebook', 'Desktop', 'Monitor', 'Impressora', 'Scanner', 'Switch',
    'Roteador', 'AP', 'Servidor', 'Projetor', 'Telefone IP', 'Outro'
  ];

  const loadEquipamentos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/equipamentos`);
      if (!response.ok) throw new Error('Falha ao carregar equipamentos');
      setEquipamentos(await response.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEquipamentos(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (equip) => {
    setEditingId(equip._id);
    setForm({
      nome: equip.nome,
      tipo: equip.tipo,
      marca: equip.marca,
      modelo: equip.modelo,
      numeroSerie: equip.numeroSerie,
      localizacao: equip.localizacao,
      observacoes: equip.observacoes || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/equipamentos/${editingId}` : `${API_URL}/equipamentos`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!response.ok) throw new Error('Erro ao salvar');

      setSuccess(editingId ? 'Atualizado!' : 'Cadastrado!');
      setEditingId(null);
      setForm({ nome: '', tipo: '', marca: '', modelo: '', numeroSerie: '', localizacao: '', observacoes: '' });
      loadEquipamentos();
    } catch (err) { setError(err.message); }
  };

  const updateStatus = async (id, status) => {
    await fetch(`${API_URL}/equipamentos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    loadEquipamentos();
  };

  const deleteEquipamento = async (id) => {
    if (!window.confirm('Excluir este equipamento?')) return;
    await fetch(`${API_URL}/equipamentos/${id}`, { method: 'DELETE' });
    loadEquipamentos();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Disponível': return '#10b981';
      case 'Emprestado': return '#f59e0b';
      case 'Manutenção': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="page-section">
      <h2>Inventário de TI</h2>
      <p>Gerencie os equipamentos de TI da sua organização.</p>
      <section className="grid-two">
        <div className="panel">
          <h3>{editingId ? 'Editar Equipamento' : 'Novo Equipamento'}</h3>
          <form onSubmit={handleSubmit} className="form-stack">
            <label>Nome
              <input name="nome" value={form.nome} onChange={handleChange} required placeholder="Ex: Notebook Dell 01" />
            </label>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <label style={{ flex: 1 }}>Tipo
                <select name="tipo" value={form.tipo} onChange={handleChange} required>
                  <option value="">Tipo...</option>
                  {tiposEquipamento.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <label style={{ flex: 1 }}>Série
                <input name="numeroSerie" value={form.numeroSerie} onChange={handleChange} required placeholder="S/N" />
              </label>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <input name="marca" value={form.marca} onChange={handleChange} required placeholder="Marca" style={{ flex: 1 }} />
              <input name="modelo" value={form.modelo} onChange={handleChange} required placeholder="Modelo" style={{ flex: 1 }} />
            </div>

            <label>Localização
              <input name="localizacao" value={form.localizacao} onChange={handleChange} required placeholder="Ex: CPD ou Setor Financeiro" />
            </label>

            <button type="submit" className="primary">
              {editingId ? 'Salvar Alterações' : 'Cadastrar'}
            </button>
            {editingId && (
              <button type="button" onClick={() => {setEditingId(null); setForm({nome:'', tipo:'', marca:'', modelo:'', numeroSerie:'', localizacao:'', observacoes:''})}} className="secondary">
                Cancelar Edição
              </button>
            )}
            {success && <p className="success" style={{fontSize: '0.8rem'}}>{success}</p>}
          </form>
        </div>

   
        <div className="panel">
          <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Equipamentos Ativos</h3>
          <ul className="list" style={{ maxHeight: '45vh', overflowY: 'auto', marginBottom: '20px' }}>
            {equipamentos.filter(e => e.status !== 'Inativo').map(equip => (
              <li key={equip._id} className="list-item">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ fontSize: '0.85rem' }}>{equip.nome}</strong>
                    <p style={{ fontSize: '0.75rem', margin: '2px 0' }}>{equip.marca} {equip.modelo} ({equip.tipo})</p>
                    <small style={{ opacity: 0.7 }}>S/N: {equip.numeroSerie} | Local: {equip.localizacao}</small>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ backgroundColor: getStatusColor(equip.status), color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>
                      {equip.status}
                    </span>
                  </div>
                </div>
                
                <div style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
                  <select 
                    value={equip.status} 
                    onChange={(e) => updateStatus(equip._id, e.target.value)}
                    style={{ padding: '2px 4px', fontSize: '0.7rem', height: '26px' }}
                  >
                    <option value="Disponível">Disponível</option>
                    <option value="Emprestado">Emprestado</option>
                    <option value="Manutenção">Manutenção</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                  <button onClick={() => handleEditClick(equip)} className="primary" style={{ backgroundColor: '#3b82f6', padding: '4px 8px', fontSize: '0.7rem' }}>Editar</button>
                  <button onClick={() => deleteEquipamento(equip._id)} className="secondary" style={{ backgroundColor: '#ef4444', color: 'white', padding: '4px 8px', fontSize: '0.7rem' }}>Excluir</button>
                </div>
              </li>
            ))}
          </ul>

          <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', color: '#666' }}>Inativos / Baixa</h3>
          <ul className="list">
            {equipamentos.filter(e => e.status === 'Inativo').map(equip => (
              <li key={equip._id} className="list-item" style={{ opacity: 0.6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem' }}>{equip.nome} ({equip.numeroSerie})</span>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => updateStatus(equip._id, 'Disponível')} className="secondary small" style={{ fontSize: '0.7rem' }}>Reativar</button>
                    <button onClick={() => deleteEquipamento(equip._id)} className="secondary small" style={{ backgroundColor: '#ef4444', color: 'white', fontSize: '0.7rem' }}>Remover</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

export default Equipamentos;