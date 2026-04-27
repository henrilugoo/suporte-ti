import React from 'react';

function Dashboard({ stats }) {
  // Estilo para garantir que os números fiquem destacados
  const numberStyle = {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    margin: '5px 0'
  };

  const labelStyle = {
    margin: 0,
    color: '#666',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
      gap: '20px', 
      marginBottom: '30px' 
    }}>
      {/* CARD: TOTAL */}
      <div className="panel" style={{ borderTop: '5px solid #3b82f6', textAlign: 'center' }}>
        <h4 style={labelStyle}>Total Geral</h4>
        <p style={numberStyle}>{stats.totalChamados || 0}</p>
      </div>

      {/* CARD: ABERTO */}
      <div className="panel" style={{ borderTop: '5px solid #ef4444', textAlign: 'center' }}>
        <h4 style={labelStyle}>Em Aberto</h4>
        <p style={{ ...numberStyle, color: '#ef4444' }}>{stats.abertos || 0}</p>
      </div>

      {/* CARD: EM ATENDIMENTO */}
      <div className="panel" style={{ borderTop: '5px solid #f59e0b', textAlign: 'center' }}>
        <h4 style={labelStyle}>Em Atendimento</h4>
        <p style={{ ...numberStyle, color: '#f59e0b' }}>{stats.emAtendimento || 0}</p>
      </div>

      {/* CARD: RESOLVIDO */}
      <div className="panel" style={{ borderTop: '5px solid #10b981', textAlign: 'center' }}>
        <h4 style={labelStyle}>Resolvidos</h4>
        <p style={{ ...numberStyle, color: '#10b981' }}>{stats.resolvidos || 0}</p>
      </div>

      {/* CARD: EQUIPAMENTOS */}
      <div className="panel" style={{ borderTop: '5px solid #6b7280', textAlign: 'center' }}>
        <h4 style={labelStyle}>Equipamentos</h4>
        <p style={numberStyle}>{stats.totalEquipamentos || 0}</p>
      </div>
    </div>
  );
}

export default Dashboard;