function Home() {
  return (
    <div>
      <h2>Bem-vindo ao Sistema de Suporte TI</h2>
      <p>Gerencie equipamentos, chamados e empréstimos de Tecnologia da informação.</p>
      <div className="info-grid">
        <article className="panel">
          <h3>Usuários</h3>
          <p>Cadastre e gerencie usuários do sistema de TI.</p>
        </article>
        <article className="panel">
          <h3>Tarefas</h3>
          <p>Atribua e acompanhe tarefas de manutenção e suporte.</p>
        </article>
        <article className="panel">
          <h3>Equipamentos</h3>
          <p>Controle o inventário de notebooks, desktops, periféricos e rede.</p>
        </article>
        <article className="panel">
          <h3>Empréstimos</h3>
          <p>Gerencie empréstimos temporários de equipamentos.</p>
        </article>
        <article className="panel">
          <h3>Chamados</h3>
          <p>Abra e resolva chamados de suporte técnico.</p>
        </article>
        <article className="panel">
          <h3>API Backend</h3>
          <p>Servidor rodando em <strong>http://localhost:8080</strong> com MongoDB.</p>
        </article>
      </div>
    </div>
  );
}

export default Home;
