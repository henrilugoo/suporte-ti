import { useEffect, useState } from 'react';
import API_URL from '../config';

function Chamados() {
  const [chamados, setChamados] = useState([]);
  const [equipamentos, setEquipamentos] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    titulo: '', descricao: '', prioridade: 'Média', equipamentoId: '', usuarioId: ''
  });
  const [success, setSuccess] = useState('');

  const prioridades = [
    { value: 'Baixa', label: 'Baixa', color: '#10b981' },
    { value: 'Média', label: 'Média', color: '#f59e0b' },
    { value: 'Alta', label: 'Alta', color: '#f97316' },
    { value: 'Crítica', label: 'Crítica', color: '#ef4444' }
  ];

  const statusChamados = [
    { value: 'Aberto', label: 'Aberto', color: '#3b82f6' },
    { value: 'Em Atendimento', label: 'Em Atendimento', color: '#f59e0b' },
    { value: 'Resolvido', label: 'Resolvido', color: '#10b981' },
    { value: 'Fechado', label: 'Fechado', color: '#6b7280' }
  ];

  const loadData = async () => {
    setLoading(true);
    setError('');
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
      const response = await fetch(`${API_URL}/chamados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.msg || 'Erro ao abrir chamado');
      }
      setForm({ titulo: '', descricao: '', prioridade: 'Média', equipamentoId: '', usuarioId: '' });
      setSuccess('Chamado aberto com sucesso!');
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
    const stat = statusChamados.find(s => s.value === status);
    return stat ? stat.color : '#6b7280';
  };

  const badgeStyle = {
    color: 'white',
    padding: '2px 6px',
    borderRadius: '8px',
    fontSize: '0.7rem',
    fontWeight: '600'
  };

  const formatDescricao = (descricao) => (
    descricao.length > 60 ? `${descricao.substring(0, 60)}...` : descricao
  );

  const ChamadoItem = ({ cham }) => {
    const handleStatusChange = async (newStatus) => {
      try {
        const response = await fetch(`${API_URL}/chamados/${cham._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        if (!response.ok) throw new Error('Erro ao atualizar status');
        loadData(); // Recarrega os dados
      } catch (err) {
        setError(err.message);
      }
    };

    const getActionButtons = () => {
      switch (cham.status) {
        case 'Aberto':
          return (
            <div style={{ display: 'flex', gap: '4px', flexDirection: 'column' }}>
              <button 
                onClick={() => handleStatusChange('Em Atendimento')} 
                className="secondary small"
                style={{ backgroundColor: '#f59e0b', color: 'white' }}
              >
                Atender
              </button>
            </div>
          );
        case 'Em Atendimento':
          return (
            <div style={{ display: 'flex', gap: '4px', flexDirection: 'column' }}>
              <button 
                onClick={() => handleStatusChange('Resolvido')} 
                className="secondary small"
                style={{ backgroundColor: '#10b981', color: 'white' }}
              >
                Resolver
              </button>
              <button 
                onClick={() => handleStatusChange('Fechado')} 
                className="secondary small"
                style={{ backgroundColor: '#6b7280', color: 'white' }}
              >
                Fechar
              </button>
            </div>
          );
        case 'Resolvido':
          return (
            <button 
              onClick={() => handleStatusChange('Fechado')} 
              className="secondary small"
              style={{ backgroundColor: '#6b7280', color: 'white' }}
            >
              Fechar
            </button>
          );
        case 'Fechado':
          return (
            <button 
              onClick={() => handleStatusChange('Aberto')} 
              className="secondary small"
              style={{ backgroundColor: '#3b82f6', color: 'white', padding: '6px 10px', fontSize: '0.8rem' }}
            >
              Reabrir
            </button>
          );
        default:
          return null;
      }
    };

    return (
      <li className="list-item">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <strong>{cham.titulo}</strong>
            <p style={{ margin: '4px 0 6px', lineHeight: '1.4' }}>{formatDescricao(cham.descricao)}</p>
            <small>{cham.equipamentoId?.nome} | {cham.usuarioId?.nome}</small>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
            <span style={{ ...badgeStyle, backgroundColor: getPrioridadeColor(cham.prioridade) }}>
              {cham.prioridade}
            </span>
            <span style={{ ...badgeStyle, backgroundColor: getStatusColor(cham.status) }}>
              {cham.status}
            </span>
            {getActionButtons()}
          </div>
        </div>
      </li>
    );
  };

  return (
    <div className="page-section">
      <h2>Chamados de Suporte</h2>
      <p>Abra e acompanhe chamados de suporte técnico de TI.</p>

      <section className="grid-two">
        <div className="panel">
          <h3>Abrir novo chamado</h3>
          <form onSubmit={handleSubmit} className="form-stack">
            <label>
              Título do problema
              <input
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                placeholder="Ex: Notebook não liga, Impressora sem conexão"
                required
              />
            </label>
            <label>
              Descrição detalhada
              <textarea
                name="descricao"
                value={form.descricao}
                onChange={handleChange}
                rows="4"
                placeholder="Descreva o problema em detalhes: sintomas, quando começou, tentativas de solução..."
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
              Equipamento afetado
             
  <select name="equipamentoId" value={form.equipamentoId} onChange={handleChange} required disabled={equipamentos.length === 0}>
                <option value="">{equipamentos.length === 0 ? 'Nenhum equipamento disponível' : 'Selecione o equipamento'}</option>
                {equipamentos.map((equip) => (
                  <option key={equip._id} value={equip._id}>{equip.nome} - {equip.tipo}</option>
                ))}


              </select>
            </label>

            <label>
              Usuário responsável
              <select name="usuarioId" value={form.usuarioId} onChange={handleChange} required disabled={users.length === 0}>
                <option value="">{users.length === 0 ? 'Nenhum usuário disponível' : 'Selecione o usuário'}</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>{user.nome} - {user.cargo || 'Cargo não informado'}</option>
                ))}
              </select>
            </label>

            <label>
              Solicitante
              <input
                name="solicitante"
                value={form.solicitante}
                onChange={handleChange}
                placeholder="Nome do solicitante do chamado"
              />

            </label>
            <button type="submit" className="primary">Abrir chamado</button>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
          </form>
        </div>

        <div className="panel">
          <h3>Chamados em andamento</h3>
          {loading ? (
            <p>Carregando...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : (
            <ul className="list">
              {chamados.filter(cham => !['Resolvido', 'Fechado'].includes(cham.status)).map((cham) => (
                <ChamadoItem key={cham._id} cham={cham} />
              ))}
            </ul>
          )}

          <h3 style={{ marginTop: '20px' }}>Chamados Concluídos</h3>
          <ul className="list">
            {chamados.filter(cham => ['Resolvido', 'Fechado'].includes(cham.status)).map((cham) => (
              <ChamadoItem key={cham._id} cham={cham} />
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

export default Chamados;