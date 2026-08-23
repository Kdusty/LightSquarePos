export default function NavItem({ icon, label, id, active, onClick, badge, collapsed }) {
  return (
    <button className={`nav-item${active === id ? " active" : ""}`} onClick={() => onClick(id)}>
      <span className="nav-icon-wrap">{icon}</span>
      <span className="nav-label">{label}</span>
      {badge > 0 && <span className="nav-badge">{badge}</span>}
      {collapsed && <span className="nav-tooltip">{label}</span>}
    </button>
  );
}
