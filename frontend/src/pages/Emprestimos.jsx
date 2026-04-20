import { useEffect, useState } from 'react';
import API_URL from '../config';

function Emprestimos() {
  const [emprestimos, setEmprestimos] = useState([]);
  const [equipamentos, setEquipamentos] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    equipamentoId: '', usuarioId: '', dataDevolucaoPrevista: '', observacoes: ''
  });
  const [success, setSuccess] = useState('');

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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_URL}/emprestimos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.msg || 'Erro ao registrar empréstimo');
      }
      setForm({ equipamentoId: '', usuarioId: '', dataDevolucaoPrevista: '', observacoes: '' });
      setSuccess('Empréstimo registrado com sucesso!');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const devolverEmprestimo = async (id) => {
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_URL}/emprestimos/${id}/devolver`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.msg || 'Erro ao devolver empréstimo');
      }
      setSuccess('Empréstimo devolvido com sucesso!');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const reabrirEmprestimo = async (id) => {
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_URL}/emprestimos/${id}/reabrir`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.msg || 'Erro ao reabrir empréstimo');
      }
      setSuccess('Empréstimo reaberto com sucesso!');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ativo': return 'rgb(59, 130, 246)';
      case 'Devolvido': return '#10b981';
      case 'Atrasado': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const statusBadgeStyle = (backgroundColor) => ({
    backgroundColor,
    color: 'white',
    padding: '6px 12px',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: '700',
    letterSpacing: '0.01em',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  });

  const isAtrasado = (emprestimo) => {
    if (emprestimo.status !== 'Ativo') return false;
    const hoje = new Date();
    const dataPrevista = new Date(emprestimo.dataDevolucaoPrevista);
    return hoje > dataPrevista;
  };

  return (
    <div className="page-section">
      <h2>Empréstimos de Equipamentos</h2>
      <p>Controle empréstimos temporários de equipamentos de TI aos usuários.</p>

      <section className="grid-two">
        <div className="panel">
          <h3>Registrar empréstimo</h3>
          <form onSubmit={handleSubmit} className="form-stack">
            <label>
              Usuário responsável
              <select name="usuarioId" value={form.usuarioId} onChange={handleChange} required>
                <option value="">Selecione o responsável pelo empréstimo</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.nome} - {user.cargo || 'Cargo não informado'} ({user.departamento || 'TI'})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Equipamento disponível
              <select name="equipamentoId" value={form.equipamentoId} onChange={handleChange} required>
                <option value="">Selecione o equipamento</option>
                {equipamentos
                  .filter(e => e.status === 'Disponível')
                  .map((equip) => (
                  <option key={equip._id} value={equip._id}>
                    {equip.nome} - {equip.tipo} ({equip.numeroSerie})
                  </option>
                ))}
              </select>
            </label>
            
            <label>
              Data de devolução prevista
              <input
                type="datetime-local"
                name="dataDevolucaoPrevista"
                value={form.dataDevolucaoPrevista}
                onChange={handleChange}
                min={new Date().toISOString().slice(0, 16)}
                required
              />
            </label>
            <label>
              Observações
              <textarea
                name="observacoes"
                value={form.observacoes}
                onChange={handleChange}
                rows="2"
                placeholder="Motivo do empréstimo, condições do equipamento..."
              />
            </label>
            <button type="submit" className="primary">Registrar empréstimo</button>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
          </form>
        </div>

        <div className="panel">
          <h3>Empréstimos ativos</h3>
          {loading ? (
            <p>Carregando...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : (
            <>
              <ul className="list">
                {emprestimos
                  .filter(emp => emp.status === 'Ativo')
                  .map((emp) => {
                    const atrasado = isAtrasado(emp);
                    return (
                      <li key={emp._id} className="list-item">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <strong>{emp.equipamentoId?.nome}</strong>
                            <p style={{ margin: '4px 0 2px', lineHeight: '1.4' }}>Usuário: {emp.usuarioId?.nome} ({emp.usuarioId?.email})</p>
                            <small style={{ display: 'block', marginTop: '4px' }}>
                              Empréstimo: {new Date(emp.dataEmprestimo).toLocaleDateString()} |
                              Devolução prevista: {new Date(emp.dataDevolucaoPrevista).toLocaleDateString()}
                            </small>
                            {emp.observacoes && <small style={{ display: 'block', marginTop: '4px' }}>Obs: {emp.observacoes}</small>}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                            <span style={statusBadgeStyle(atrasado ? '#ef4444' : getStatusColor(emp.status))}>
                              {atrasado ? 'ATRASADO' : emp.status}
                            </span>
                            {emp.status === 'Ativo' && (
                              <button
                                type="button"
                                className="primary"
                                style={{ backgroundColor: 'rgb(16, 185, 129)', borderColor: 'rgb(15, 118, 110)', padding: '8px 10px', fontSize: '0.9rem' }}
                                onClick={() => devolverEmprestimo(emp._id)}
                              >
                                Devolver
                              </button>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
              </ul>
              <h3 style={{ marginTop: '24px' }}>Empréstimos devolvidos</h3>
              <ul className="list">
                
                {emprestimos
                  .filter(emp => emp.status === 'Devolvido')
                  .map((emp) => (
                    <li key={emp._id} className="list-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <strong>{emp.equipamentoId?.nome || 'Equipamento não encontrado'}</strong>
                          <p style={{ margin: '4px 0 2px', lineHeight: '1.4' }}>Usuário: {emp.usuarioId?.nome || 'Usuário não encontrado'} ({emp.usuarioId?.email || 'Email não informado'})</p>
                          <small style={{ display: 'block', marginTop: '4px' }}>
                            Empréstimo: {new Date(emp.dataEmprestimo).toLocaleDateString()} |
                            Devolução: {emp.dataDevolucaoReal ? new Date(emp.dataDevolucaoReal).toLocaleDateString() : 'Não informada'}
                          </small>
                          {emp.observacoes && <small style={{ display: 'block', marginTop: '4px' }}>Obs: {emp.observacoes}</small>}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                          <span style={statusBadgeStyle(getStatusColor(emp.status))}>
                            {emp.status}
                          </span>
                          <button
                            type="button"
                            className="secondary small"
                            style={{ backgroundColor: '#3b82f6', borderColor: '#3b82f6', color: 'white', padding: '8px 12px', fontSize: '0.8rem' }}
                            onClick={() => reabrirEmprestimo(emp._id)}
                          >
                            Reabrir
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default Emprestimos;