import { useEffect, useState } from 'react';
import API_URL from '../config';

function Tasks() {
  // --- ESTADOS (Lógica) ---
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null); // ID da tarefa que está sendo editada

  const [form, setForm] = useState({
    titulo: '', descricao: '', prioridade: 'Média', usuarioId: '', prazo: ''
  });

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

  // --- FUNÇÕES DE API (Lógica) ---

  const loadData = async () => {
    setLoading(true);
    try {
      const [tasksRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/tasks`), 
        fetch(`${API_URL}/users`)
      ]);
      if (!tasksRes.ok || !usersRes.ok) throw new Error('Falha ao carregar dados');
      setTasks(await tasksRes.json());
      setUsers(await usersRes.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Função para carregar dados no formulário para editar
  const handleEditClick = (task) => {
    setEditingTaskId(task._id);
    setForm({
      titulo: task.titulo,
      descricao: task.descricao,
      prioridade: task.prioridade,
      usuarioId: task.usuarioId?._id || task.usuarioId,
      prazo: task.prazo ? new Date(task.prazo).toISOString().slice(0, 16) : ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll para o formulário
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    
    const method = editingTaskId ? 'PUT' : 'POST';
    const url = editingTaskId ? `${API_URL}/tasks/${editingTaskId}` : `${API_URL}/tasks`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!response.ok) throw new Error('Erro ao salvar tarefa');

      setSuccess(editingTaskId ? 'Tarefa atualizada!' : 'Tarefa criada!');
      setEditingTaskId(null);
      setForm({ titulo: '', descricao: '', prioridade: 'Média', usuarioId: '', prazo: '' });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateTaskStatus = async (id, status) => {
    try {
      await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      loadData();
    } catch (err) { setError(err.message); }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    try {
      await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
      setSuccess('Tarefa removida!');
      loadData();
    } catch (err) { setError(err.message); }
  };

  // --- AUXILIARES DE DESIGN ---
  const getPrioridadeColor = (p) => prioridades.find(item => item.value === p)?.color || '#6b7280';
  const getStatusColor = (s) => statusTasks.find(item => item.value === s)?.color || '#6b7280';
  const isAtrasada = (task) => {
    if (task.status === 'Concluída' || !task.prazo) return false;
    return new Date() > new Date(task.prazo);
  };

  return (
    <div className="page-section">
      <h2>Tarefas de Suporte TI</h2>
      <p>Gerencie suas tarefas de suporte técnico aqui.</p>
      
      <section className="grid-two">
        <div className="panel">
          <h3>{editingTaskId ? 'Editar Tarefa' : 'Criar nova tarefa'}</h3>
          <form onSubmit={handleSubmit} className="form-stack">
            <label>Título
              <input name="titulo" value={form.titulo} onChange={handleChange} required />
            </label>
            <label>Descrição
              <textarea name="descricao" value={form.descricao} onChange={handleChange} rows="3" required />
            </label>
            <label>Prioridade
              <select name="prioridade" value={form.prioridade} onChange={handleChange}>
                {prioridades.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </label>
            <label>Responsável
              <select name="usuarioId" value={form.usuarioId} onChange={handleChange} required>
                <option value="">Selecione...</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.nome} ({u.cargo})</option>)}
              </select>
            </label>
            <label>Prazo
              <input type="datetime-local" name="prazo" value={form.prazo} onChange={handleChange} />
            </label>
            
            <button type="submit" className="primary">
              {editingTaskId ? 'Salvar Alterações' : 'Criar Tarefa'}
            </button>
            {editingTaskId && (
              <button type="button" onClick={() => {setEditingTaskId(null); setForm({titulo:'', descricao:'', prioridade:'Média', usuarioId:'', prazo:''})}} className="secondary">Cancelar Edição</button>
            )}
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
          </form>
        </div>

        {/* COLUNA DIREITA: LISTAS */}
        <div className="panel">
          <h3>Tarefas ativas</h3>
          <ul className="list">
            {tasks.filter(t => t.status !== 'Concluída' && t.status !== 'Cancelada').map(task => (
              <li key={task._id} className="list-item">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <strong>{task.titulo}</strong>
                    <p style={{ fontSize: '0.85rem', margin: '4px 0' }}>{task.descricao}</p>
                    <small>Resp: {task.usuarioId?.nome}</small>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ backgroundColor: getPrioridadeColor(task.prioridade), color: 'white', padding: '2px 5px', borderRadius: '4px', fontSize: '10px' }}>{task.prioridade}</span>
                    <div style={{ marginTop: '4px' }}>
                       <span style={{ backgroundColor: isAtrasada(task) ? '#ef4444' : getStatusColor(task.status), color: 'white', padding: '2px 5px', borderRadius: '4px', fontSize: '10px' }}>
                        {isAtrasada(task) ? 'ATRASADA' : task.status}
                       </span>
                    </div>
                  </div>
                </div>
                
                <div style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
                  <button onClick={() => updateTaskStatus(task._id, 'Concluída')} className="primary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Concluir</button>
                  <button onClick={() => handleEditClick(task)} className="primary" style={{ backgroundColor: '#3b82f6', padding: '4px 8px', fontSize: '0.75rem' }}>Editar</button>
                  <button onClick={() => deleteTask(task._id)} className="secondary" style={{ backgroundColor: '#ef4444', color: 'white', padding: '4px 8px', fontSize: '0.75rem' }}>Excluir</button>
                </div>
              </li>
            ))}
          </ul>

          <h3 style={{ marginTop: '20px' }}>Tarefas concluídas</h3>
          <ul className="list">
            {tasks.filter(t => t.status === 'Concluída').map(task => (
              <li key={task._id} className="list-item" style={{ opacity: 0.8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{task.titulo}</span>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => updateTaskStatus(task._id, 'Pendente')} className="secondary small">Reabrir</button>
                    <button onClick={() => deleteTask(task._id)} className="secondary small" style={{ backgroundColor: '#ef4444', color: 'white' }}>Excluir</button>
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

export default Tasks;