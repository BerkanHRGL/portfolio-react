export default function Navbar({ onNav }) {
  const items = [
    { key: 'projects', icon: 'imgs/projects.png', label: 'PROJECTS' },
    { key: 'learning-outcomes', icon: 'imgs/learning_outcomes.png', label: 'LEARNING OUTCOMES' },
    { key: 'about-me', icon: 'imgs/profile_icon.png', label: 'ABOUT ME' },
    { key: 'contact', icon: 'imgs/contact.png', label: 'CONTACT' },
  ];

  return (
    <div className="bottom-navbar">
      <div className="navbar-container">
        {items.map(item => (
          <div
            key={item.key}
            className="navbar-icon"
            onClick={() => onNav(item.key)}
            style={item.key === 'learning-outcomes' ? { display: 'none' } : undefined}
          >
            <img src={item.icon} alt={item.label} />
            <div className="navbar-label">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
