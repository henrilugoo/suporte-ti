import { useEffect, useState } from 'react';
import API_URL from '../config';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    titulo: '', descricao: '', prioridade: 'Média', usuarioId: '', prazo: ''
  });
  const [success, setSuccess] = useState('');

  const prioridades = [
    { value: 'Baixa', label: 'Baixa', color: '#10b981' },
    { value: 'Média', label: 'Média', color: '#f59e0b' },
    { value: 'Alta', label: 'Alta', color: '#f97316' },
    { value: 'Crítica', label: 'Crítica', color: '#ef4444' }
  ];

  const statusTasks = [
    { value: 'Pendente', label: 'Pendente', color: '#6b7280' },
    { value: 'Em Andamento', label: 'Em Andamento', color: '#3b82f6' },
    { value: 'Concluída', label: 'Concluída', color: '#10b981' },
    { value: 'Cancelada', label: 'Cancelada', color: '#ef4444' }
  ];

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [tasksRes, usersRes] = await Promise.all([fetch(`${API_URL}/tasks`), fetch(`${API_URL}/users`)]);
      if (!tasksRes.ok || !usersRes.ok) throw new Error('Falha ao carregar dados');
      setTasks(await tasksRes.json());
      setUsers(await usersRes.json());
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
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.msg || 'Erro ao criar tarefa');
      }
      setForm({ titulo: '', descricao: '', prioridade: 'Média', usuarioId: '', prazo: '' });
      setSuccess('Tarefa criada com sucesso!');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateTaskStatus = async (id, status) => {
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.msg || 'Erro ao atualizar status');
      }
      setSuccess(`Tarefa marcada como ${status.toLowerCase()}!`);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const getPrioridadeColor = (prioridade) => {
    const pri = prioridades.find(p => p.value === prioridade);
    return pri ? pri.color : '#6b7280';
  };

  const getStatusColor = (status) => {
    const stat = statusTasks.find(s => s.value === status);
    return stat ? stat.color : '#6b7280';
  };

  const isAtrasada = (task) => {
    if (task.status === 'Concluída' || task.status === 'Cancelada') return false;
    if (!task.prazo) return false;
    const hoje = new Date();
    const prazo = new Date(task.prazo);
    return hoje > prazo;
  };

  return (
    <div className="page-section">
      <h2>Tarefas de Suporte TI</h2>
      <p>Atribua e acompanhe tarefas de manutenção, configuração e suporte técnico.</p>

      <section className="grid-two">
        <div className="panel">
          <h3>Criar nova tarefa</h3>
          <form onSubmit={handleSubmit} className="form-stack">
            <label>
              Título da tarefa
              <input
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                placeholder="Ex: Configurar VPN, Atualizar Windows, Instalar software"
                required
              />
            </label>
            <label>
              Descrição detalhada
              <textarea
                name="descricao"
                value={form.descricao}
                onChange={handleChange}
                rows="3"
                placeholder="Descreva os passos necessários, equipamentos envolvidos, softwares..."
                required
              />
            </label>
            <label>
              Prioridade
              <select name="prioridade" value={form.prioridade} onChange={handleChange}>
                {prioridades.map((pri) => (
                  <option key={pri.value} value={pri.value}>{pri.label}</option>
                ))}
              </select>
            </label>
            <label>
              Responsável
              <select name="usuarioId" value={form.usuarioId} onChange={handleChange} required>
                <option value="">Selecione o técnico responsável</option>
                {users
                  .filter(user => user.cargo && (
                    user.cargo.includes('Técnico') ||
                    user.cargo.includes('Analista') ||
                    user.cargo.includes('Administrador') ||
                    user.cargo.includes('Coordenador') ||
                    user.cargo.includes('Gerente')
                  ))
                  .map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.nome} - {user.cargo} ({user.departamento})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Prazo para conclusão
              <input
                type="datetime-local"
                name="prazo"
                value={form.prazo}
                onChange={handleChange}
                min={new Date().toISOString().slice(0, 16)}
              />
            </label>
            <button type="submit" className="primary">Criar tarefa</button>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
          </form>
        </div>

        <div className="panel">
          <h3>Tarefas ativas</h3>
          {loading ? (
            <p>Carregando...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : (
            <>
            <ul className="list">
              {tasks
                .filter(task => task.status !== 'Concluída' && task.status !== 'Cancelada')
                .map((task) => {
                  const atrasada = isAtrasada(task);
                  return (
                    <li key={task._id} className="list-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <strong>{task.titulo}</strong>
                          <p style={{ margin: '4px 0 2px', lineHeight: '1.4' }}>{task.descricao.length > 60 ? task.descricao.substring(0, 60) + '...' : task.descricao}</p>
                          <small style={{ display: 'block', marginTop: '4px' }}>Responsável: {task.usuarioId?.nome}</small>
                          {task.prazo && (
                            <small style={{ display: 'block', marginTop: '4px' }}>
                              Prazo: {new Date(task.prazo).toLocaleDateString()} {new Date(task.prazo).toLocaleTimeString()}
                            </small>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                          <span
                            style={{
                              backgroundColor: getPrioridadeColor(task.prioridade),
                              color: 'white',
                              padding: '2px 6px',
                              borderRadius: '8px',
                              fontSize: '0.7rem',
                              fontWeight: '600'
                            }}
                          >
                            {task.prioridade}
                          </span>
                          <span
                            style={{
                              backgroundColor: atrasada ? '#ef4444' : getStatusColor(task.status),
                              color: 'white',
                              padding: '2px 6px',
                              borderRadius: '8px',
                              fontSize: '0.7rem',
                              fontWeight: '600'
                            }}
                          >
                            {atrasada ? 'ATRASADA' : task.status}
                          </span>
                        </div>
                      </div>
                      <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {task.status !== 'Concluída' && (
                          <button
                            type="button"
                            className="primary"
                            style={{ padding: '8px 12px', fontSize: '0.9rem' }}
                            onClick={() => updateTaskStatus(task._id, 'Concluída')}
                          >
                            Concluir
                          </button>
                        )}
                        {task.status !== 'Cancelada' && (
                          <button
                            type="button"
                            className="primary"
                            style={{ backgroundColor: '#ef4444', borderColor: '#ef4444', padding: '8px 12px', fontSize: '0.9rem' }}
                            onClick={() => updateTaskStatus(task._id, 'Cancelada')}
                          >
                            Cancelar
                          </button>
                        )}
                        {task.status !== 'Em Andamento' && task.status !== 'Concluída' && (
                          <button
                            type="button"
                            className="primary"
                            style={{ backgroundColor: '#3b82f6', borderColor: '#3b82f6', padding: '8px 12px', fontSize: '0.9rem' }}
                            onClick={() => updateTaskStatus(task._id, 'Em Andamento')}
                          >
                            Em andamento
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
            </ul>
            <h3 style={{ marginTop: '24px' }}>Tarefas concluídas</h3>
            <ul className="list">
              {tasks
                .filter(task => task.status === 'Concluída')
                .map((task) => (
                  <li key={task._id} className="list-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <strong>{task.titulo}</strong>
                        <p style={{ margin: '4px 0 2px', lineHeight: '1.4' }}>{task.descricao.length > 60 ? task.descricao.substring(0, 60) + '...' : task.descricao}</p>
                        <small style={{ display: 'block', marginTop: '4px' }}>Responsável: {task.usuarioId?.nome}</small>
                        {task.prazo && (
                          <small style={{ display: 'block', marginTop: '4px' }}>
                            Prazo: {new Date(task.prazo).toLocaleDateString()} {new Date(task.prazo).toLocaleTimeString()}
                          </small>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                        <span
                          style={{
                            backgroundColor: getPrioridadeColor(task.prioridade),
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '8px',
                            fontSize: '0.7rem',
                            fontWeight: '600'
                          }}
                        >
                          {task.prioridade}
                        </span>
                        <span
                          style={{
                            backgroundColor: getStatusColor(task.status),
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '8px',
                            fontSize: '0.7rem',
                            fontWeight: '600'
                          }}
                        >
                          {task.status}
                        </span>
                        <button
                          type="button"
                          className="secondary small"
                          style={{ backgroundColor: '#3b82f6', color: 'white', padding: '6px 10px', fontSize: '0.8rem' }}
                          onClick={() => updateTaskStatus(task._id, 'Pendente')}
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

export default Tasks;
