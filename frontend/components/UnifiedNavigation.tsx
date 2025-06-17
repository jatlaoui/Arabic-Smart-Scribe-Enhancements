
# نظام التنقل الموحد للمحرك المحسن
import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import EnhancedShahidEngine from './components/EnhancedShahidEngine';
import MultimediaDashboard from './components/MultimediaDashboard';

export const UnifiedNavigation: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/multimedia', label: '🎬 ناسج السرد', icon: '🎭' },
    { path: '/smart-writing', label: '✍️ الكتابة الذكية', icon: '🧠' },
    { path: '/agent-studio', label: '🤖 استوديو الوكلاء', icon: '👥' },
    { path: '/dancing-ui', label: '💃 الواجهة الراقصة', icon: '✨' },
    { path: '/projects', label: '📁 المشاريع', icon: '📚' }
  ];
  
  return (
    <div className="unified-app">
      <nav className="main-navigation">
        <div className="nav-header">
          <h1>🎭 Arabic Smart Scribe Pro</h1>
          <p>المحرك الروائي المتكامل</p>
        </div>
        
        <ul className="nav-menu">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link 
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        
        <div className="nav-footer">
          <div className="system-status">
            ✅ جميع الأنظمة تعمل
          </div>
        </div>
      </nav>
      
      <main className="main-content">
        <Routes>
          <Route path="/multimedia" element={<EnhancedShahidEngine projectId="current" />} />
          <Route path="/smart-writing" element={<div>الكتابة الذكية</div>} />
          <Route path="/agent-studio" element={<div>استوديو الوكلاء</div>} />
          <Route path="/dancing-ui" element={<div>الواجهة الراقصة</div>} />
          <Route path="/projects" element={<div>إدارة المشاريع</div>} />
          <Route path="/" element={<EnhancedShahidEngine projectId="current" />} />
        </Routes>
      </main>
    </div>
  );
};

export default UnifiedNavigation;
