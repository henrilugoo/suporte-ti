import { useEffect, useState } from 'react';
import API_URL from '../config';
import Dashboard from './Dashboard';

function Chamados() {
  // --- ESTADOS (Lógica) ---
  const [chamados, setChamados] = useState([]);
  const [equipamentos, setEquipamentos] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({}); // Estado para o Elemento Extra
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    titulo: '', 
    descricao: '', 
    prioridade: 'Média', 
    equipamentoId: '', 
    usuarioId: '', 
    solicitante: ''
  });

  const prioridades = [
    { value: 'Baixa', label: 'Baixa', color: '#10b981' },
    { value: 'Média', label: 'Média', color: '#f59e0b' },
    { value: 'Alta', label: 'Alta', color: '#f97316' },
    { value: 'Crítica', label: 'Crítica', color: '#ef4444' }
  ];

  // --- FUNÇÕES DE API ---
  
  // Busca estatísticas para o Dashboard
  const loadStats = async () => {
    try {
      const res = await fetch(`${API_URL}/dashboard/stats`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Erro ao carregar dashboard", err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [chamRes, equipRes, userRes] = await Promise.all([
        fetch(`${API_URL}/chamados`),
        fetch(`${API_URL}/equipamentos`),
        fetch(`${API_URL}/users`)
      ]);
      if (!chamRes.ok || !equipRes.ok || !userRes.ok) throw new Error('Falha ao carregar dados');
      
      setChamados(await chamRes.json());
      setEquipamentos(await equipRes.json());
      setUsers(await userRes.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadData(); 
    loadStats(); // Carrega o dashboard ao iniciar
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (cham) => {
    setEditingId(cham._id);
    setForm({
      titulo: cham.titulo,
      descricao: cham.descricao,
      prioridade: cham.prioridade,
      equipamentoId: cham.equipamentoId?._id || '',
      usuarioId: cham.usuarioId?._id || '',
      solicitante: cham.solicitante || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/chamados/${editingId}` : `${API_URL}/chamados`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!response.ok) throw new Error('Erro ao salvar chamado');

      setSuccess(editingId ? 'Chamado atualizado!' : 'Chamado aberto!');
      setEditingId(null);
      setForm({ titulo: '', descricao: '', prioridade: 'Média', equipamentoId: '', usuarioId: '', solicitante: '' });
      
      loadData();
      loadStats(); // Atualiza dashboard após criar/editar
    } catch (err) {
      setError(err.message);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await fetch(`${API_URL}/chamados/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      loadData();
      loadStats(); // Atualiza dashboard após mudar status
    } catch (err) { setError(err.message); }
  };

  const deleteChamado = async (id) => {
    if (!window.confirm('Excluir este chamado permanentemente?')) return;
    try {
      await fetch(`${API_URL}/chamados/${id}`, { method: 'DELETE' });
      setSuccess('Chamado removido!');
      loadData();
      loadStats(); // Atualiza dashboard após excluir
    } catch (err) { setError(err.message); }
  };

  // --- AUXILIARES ---
  const getPrioridadeColor = (p) => prioridades.find(item => item.value === p)?.color || '#6b7280';
  const getStatusColor = (status) => {
    switch (status) {
      case 'Aberto': return '#3b82f6';
      case 'Em Atendimento': return '#f59e0b';
      case 'Resolvido': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div className="page-section">
      <h2>Gestão de Chamados TI</h2>
      <p style={{ marginBottom: '20px' }}>Gerencie aberturas de chamados e suporte técnico.</p>
      
      {/* O DASHBOARD AGORA FICA AQUI */}
      <Dashboard stats={stats} />

      <section className="grid-two">
        {/* COLUNA ESQUERDA: FORMULÁRIO */}
        <div className="panel">
          <h3>{editingId ? 'Editar Chamado' : 'Abrir novo chamado'}</h3>
          <form onSubmit={handleSubmit} className="form-stack">
            <label>Título do Problema
              <input name="titulo" value={form.titulo} onChange={handleChange} required placeholder="Ex: Monitor sem imagem" />
            </label>
            <label>Descrição detalhada
              <textarea name="descricao" value={form.descricao} onChange={handleChange} rows="3" required />
            </label>
            <label>Prioridade
              <select name="prioridade" value={form.prioridade} onChange={handleChange}>
                {prioridades.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </label>
            <label>Equipamento Relacionado
              <select name="equipamentoId" value={form.equipamentoId} onChange={handleChange} required>
                <option value="">Selecione...</option>
                {equipamentos.map(e => <option key={e._id} value={e._id}>{e.nome} ({e.numeroSerie})</option>)}
              </select>
            </label>
            <label>Técnico Responsável
              <select name="usuarioId" value={form.usuarioId} onChange={handleChange} required>
                <option value="">Selecione...</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.nome}</option>)}
              </select>
            </label>
            <label>Solicitante
              <input name="solicitante" value={form.solicitante} onChange={handleChange} placeholder="Quem solicitou o suporte?" />
            </label>
            
            <button type="submit" className="primary">
              {editingId ? 'Salvar Alterações' : 'Abrir Chamado'}
            </button>
            {editingId && (
              <button type="button" onClick={() => {setEditingId(null); setForm({titulo:'', descricao:'', prioridade:'Média', equipamentoId:'', usuarioId:'', solicitante:''})}} className="secondary">
                Cancelar Edição
              </button>
            )}
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
          </form>
        </div>

        {/* COLUNA DIREITA: LISTAS */}
        <div className="panel">
          <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Chamados Ativos</h3>
          <ul className="list">
            {chamados.filter(c => c.status !== 'Resolvido' && c.status !== 'Fechado').map(cham => (
              <li key={cham._id} className="list-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <strong>{cham.titulo}</strong>
                    <p style={{ fontSize: '0.8rem', margin: '4px 0' }}>Solicitante: {cham.solicitante}</p>
                    <small>Equip: {cham.equipamentoId?.nome} | Técnico: {cham.usuarioId?.nome}</small>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 'fit-content' }}>
                    <span style={{ backgroundColor: getPrioridadeColor(cham.prioridade), color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{cham.prioridade}</span>
                    <div style={{ marginTop: '6px' }}>
                      <span style={{ 
                        backgroundColor: getStatusColor(cham.status), 
                        color: 'white', 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '10px', 
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        display: 'inline-block'
                      }}>
                        {cham.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div style={{ marginTop: '10px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  {cham.status === 'Aberto' && <button onClick={() => updateStatus(cham._id, 'Em Atendimento')} className="primary" style={{ backgroundColor: '#f59e0b', padding: '4px 8px', fontSize: '0.7rem' }}>Atender</button>}
                  {cham.status === 'Em Atendimento' && <button onClick={() => updateStatus(cham._id, 'Resolvido')} className="primary" style={{ backgroundColor: '#10b981', padding: '4px 8px', fontSize: '0.7rem' }}>Resolver</button>}
                  
                  <button onClick={() => handleEditClick(cham)} className="primary" style={{ backgroundColor: '#3b82f6', padding: '4px 8px', fontSize: '0.7rem' }}>Editar</button>
                  <button onClick={() => deleteChamado(cham._id)} className="secondary" style={{ backgroundColor: '#ef4444', color: 'white', padding: '4px 8px', fontSize: '0.7rem' }}>Excluir</button>
                </div>
              </li>
            ))}
          </ul>

          <h3 style={{ marginTop: '20px', borderBottom: '1px solid #eee', paddingBottom: '5px', color: '#666' }}>Chamados Concluídos</h3>
          <ul className="list">
            {chamados.filter(c => c.status === 'Resolvido' || c.status === 'Fechado').map(cham => (
              <li key={cham._id} className="list-item" style={{ opacity: 0.8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{cham.titulo}</span>
                    <p style={{ fontSize: '0.7rem', margin: '0', color: '#666' }}>Solicitante: {cham.solicitante}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => updateStatus(cham._id, 'Aberto')} className="secondary small" style={{ fontSize: '0.7rem' }}>Reabrir</button>
                    <button onClick={() => deleteChamado(cham._id)} className="secondary small" style={{ backgroundColor: '#ef4444', color: 'white', fontSize: '0.7rem' }}>Excluir</button>
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

export default Chamados;