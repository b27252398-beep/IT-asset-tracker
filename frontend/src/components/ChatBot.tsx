import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import all API modules
import { fetchAssets } from '../api/assetApi';
import { fetchEmployees } from '../api/employeeApi';
import { fetchSoftware } from '../api/softwareApi';
import { fetchVendors } from '../api/vendorApi';
import { fetchConsumables } from '../api/consumableApi';
import { fetchIssues } from '../api/issueApi';
import { fetchPurchaseOrders } from '../api/purchaseOrderApi';
import { fetchAuditLogs } from '../api/auditLogApi';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "Hello! I am your Omniscient IT Assistant. I have live access to EVERY module in the system. Ask me about employees, vendors, software, helpdesk tickets, purchase orders, or assets!",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isTyping]);

  const generateBotResponse = async (userInput: string): Promise<string> => {
    const input = userInput.toLowerCase();
    
    // --- 1. Small Talk & Capabilities ---
    if (input.match(/^(hi|hello|hey|greetings|sup)\b/i)) {
      return "Hello! I'm ready to help. Try asking me something like 'How many laptops do we have?' or 'Are there any open tickets?'";
    }
    if (input.match(/how are you/i)) {
      return "I'm running at peak efficiency! All systems are nominal. How can I assist you today?";
    }
    if (input.match(/who are you|what are you/i)) {
      return "I am the Smart IT Assistant built for this Final Year Project. I monitor all 8 modules of this IT Asset Management System in real-time!";
    }
    if (input.match(/what can you do|help/i)) {
      return "I can fetch live data from any module! Ask me to count employees, check vendor status, find open helpdesk tickets, or count specific hardware like laptops and monitors.";
    }

    try {
      // --- 2. Live Data Extraction (The "Brain") ---

      // 2a. Employees Module
      if (input.match(/employee|staff|user|worker/i)) {
        const employees = await fetchEmployees();
        const active = employees.filter((e: any) => e.status !== 'INACTIVE').length;
        return `We currently have ${employees.length} employees registered in the system (${active} active).`;
      }

      // 2b. Vendors Module
      if (input.match(/vendor|supplier|distributor/i)) {
        const vendors = await fetchVendors();
        const active = vendors.filter((v: any) => v.status === 'ACTIVE').length;
        return `You have ${vendors.length} vendors in the database. ${active} of them are currently active and ready for procurement.`;
      }

      // 2c. Software Module
      if (input.match(/software|license|app|program/i)) {
        const software = await fetchSoftware();
        return `We are currently managing ${software.length} software licenses across the organization.`;
      }

      // 2d. Consumables Module
      if (input.match(/consumable|ink|paper|stock|supply/i)) {
        const consumables = await fetchConsumables();
        const lowStock = consumables.filter((c: any) => c.quantity <= c.minStockLevel).length;
        if (lowStock > 0) {
          return `There are ${consumables.length} consumable types tracked. ⚠️ WARNING: ${lowStock} items are currently at or below their minimum stock level!`;
        }
        return `We have ${consumables.length} consumable items in stock, and all inventory levels look healthy.`;
      }

      // 2e. Helpdesk / Issues Module
      if (input.match(/ticket|issue|helpdesk|broken|fix|problem/i)) {
        const issues = await fetchIssues();
        const open = issues.filter((i: any) => i.status === 'OPEN').length;
        const inProgress = issues.filter((i: any) => i.status === 'IN_PROGRESS').length;
        const resolved = issues.filter((i: any) => i.status === 'RESOLVED').length;
        return `Here is the Helpdesk breakdown:\n- ${open} Open tickets waiting for action.\n- ${inProgress} tickets In Progress.\n- ${resolved} tickets successfully Resolved.`;
      }

      // 2f. Purchase Orders Module
      if (input.match(/purchase|order|po/i)) {
        const pos = await fetchPurchaseOrders();
        const pending = pos.filter((p: any) => p.status === 'PENDING').length;
        const approved = pos.filter((p: any) => p.status === 'APPROVED').length;
        return `You have ${pos.length} Purchase Orders in the system. ${pending} are Pending approval, and ${approved} have been Approved.`;
      }

      // 2g. Audit Logs Module
      if (input.match(/log|audit|history|activity/i)) {
        const logs = await fetchAuditLogs();
        return `The system has recorded ${logs.length} total audit events. Every action is being safely logged for compliance.`;
      }

      // 2h. Assets Module (Comprehensive Parsing)
      if (input.match(/asset|hardware|laptop|desktop|monitor|computer|phone|tablet/i)) {
        const allAssets = await fetchAssets();
        
        // Specific Hardware queries
        if (input.match(/laptop/i)) {
          const laptops = allAssets.filter((a: any) => a.category === 'LAPTOP');
          const available = laptops.filter((a: any) => a.status === 'AVAILABLE').length;
          const assigned = laptops.filter((a: any) => a.status === 'ASSIGNED').length;
          return `You have ${laptops.length} total laptops. ${available} are currently available, and ${assigned} are deployed to staff.`;
        }
        if (input.match(/desktop|monitor/i)) {
          const desktops = allAssets.filter((a: any) => ['DESKTOP', 'MONITOR'].includes(a.category));
          const available = desktops.filter((a: any) => a.status === 'AVAILABLE').length;
          return `You currently have ${desktops.length} desktop/monitor units. ${available} of them are available.`;
        }
        if (input.match(/phone|mobile|tablet/i)) {
          const mobile = allAssets.filter((a: any) => ['MOBILE', 'TABLET'].includes(a.category));
          return `You currently have ${mobile.length} mobile devices/tablets registered.`;
        }
        
        // Asset Status queries
        if (input.match(/repair/i)) {
          const inRepair = allAssets.filter((a: any) => a.status === 'IN_REPAIR');
          return `There are ${inRepair.length} assets currently sitting in the repair queue.`;
        }
        if (input.match(/available|free|ready/i)) {
          const available = allAssets.filter((a: any) => a.status === 'AVAILABLE');
          return `We have exactly ${available.length} available hardware assets ready to be checked out.`;
        }
        
        // General Asset Query
        const total = allAssets.length;
        const totalAvailable = allAssets.filter((a: any) => a.status === 'AVAILABLE').length;
        return `We are tracking ${total} total hardware assets. ${totalAvailable} of them are available in storage right now.`;
      }

    } catch (error) {
      return "I tried to check the live database for that, but I couldn't connect. Please make sure your Node.js backend is running!";
    }

    // --- 3. Static Navigation & Actions ---
    if (input.match(/go to|navigate to|open/i)) {
      if (input.match(/asset/i)) {
        setTimeout(() => navigate('/assets'), 1500);
        return "Taking you to the Assets dashboard...";
      }
      if (input.match(/issue|ticket|helpdesk/i)) {
        setTimeout(() => navigate('/issues'), 1500);
        return "Taking you to the Helpdesk...";
      }
      if (input.match(/employee|staff/i)) {
        setTimeout(() => navigate('/employees'), 1500);
        return "Taking you to the Employees page...";
      }
    }
    
    if (input.match(/checkout|assign|give/i)) {
      return "To assign an asset, go to the Assets page, click the 3-dot menu on an Available item, and select 'Check Out'.";
    }
    if (input.match(/thank/i)) {
      return "You're welcome! Let me know if you need anything else.";
    }
    
    // --- 4. Ultimate Fallback ---
    return "I couldn't quite understand that. Try asking me a direct question like: 'How many laptops do we have?' or 'Are there any open tickets?'";
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Simulate real-time API processing delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const responseText = await generateBotResponse(newUserMsg.text);
      
      const newBotMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newBotMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden"
            style={{ height: '500px', maxHeight: '80vh' }}
          >
            {/* Header */}
            <div className="bg-indigo-600 dark:bg-indigo-900 p-4 flex justify-between items-center text-white">
              <div className="flex items-center space-x-2">
                <div className="bg-white/20 p-1.5 rounded-lg">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Omniscient IT Assistant</h3>
                  <p className="text-[10px] text-indigo-100 opacity-80">Online • Fully Trained</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-indigo-100 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${msg.sender === 'user' ? 'bg-slate-200 dark:bg-slate-700 ml-2' : 'bg-indigo-100 dark:bg-indigo-900 mr-2'}`}>
                      {msg.sender === 'user' ? <User className="w-4 h-4 text-slate-500 dark:text-slate-400" /> : <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm shadow-sm whitespace-pre-wrap ${
                      msg.sender === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-sm' 
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex flex-row">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-900 mr-2">
                      <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="p-3 rounded-2xl text-sm shadow-sm bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-tl-sm flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-full px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="p-2 rounded-full bg-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-lg transition-transform hover:scale-105 cursor-pointer ${isOpen ? 'bg-slate-800 text-white' : 'bg-indigo-600 text-white'}`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
}
