import { Link } from "react-router-dom";
import { FiSearch, FiBook, FiUser, FiClock, FiLogOut, FiGrid, FiDollarSign } from "react-icons/fi";
import { FaDollarSign, FaRegBookmark } from "react-icons/fa6";
import "../styles/dashboard.css";

function Dashboard() {
  return (
    <div className="dash-wrap">
      <aside className="dash-sidebar">
        <div className="dash-sidebar-icon active">
          <FiGrid size={20} />
        </div>
        <Link to="/Books">
          <div className="dash-sidebar-icon">
              <FiBook size={20} />
          </div>
        </Link>
        <Link to="/Clientes">
          <div className="dash-sidebar-icon">
            <FiUser size={20} />
          </div>
        </Link>
        <Link to="/Prestamos">
          <div className="dash-sidebar-icon">
            <FaRegBookmark size={20}/>
          </div>
        </Link>
        <Link to="/Multas">
          <div className="dash-sidebar-icon">
            <FaDollarSign size={20} />
          </div>
        </Link>
        <div className="dash-sidebar-icon">
          <FiClock size={20} />
        </div>
        <div className="sidebar-spacer" />
        <div className="dash-sidebar-icon">
          <FiLogOut size={20} />
        </div>
      </aside>

      <div className="dash-main">
        <div className="dash-topbar">
          <div className="dash-search">
            <FiSearch size={16} color="#888" />
              <input type="text" placeholder="Buscar..." />
          </div>
        </div>

        <div className="dash-cards">
          <div className="dash-card">
            <div className="dash-card-header">
              <span>Préstamos</span>
            </div>
            <div className="dash-card-body" />
          </div>

          <div className="dash-card">
            <div className="dash-card-header">
              <span>Multas</span>
            </div>
            <div className="dash-card-body" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;