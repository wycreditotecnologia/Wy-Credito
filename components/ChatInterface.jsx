import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  User,
  ChatBubbleEmpty,
  Phone,
  Camera as VideoCamera,
  InfoCircle,
  Attachment,
  Camera,
  Component
} from 'iconoir-react';
import { OrquestadorWally } from '../src/services/orquestador.js';

const ChatInterface = ({ creditData = null, onClose, userName = 'Usuario' }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const messagesEndRef = useRef(null);
  const orquestador = useRef(new OrquestadorWally());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Efecto para inicializar la conversación
  useEffect(() => {
    if (!initialized) {
      const initializeChat = async () => {
        setIsLoading(true);
        try {
          let response;
          
          if (creditData) {
            // Si tenemos creditData del simulador, iniciamos con esos datos
            response = await orquestador.current.iniciarConCreditData(creditData);
          } else {
            // Si no hay creditData, iniciamos con el mensaje genérico
            response = {
              respuesta: "¡Hola! Soy Wally, tu asistente de créditos. ¿En qué puedo ayudarte hoy?",
              datos: {}
            };
          }
          
          const botMessage = {
            id: Date.now(),
            text: response.respuesta,
            sender: 'bot',
            timestamp: new Date(),
            metadata: response.datos
          };

          setMessages([botMessage]);
          setInitialized(true);
        } catch (error) {
          console.error('Error al inicializar chat:', error);
          // Mensaje de fallback en caso de error
          const fallbackMessage = {
            id: Date.now(),
            text: "¡Hola! Soy Wally, tu asistente de créditos. ¿En qué puedo ayudarte hoy?",
            sender: 'bot',
            timestamp: new Date()
          };
          setMessages([fallbackMessage]);
          setInitialized(true);
        } finally {
          setIsLoading(false);
        }
      };

      initializeChat();
    }
  }, [creditData, initialized]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await orquestador.current.procesarMensaje(inputValue);
      
      const botMessage = {
        id: Date.now() + 1,
        text: response.respuesta,
        sender: 'bot',
        timestamp: new Date(),
        metadata: response.datos
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error al procesar mensaje:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Componente para mostrar progreso de solicitud
  const ProgressIndicator = ({ progress, step }) => (
    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-blue-800">Progreso de solicitud</span>
        <span className="text-sm text-blue-600">{progress}%</span>
      </div>
      <div className="w-full bg-blue-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      {step && (
        <p className="text-xs text-blue-700 mt-2">Paso actual: {step}</p>
      )}
    </div>
  );

  // Componente para mostrar resumen de crédito
  const CreditSummaryCard = ({ creditInfo }) => (
    <div className="mt-3 p-4 bg-green-50 rounded-lg border border-green-200">
      <h4 className="text-sm font-semibold text-green-800 mb-2">Resumen de Crédito</h4>
      <div className="space-y-1 text-sm text-green-700">
        {creditInfo.amount && (
          <div className="flex justify-between">
            <span>Monto:</span>
            <span className="font-medium">{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(creditInfo.amount)}</span>
          </div>
        )}
        {creditInfo.monthlyPayment && (
          <div className="flex justify-between">
            <span>Cuota mensual:</span>
            <span className="font-medium">{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(creditInfo.monthlyPayment)}</span>
          </div>
        )}
        {creditInfo.term && (
          <div className="flex justify-between">
            <span>Plazo:</span>
            <span className="font-medium">{creditInfo.term} años</span>
          </div>
        )}
        {creditInfo.interestRate && (
          <div className="flex justify-between">
            <span>Tasa de interés:</span>
            <span className="font-medium">{creditInfo.interestRate}% anual</span>
          </div>
        )}
      </div>
    </div>
  );

  // Componente para mensajes formateados
  const FormattedMessage = ({ message }) => (
    <div>
      <p className="text-sm">{message.text}</p>
      {message.metadata?.progreso && (
        <ProgressIndicator 
          progress={message.metadata.progreso} 
          step={message.metadata.pasoActual} 
        />
      )}
      {message.metadata?.creditInfo && (
        <CreditSummaryCard creditInfo={message.metadata.creditInfo} />
      )}
    </div>
  );

  // Lista de chats simulada
  const chats = [
    { id: 1, name: 'User Name', lastMessage: 'Last message preview...', time: '2m', online: true },
    { id: 2, name: 'Group Name', lastMessage: 'Another message preview...', time: '5m', online: false, isGroup: true }
  ];

  // Lista de contactos simulada
  const contacts = [
    { id: 1, name: 'Contact Name', online: true }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Barra lateral izquierda */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header de la barra lateral */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Wally Assistant</h2>
        </div>

        {/* Sección de Chats */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-3">Chats</h3>
            <div className="space-y-2">
              {chats.map((chat) => (
                <div key={chat.id} className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      chat.isGroup ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {chat.isGroup ? (
                        <Component size={20} className="text-green-600" />
                      ) : (
                        <User size={20} className="text-blue-600" />
                      )}
                    </div>
                    {chat.online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">{chat.name}</p>
                      <span className="text-xs text-gray-500">{chat.time}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sección de Contactos */}
          <div className="p-4 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-600 mb-3">Contacts</h3>
            <div className="space-y-2">
              {contacts.map((contact) => (
                <div key={contact.id} className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="relative">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <User size={20} className="text-purple-600" />
                    </div>
                    {contact.online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Área principal de conversación */}
      <div className="flex-1 flex flex-col">
        {/* Header de la conversación */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User size={20} className="text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">User Name</h3>
              <p className="text-sm text-green-500">Online</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
              <Phone size={20} />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
              <VideoCamera size={20} />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
              <InfoCircle size={20} />
            </button>
          </div>
        </div>

        {/* Área de mensajes */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-2xl mx-auto space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  message.sender === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}>
                  {message.sender === 'bot' ? (
                    <FormattedMessage message={message} />
                  ) : (
                    <p className="text-sm">{message.text}</p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Área de entrada de texto */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <Attachment size={20} />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-500"
                  disabled={isLoading}
                />
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <Camera size={20} />
              </button>
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed p-3 rounded-full text-white transition-colors duration-200"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;