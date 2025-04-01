import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BedDouble, Users, Plug, MessageCircle, Wrench, CreditCard, MessageSquare, ChevronRight, ArrowLeft, Menu, X } from 'lucide-react';

const TenantSidebar = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Define separate sidebar configurations for each module
  const menuConfigs = {
    default: [
      { title: 'Dashboard', path: '/tenant', icon: <Home className="w-5 h-5" /> },
      {
        title: 'Contact Admin', path: '/tenant/contact-admin', icon: <MessageCircle className="w-5 h-5" />,
        submenu: [
          { title: 'Inbox', path: '/tenant/contact-admin/inbox' }
        ]
      },
      {
        title: 'Maintenance', path: '/tenant/maintenance-request', icon: <Wrench className="w-5 h-5" />,
        submenu: [
          { title: 'Maintenance Logs', path: '/tenant/maintenance-request/maintenance-logs' }
        ]
      },
      {
        title: 'Payment Options', path: '/tenant/payment-options', icon: <CreditCard className="w-5 h-5" />,
        submenu: [
          { title: 'Payment Logs', path: '/tenant/payment-options/payment-logs' }
        ]
      },
      { title: 'Chatbot', path: '/tenant/chatbot', icon: <MessageSquare className="w-5 h-5" /> }
    ],
    rooms: [
      {
        title: 'Rooms', path: '/tenant/room-list', icon: <BedDouble className="w-5 h-5" />,
        submenu: [
          { title: 'Room List', path: '/tenant/room-list' },

        ]
      }
    ],
    visitors: [
      {
        title: 'Visitor Management', path: '/tenant/visitor-management', icon: <Users className="w-5 h-5" />,
        submenu: [
          { title: 'Visitor Form', path: '/tenant/visitor-management' },
          { title: 'Visitor Logs', path: '/tenant/visitor-management/visitor-logs' }
        ]
      }
    ],
    utilities: [
      {
        title: 'Utilities', path: '/tenant/utilities', icon: <Plug className="w-5 h-5" />,
        submenu: [
          { title: 'Usage & Bills', path: '/tenant/utilities' },
          { title: 'Utilities Logs', path: '/tenant/utilities/utilities-logs' }
        ]
      }
    ],
    records: [
      {
        title: 'Records', path: '/tenant/records', icon: <Home className="w-5 h-5" />,
        submenu: [
          { title: 'Visitor Log', path: '/tenant/records/visitor-log' },
          { title: 'Payment Logs', path: '/tenant/records/payment-logs' },
          { title: 'Maintenance Logs', path: '/tenant/records/maintenance-logs' },
          { title: 'Room Logs', path: '/tenant/records/room-logs' }
        ]
      }
    ]
  };

  // Determine which menu configuration to show based on the current path
  const getMenuItems = () => {
    if (location.pathname.startsWith('/tenant/room-list')) return menuConfigs.rooms;
    if (location.pathname.startsWith('/tenant/visitor-management')) return menuConfigs.visitors;
    if (location.pathname.startsWith('/tenant/utilities')) return menuConfigs.utilities;
    if (location.pathname.startsWith('/tenant/contact-admin')) return menuConfigs.default.filter(item => item.title === 'Contact Admin');
    if (location.pathname.startsWith('/tenant/maintenance-request')) return menuConfigs.default.filter(item => item.title === 'Maintenance');
    if (location.pathname.startsWith('/tenant/payment-options')) return menuConfigs.default.filter(item => item.title === 'Payment Options');
    if (location.pathname.startsWith('/tenant/records')) return menuConfigs.records;
    return menuConfigs.default;
  };

  const menuItems = getMenuItems();

  const isActive = (path) => location.pathname === path;
  const isSubmenuActive = (submenu) => submenu?.some(item => location.pathname === item.path);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar for larger screens */}
      <div className={`bg-white border-r border-gray-200 w-64 flex-shrink-0 transition-all duration-300 ease-in-out hidden md:flex md:flex-col`}>
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Tenant Portal</h2>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-1 p-2">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm ${
                    isActive(item.path) || isSubmenuActive(item.submenu)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                  {item.submenu && (
                    <ChevronRight className={`ml-auto w-4 h-4 ${
                      isSubmenuActive(item.submenu) ? 'transform rotate-90' : ''
                    }`} />
                  )}
                </Link>

                {item.submenu && (isActive(item.path) || isSubmenuActive(item.submenu)) && (
                  <ul className="mt-1 pl-10 space-y-1">
                    {item.submenu.map((subItem, subIndex) => (
                      <li key={subIndex}>
                        <Link
                          to={subItem.path}
                          className={`block py-2 px-4 rounded-lg text-sm ${
                            isActive(subItem.path)
                              ? 'text-blue-700 bg-blue-50'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {subItem.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={() => navigate('/tenant')}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Menu
          </button>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 bg-gray-600 bg-opacity-50 z-20 md:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
           onClick={toggleSidebar}></div>

      <div className={`fixed inset-y-0 left-0 w-64 bg-white z-30 transform transition-transform duration-300 ease-in-out md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Tenant Portal</h2>
          <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-1 p-2">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm ${
                    isActive(item.path) || isSubmenuActive(item.submenu)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                  {item.submenu && (
                    <ChevronRight className={`ml-auto w-4 h-4 ${
                      isSubmenuActive(item.submenu) ? 'transform rotate-90' : ''
                    }`} />
                  )}
                </Link>

                {item.submenu && (isActive(item.path) || isSubmenuActive(item.submenu)) && (
                  <ul className="mt-1 pl-10 space-y-1">
                    {item.submenu.map((subItem, subIndex) => (
                      <li key={subIndex}>
                        <Link
                          to={subItem.path}
                          className={`block py-2 px-4 rounded-lg text-sm ${
                            isActive(subItem.path)
                              ? 'text-blue-700 bg-blue-50'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {subItem.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={() => {
              navigate('/tenant');
              setSidebarOpen(false);
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Menu
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {/* Mobile header with menu button */}
        <div className="bg-white p-4 border-b md:hidden flex items-center">
          <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700 mr-4">
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">Tenant Portal</h2>
        </div>

        {/* Page content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default TenantSidebar;