import { useEffect, useState } from 'react';
import API_URL from '../config';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    cargo: 'Técnico de Suporte',
    departamento: 'TI'
  });
  const [success, setSuccess] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);

  const cargos = [
    'Técnico de Suporte',
    'Analista de Sistemas',
    'Administrador de Rede',
    'Coordenador de TI',
    'Gerente de TI',
    'Outro'
  ];

  const departamentos = [
    'TI',
    'Suporte Técnico',
    'Desenvolvimento',
    'Infraestrutura',
    'Segurança da Informação',
    'Outro'
  ];

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/users`);
      if (!response.ok) throw new Error('Falha ao carregar usuários');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
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
      const method = editingUserId ? 'PUT' : 'POST';
      const url = editingUserId ? `${API_URL}/users/${editingUserId}` : `${API_URL}/users`;
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.msg || 'Erro ao salvar usuário');
      }
      setForm({ nome: '', email: '', senha: '', cargo: 'Técnico de Suporte', departamento: 'TI' });
      setEditingUserId(null);
      setSuccess(editingUserId ? 'Usuário atualizado com sucesso!' : 'Usuário cadastrado com sucesso!');
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditUser = (user) => {
    setEditingUserId(user._id);
    setForm({
      nome: user.nome || '',
      email: user.email || '',
      senha: '',
      cargo: user.cargo || 'Técnico de Suporte',
      departamento: user.departamento || 'TI'
    });
    setSuccess('');
    setError('');
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setForm({ nome: '', email: '', senha: '', cargo: 'Técnico de Suporte', departamento: 'TI' });
    setError('');
    setSuccess('');
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Deseja realmente excluir este técnico?')) return;
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.msg || 'Erro ao deletar usuário');
      }
      setSuccess('Técnico deletado com sucesso!');
      if (editingUserId === id) handleCancelEdit();
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-section">
      <h2>Equipe de TI</h2>
      <p>Cadastre e gerencie os membros da equipe de Tecnologia da Informação.</p>

      <section className="grid-two">
        <div className="panel">
          <h3>Cadastrar novo membro</h3>
          <form onSubmit={handleSubmit} className="form-stack">
            <label>
              Nome completo
              <input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                placeholder="Ex: João Silva"
                required
              />
            </label>
            <label>
              Email corporativo
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="joao.silva@empresa.com"
                required
              />
            </label>
            <label>
              Senha de acesso
              <input
                type="password"
                name="senha"
                value={form.senha}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                minLength="6"
                required
              />
            </label>
            <label>
              Cargo
              <select name="cargo" value={form.cargo} onChange={handleChange}>
                {cargos.map((cargo) => (
                  <option key={cargo} value={cargo}>{cargo}</option>
                ))}
              </select>
            </label>
            <label>
              Departamento
              <select name="departamento" value={form.departamento} onChange={handleChange}>
                {departamentos.map((dep) => (
                  <option key={dep} value={dep}>{dep}</option>
                ))}
              </select>
            </label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button type="submit" className="primary">
                {editingUserId ? 'Salvar alterações' : 'Cadastrar usuário'}
              </button>
              {editingUserId && (
                <button type="button" className="secondary" onClick={handleCancelEdit} style={{ padding: '12px 20px' }}>
                  Cancelar
                </button>
              )}
            </div>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
          </form>
        </div>

        <div className="panel">
          <h3>Equipe cadastrada</h3>
          {loading ? (
            <p>Carregando...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : (
            <ul className="list">
              {users.map((user) => (
                <li key={user._id} className="list-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <strong>{user.nome}</strong>
                      <p style={{ margin: '4px 0 2px', lineHeight: '1.4' }}>{user.email}</p>
                      <small style={{ display: 'block', marginTop: '4px' }}>
                        {user.cargo || 'Cargo não informado'} |
                        {user.departamento || 'Departamento não informado'}
                      </small>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <button
                        type="button"
                        className="primary"
                        style={{ backgroundColor: '#2563eb', borderColor: '#2563eb', padding: '8px 12px', fontSize: '0.75rem' }}
                        onClick={() => handleEditUser(user)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="primary"
                        style={{ backgroundColor: '#ef4444', borderColor: '#ef4444', padding: '8px 12px', fontSize: '0.75rem' }}
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

export default Users;
