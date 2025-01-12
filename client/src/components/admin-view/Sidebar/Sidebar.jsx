import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bed, List, Users, Zap, Mail, Settings, CreditCard, FileText, MessageCircle, Bell, Robot } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot } from '@fortawesome/free-solid-svg-icons'; // Import the robot icon

const Sidebar = () => {
  const navigate = useNavigate();

  const menuItems = [
    { title: 'Dashboard', path: '/admin' },
    { icon: <Bed size={20} />, title: 'Room List', path: '/admin/rooms' },
    { icon: <Bed size={20} />, title: 'Manage Rooms', path: '/admin/managerooms' },
    { icon: <Users size={20} />, title: 'Tenants', path: '/admin/users' },
    { icon: <Users size={20} />, title: 'Visitor Management', path: '/admin/visitors' },

    { icon: <Mail size={20} />, title: 'Contact Admin', path: '/admin/contacts' },
    { icon: <Settings size={20} />, title: 'Maintenance Request', path: '/admin/maintenance' },
    { icon: <CreditCard size={20} />, title: 'Payment Options', path: '/admin/payments' },

    { icon: <Bell size={20} />, title: 'Manage Announcements', path: '/admin/announcements' },
    { icon: <FontAwesomeIcon icon={faRobot} size="lg" />, title: 'Prompts', path: '/admin/prompts' } // Use Font Awesome robot icon
  ];

  const ChatBot = () => {
    return (
      <div className="mt-4 bg-gray-700 p-4 rounded-lg">
        <div className="flex items-center mb-2">
          <MessageCircle size={24} className="mr-2" />
          <h3 className="font-bold">DormBot</h3>
        </div>
        <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 text-sm"
          onClick={() => navigate("/admin/chatbot")}
        >
          Chat with DormBot
        </button>
      </div>
    );
  };

  return (
    <aside className="bg-gray-800 text-white w-64 min-h-screen p-4 flex flex-col">
      <nav className="flex-grow">
        <ul>
          {menuItems.map((item, index) => (
            <li key={index} className="mb-2">
              <button
                onClick={() => navigate(item.path)}
                className="flex items-center w-full p-2 rounded hover:bg-gray-700"
              >
                {item.icon}
                <span className="ml-2">{item.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <ChatBot />
    </aside>
  );
};

export default Sidebar;