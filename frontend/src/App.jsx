import { NavLink, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Users from './pages/Users';
import Tasks from './pages/Tasks';
import Equipamentos from './pages/Equipamentos';
import Emprestimos from './pages/Emprestimos';
import Chamados from './pages/Chamados';

function App() {
  return (
    <div className="app-shell">
      <header className="header">
        <div>
          <p className="eyebrow">Suporte TI</p>
          <h1>Painel de Atendimento</h1>
          <p className="subtitle">Gerencie usuários, tarefas, equipamentos, empréstimos e chamados.</p>
        </div>
        <nav className="tabs">
          <NavLink to="/" end className={({ isActive }) => `tab-button ${isActive ? 'active' : ''}`}>
            Home
          </NavLink>
          <NavLink to="/users" className={({ isActive }) => `tab-button ${isActive ? 'active' : ''}`}>
            Usuários
          </NavLink>
          <NavLink to="/tasks" className={({ isActive }) => `tab-button ${isActive ? 'active' : ''}`}>
            Tarefas
          </NavLink>
          <NavLink to="/equipamentos" className={({ isActive }) => `tab-button ${isActive ? 'active' : ''}`}>
            Equipamentos
          </NavLink>
          <NavLink to="/emprestimos" className={({ isActive }) => `tab-button ${isActive ? 'active' : ''}`}>
            Empréstimos
          </NavLink>
          <NavLink to="/chamados" className={({ isActive }) => `tab-button ${isActive ? 'active' : ''}`}>
            Chamados
          </NavLink>
        </nav>
      </header>

      <main className="card">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/users" element={<Users />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/equipamentos" element={<Equipamentos />} />
          <Route path="/emprestimos" element={<Emprestimos />} />
          <Route path="/chamados" element={<Chamados />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
