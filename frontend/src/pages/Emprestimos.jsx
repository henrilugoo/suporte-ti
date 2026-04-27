import { useEffect, useState } from 'react';
import API_URL from '../config';

function Emprestimos() {
  const [emprestimos, setEmprestimos] = useState([]);
  const [equipamentos, setEquipamentos] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    equipamentoId: '', 
    usuarioId: '', 
    dataDevolucaoPrevista: '', 
    observacoes: ''
  });

  // --- CARREGAMENTO DE DADOS ---
  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [empRes, equipRes, userRes] = await Promise.all([
        fetch(`${API_URL}/emprestimos`),
        fetch(`${API_URL}/equipamentos`),
        fetch(`${API_URL}/users`)
      ]);
      if (!empRes.ok || !equipRes.ok || !userRes.ok) throw new Error('Falha ao carregar dados');
      
      setEmprestimos(await empRes.json());
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
  }, []);

  // --- LOGICA DE FORMULÁRIO ---
  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const prepararEdicao = (emp) => {
    setEditingId(emp._id);
    setForm({
      equipamentoId: emp.equipamentoId?._id || emp.equipamentoId,
      usuarioId: emp.usuarioId?._id || emp.usuarioId,
      dataDevolucaoPrevista: emp.dataDevolucaoPrevista ? emp.dataDevolucaoPrevista.slice(0, 16) : '',
      observacoes: emp.observacoes || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(''); 
    setSuccess('');
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/emprestimos/${editingId}` : `${API_URL}/emprestimos`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!response.ok) throw new Error('Erro ao processar empréstimo');

      setSuccess(editingId ? 'Empréstimo atualizado!' : 'Empréstimo registrado!');
      setEditingId(null);
      setForm({ equipamentoId: '', usuarioId: '', dataDevolucaoPrevista: '', observacoes: '' });
      loadData();
    } catch (err) { setError(err.message); }
  };

  // --- AÇÕES ---
  const devolverEmprestimo = async (id) => {
    try {
      const res = await fetch(`${API_URL}/emprestimos/${id}/devolver`, { method: 'PUT' });
      if (res.ok) loadData();
    } catch (err) { setError(err.message); }
  };

  const excluirEmprestimo = async (id) => {
    if (!window.confirm('Excluir este empréstimo?')) return;
    try {
      const res = await fetch(`${API_URL}/emprestimos/${id}`, { method: 'DELETE' });
      if (res.ok) loadData();
    } catch (err) { setError(err.message); }
  };

  const reabrirEmprestimo = async (id) => {
    try {
      const res = await fetch(`${API_URL}/emprestimos/${id}/reabrir`, { method: 'PUT' });
      if (res.ok) loadData();
    } catch (err) { setError(err.message); }
  };

  // --- AUXILIARES DE ESTILO ---
  const getStatusColor = (status) => {
    switch (status) {
      case 'Ativo': return '#3b82f6';
      case 'Devolvido': return '#10b981';
      case 'Atrasado': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const isAtrasado = (emp) => {
    if (emp.status !== 'Ativo') return false;
    return new Date() > new Date(emp.dataDevolucaoPrevista);
  };

  return (
    <div className="page-section">
      <h2>Empréstimos de Equipamentos</h2>
      <p style={{ marginBottom: '20px' }}>Controle a saída e devolução de ativos de TI.</p>

      <section className="grid-two">
        <div className="panel">
          <h3>{editingId ? 'Editar Empréstimo' : 'Registrar Empréstimo'}</h3>
          <form onSubmit={handleSubmit} className="form-stack">
            <label>Usuário responsável
              <select name="usuarioId" value={form.usuarioId} onChange={handleChange} required>
                <option value="">Selecione...</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.nome} ({u.departamento})</option>)}
              </select>
            </label>

            <label>Equipamento
              <select name="equipamentoId" value={form.equipamentoId} onChange={handleChange} required>
                <option value="">Selecione...</option>
                {equipamentos.filter(e => e.status === 'Disponível' || e._id === form.equipamentoId).map(e => (
                  <option key={e._id} value={e._id}>{e.nome} ({e.numeroSerie})</option>
                ))}
              </select>
            </label>
            
            <label>Data de devolução prevista
              <input type="datetime-local" name="dataDevolucaoPrevista" value={form.dataDevolucaoPrevista} onChange={handleChange} required />
            </label>

            <label>Observações
              <textarea name="observacoes" value={form.observacoes} onChange={handleChange} rows="2" />
            </label>

            <button type="submit" className="primary">{editingId ? 'Salvar Alterações' : 'Registrar'}</button>
            {editingId && (
              <button type="button" className="secondary" onClick={() => { setEditingId(null); setForm({equipamentoId:'', usuarioId:'', dataDevolucaoPrevista:'', observacoes:''})}}>
                Cancelar
              </button>
            )}
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
          </form>
        </div>

        <div className="panel">
          <h3>Lista de Empréstimos</h3>
          {loading ? <p>Carregando...</p> : (
            <ul className="list">
              {emprestimos.map((emp) => {
                const atrasado = isAtrasado(emp);
                const statusFinal = atrasado ? 'ATRASADO' : emp.status;
                return (
                  <li key={emp._id} className="list-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <strong>{emp.equipamentoId?.nome}</strong>
                        <p style={{ fontSize: '0.8rem', margin: '4px 0' }}>Para: {emp.usuarioId?.nome}</p>
                        <small style={{ color: '#666' }}>Previsto: {new Date(emp.dataDevolucaoPrevista).toLocaleDateString()}</small>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ 
                          backgroundColor: atrasado ? '#ef4444' : getStatusColor(emp.status), 
                          color: 'white', padding: '4px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' 
                        }}>
                          {statusFinal}
                        </span>
                      </div>
                    </div>

                    <div style={{ marginTop: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {emp.status === 'Ativo' && (
                        <button onClick={() => devolverEmprestimo(emp._id)} className="primary" style={{ backgroundColor: '#10b981', padding: '6px 12px', fontSize: '0.75rem', borderRadius: '20px' }}>
                          Devolver
                        </button>
                      )}
                      <button onClick={() => prepararEdicao(emp)} className="primary" style={{ backgroundColor: '#3b82f6', padding: '6px 12px', fontSize: '0.75rem', borderRadius: '20px' }}>
                        Editar
                      </button>
                      <button onClick={() => excluirEmprestimo(emp._id)} className="primary" style={{ backgroundColor: '#ef4444', padding: '6px 12px', fontSize: '0.75rem', borderRadius: '20px' }}>
                        Excluir
                      </button>
                      {emp.status === 'Devolvido' && (
                        <button onClick={() => reabrirEmprestimo(emp._id)} className="secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '20px' }}>
                          Reabrir
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

export default Emprestimos;