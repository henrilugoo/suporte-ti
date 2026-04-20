import { useEffect, useState } from 'react';
import API_URL from '../config';

function Equipamentos() {
  const [equipamentos, setEquipamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    nome: '', tipo: '', marca: '', modelo: '', numeroSerie: '', localizacao: '', observacoes: ''
  });
  const [success, setSuccess] = useState('');

  const tiposEquipamento = [
    'Notebook',
    'Desktop',
    'Monitor',
    'Impressora',
    'Scanner',
    'Switch de Rede',
    'Roteador',
    'Access Point',
    'Servidor',
    'Projetor',
    'Telefone IP',
    'Webcam',
    'Mouse',
    'Teclado',
    'Headset',
    'Outro'
  ];

  const loadEquipamentos = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/equipamentos`);
      if (!response.ok) throw new Error('Falha ao carregar equipamentos');
      const data = await response.json();
      setEquipamentos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEquipamentos();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    
    // Validar campos obrigatórios
    if (!form.nome || !form.tipo || !form.marca || !form.modelo || !form.numeroSerie || !form.localizacao) {
      setError('Todos os campos obrigatórios devem ser preenchidos');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/equipamentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.msg || responseData.error || 'Erro ao cadastrar equipamento');
      }
      
      setForm({ nome: '', tipo: '', marca: '', modelo: '', numeroSerie: '', localizacao: '', observacoes: '' });
      setSuccess('Equipamento cadastrado com sucesso!');
      loadEquipamentos();
    } catch (err) {
      console.error('Erro detalhado:', err);
      setError(err.message);
    }
  };

  const updateEquipamentoStatus = async (id, status) => {
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_URL}/equipamentos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.msg || 'Erro ao atualizar status');
      }
      setSuccess(`Status do equipamento atualizado para ${status.toLowerCase()}!`);
      loadEquipamentos();
    } catch (err) {
      setError(err.message);
    }
  };

  const deletarEquipamento = async (id) => {
    if (!window.confirm('Deseja realmente excluir este equipamento?')) return;
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_URL}/equipamentos/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.msg || 'Erro ao deletar equipamento');
      }
      setSuccess('Equipamento deletado com sucesso!');
      loadEquipamentos();
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Disponível': return '#10b981';
      case 'Emprestado': return '#f59e0b';
      case 'Manutenção': return '#ef4444';
      case 'Inativo': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <div className="page-section">
      <h2>Equipamentos de TI</h2>
      <p>Gerencie o inventário de equipamentos de tecnologia da informação.</p>

      <section className="grid-two">
        <div className="panel">
          <h3>Cadastrar equipamento</h3>
          <form onSubmit={handleSubmit} className="form-stack">
            <label>
              Nome do equipamento
              <input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                placeholder="Ex: Notebook Dell Latitude 5490"
                required
              />
            </label>
            <label>
              Tipo
              <select name="tipo" value={form.tipo} onChange={handleChange} required>
                <option value="">Selecione o tipo</option>
                {tiposEquipamento.map((tipo) => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </label>
            <label>
              Marca
              <input
                name="marca"
                value={form.marca}
                onChange={handleChange}
                placeholder="Ex: Dell, HP, Lenovo"
                required
              />
            </label>
            <label>
              Modelo
              <input
                name="modelo"
                value={form.modelo}
                onChange={handleChange}
                placeholder="Ex: Latitude 5490, ThinkPad X1"
                required
              />
            </label>
            <label>
              Número de Série
              <input
                name="numeroSerie"
                value={form.numeroSerie}
                onChange={handleChange}
                placeholder="Ex: SN123456789"
                required
              />
            </label>
            <label>
              Localização
              <input
                name="localizacao"
                value={form.localizacao}
                onChange={handleChange}
                placeholder="Ex: Sala 101, Almoxarifado TI"
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
                placeholder="Ex: Processador i5, 8GB RAM, SSD 256GB"
              />
            </label>
            <button type="submit" className="primary">Cadastrar equipamento</button>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
          </form>
        </div>

        <div className="panel">
          <h3>Inventário de equipamentos</h3>
          {loading ? (
            <p>Carregando...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : (
            <ul className="list" style={{ maxHeight: '62vh', overflowY: 'auto' }}>
              {equipamentos.map((equip) => (
                <li key={equip._id} className="list-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <strong>{equip.nome}</strong>
                      <p style={{ margin: '4px 0 2px', lineHeight: '1.4' }}>{equip.tipo} - {equip.marca} {equip.modelo}</p>
                      <small style={{ display: 'block', marginTop: '4px' }}>Série: {equip.numeroSerie} | Local: {equip.localizacao}</small>
                      {equip.observacoes && <small style={{ display: 'block', marginTop: '4px' }}>Obs: {equip.observacoes}</small>}
                    </div>
                    <span
                      style={{
                        backgroundColor: getStatusColor(equip.status),
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}
                    >
                      {equip.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
                    <select
                      value={equip.status}
                      onChange={(event) => updateEquipamentoStatus(equip._id, event.target.value)}
                      style={{
                        flex: '1 1 160px',
                        minWidth: '180px',
                        padding: '10px 12px',
                        borderRadius: '12px',
                        border: '1px solid #d1d5db'
                      }}
                    >
                      <option value="Disponível">Disponível</option>
                      <option value="Emprestado">Emprestado</option>
                      <option value="Manutenção">Manutenção</option>
                      <option value="Inativo">Inativo</option>
                    </select>
                    <button
                      type="button"
                      className="primary"
                      style={{ backgroundColor: '#ef4444', borderColor: '#ef4444', padding: '10px 14px' }}
                      onClick={() => deletarEquipamento(equip._id)}
                    >
                      Excluir
                    </button>
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

export default Equipamentos;