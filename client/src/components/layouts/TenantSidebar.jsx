import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BedDouble, Users, Plug, MessageCircle, Wrench, CreditCard, MessageSquare, ChevronRight, ArrowLeft } from 'lucide-react';

const TenantSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

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
          { title: 'My Room', path: '/tenant/room-view/my-room' }
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

  return (
    <div>
      <style>
        {`
          #menu__toggle {
            opacity: 0;
          }
          #menu__toggle:checked + .menu__btn > span {
            transform: rotate(45deg);
          }
          #menu__toggle:checked + .menu__btn > span::before {
            top: 0;
            transform: rotate(0deg);
          }
          #menu__toggle:checked + .menu__btn > span::after {
            top: 0;
            transform: rotate(90deg);
          }
          #menu__toggle:checked ~ .menu__box {
            left: 0 !important;
          }
          .menu__btn {
            position: fixed;
            top: 20px;
            left: 20px;
            width: 26px;
            height: 26px;
            cursor: pointer;
            z-index: 1;
          }
          .menu__btn > span,
          .menu__btn > span::before,
          .menu__btn > span::after {
            display: block;
            position: absolute;
            width: 100%;
            height: 2px;
            background-color: #616161;
            transition-duration: .25s;
          }
          .menu__btn > span::before {
            content: '';
            top: -8px;
          }
          .menu__btn > span::after {
            content: '';
            top: 8px;
          }
          .menu__box {
            display: block;
            position: fixed;
            top: 0;
            left: -100%;
            width: 300px;
            height: 100%;
            margin: 0;
            padding: 80px 0;
            list-style: none;
            background-color: #ECEFF1;
            box-shadow: 2px 2px 6px rgba(0, 0, 0, .4);
            transition-duration: .25s;
          }
          .menu__item {
            display: block;
            padding: 12px 24px;
            color: #333;
            font-family: 'Roboto', sans-serif;
            font-size: 20px;
            font-weight: 600;
            text-decoration: none;
            transition-duration: .25s;
          }
          .menu__item:hover {
            background-color: #CFD8DC;
          }
        `}
      </style>

      <input type="checkbox" id="menu__toggle" />
      <label className="menu__btn" htmlFor="menu__toggle">
        <span></span>
      </label>

      <div className="menu__box">
        <div className="p-4">
          <h2 className="text-xl font-semibold text-gray-800">Tenant Portal</h2>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-1 p-2">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm ${isActive(item.path) || isSubmenuActive(item.submenu)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                  {item.submenu && (
                    <ChevronRight className={`ml-auto w-4 h-4 ${isSubmenuActive(item.submenu) ? 'transform rotate-90' : ''
                      }`} />
                  )}
                </Link>

                {item.submenu && (isActive(item.path) || isSubmenuActive(item.submenu)) && (
                  <ul className="mt-1 pl-10 space-y-1">
                    {item.submenu.map((subItem, subIndex) => (
                      <li key={subIndex}>
                        <Link
                          to={subItem.path}
                          className={`block py-2 px-4 rounded-lg text-sm ${isActive(subItem.path)
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
    </div>
  );
};

export default TenantSidebar;