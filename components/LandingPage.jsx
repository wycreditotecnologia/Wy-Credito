import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Users, Shield, Zap, FileText, MessageSquare, Clock } from 'lucide-react';
import CreditSimulator from './CreditSimulator';
import ChatInterface from './ChatInterface';

const LandingPage = () => {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' o 'chat'
  const [creditData, setCreditData] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    companyAddress: '',
    email: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para procesar el formulario
    console.log('Form submitted:', formData);
  };

  const handleCreditRequest = (creditInfo) => {
    setCreditData(creditInfo);
    setCurrentView('chat');
  };

  const handleCloseChat = () => {
    setCurrentView('landing');
    setCreditData(null);
  };

  // Si estamos en vista de chat, mostrar solo el ChatInterface
  if (currentView === 'chat') {
    return <ChatInterface creditData={creditData} onClose={handleCloseChat} userName="Usuario" />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-wy-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-wy-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="text-xl font-heading font-bold text-wy-dark">Wy Crédito</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#beneficios" className="text-wy-moderate hover:text-wy-dark font-body">Características</a>
            <a href="#como-funciona" className="text-wy-moderate hover:text-wy-dark font-body">Cómo Funciona</a>
            <a href="#testimonios" className="text-wy-moderate hover:text-wy-dark font-body">Testimonios</a>
            <a href="#faq" className="text-wy-moderate hover:text-wy-dark font-body">FAQ</a>
          </nav>
          <button className="bg-wy-primary text-white px-4 py-2 rounded-lg hover:bg-wy-dark transition-colors font-body">
            Comenzar Ahora
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-wy-light to-wy-white py-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-2 mb-6">
              <CheckCircle className="w-5 h-5 text-wy-primary" />
              <span className="text-wy-primary font-body font-medium">Verificación de Crédito Embebida</span>
            </div>
            
            <h1 className="text-h1 font-heading text-wy-dark mb-6 leading-tight">
              Verificación Crediticia <span className="text-wy-primary">Instantánea</span> con IA
            </h1>
            
            <p className="text-body font-body text-wy-black mb-8 leading-relaxed">
              Wy Crédito revoluciona la evaluación crediticia con Wally, nuestro asistente de inteligencia artificial avanzada. 
              Obtén resultados precisos en segundos, no en días.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center space-x-2 bg-wy-primary bg-opacity-10 px-4 py-2 rounded-full">
                <Shield className="w-4 h-4 text-wy-primary" />
                <span className="text-wy-primary font-body font-medium">Análisis Crediticio</span>
              </div>
              <div className="flex items-center space-x-2 bg-wy-secondary bg-opacity-10 px-4 py-2 rounded-full">
                <Users className="w-4 h-4 text-wy-secondary" />
                <span className="text-wy-secondary font-body font-medium">Verificación de Empresas</span>
              </div>
              <div className="flex items-center space-x-2 bg-wy-moderate bg-opacity-10 px-4 py-2 rounded-full">
                <Zap className="w-4 h-4 text-wy-moderate" />
                <span className="text-wy-moderate font-body font-medium">Verificación en Tiempo Real</span>
              </div>
              <div className="flex items-center space-x-2 bg-wy-dark bg-opacity-10 px-4 py-2 rounded-full">
                <Clock className="w-4 h-4 text-wy-dark" />
                <span className="text-wy-dark font-body font-medium">Respuesta en Segundos</span>
              </div>
            </div>

            <p className="text-label font-body text-wy-moderate mb-8">
              Se integra perfectamente con
            </p>

            {/* Integration Logos */}
            <div className="grid grid-cols-3 md:grid-cols-5 gap-8 items-center opacity-60">
              <div className="flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400" />
                <span className="ml-2 text-gray-400 font-medium">DocuSign</span>
              </div>
              <div className="flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-gray-400" />
                <span className="ml-2 text-gray-400 font-medium">PandaDoc</span>
              </div>
              <div className="flex items-center justify-center">
                <Users className="w-8 h-8 text-gray-400" />
                <span className="ml-2 text-gray-400 font-medium">HubSpot</span>
              </div>
              <div className="flex items-center justify-center">
                <Shield className="w-8 h-8 text-gray-400" />
                <span className="ml-2 text-gray-400 font-medium">Salesforce</span>
              </div>
              <div className="flex items-center justify-center">
                <Zap className="w-8 h-8 text-gray-400" />
                <span className="ml-2 text-gray-400 font-medium">Zapier</span>
              </div>
            </div>
          </motion.div>

          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-wy-white rounded-2xl shadow-xl p-8 border border-wy-light"
          >
            <h3 className="text-h3 font-heading text-wy-dark mb-2">
              Ejecutar una Verificación de Crédito en una Empresa
            </h3>
            <p className="text-body font-body text-wy-moderate mb-6">Verifique en segundos con más de 50 fuentes</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-label font-body text-wy-dark mb-2">
                  Nombre de la Entidad Legal*
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Wy Crédito S.A.S."
                  className="w-full px-4 py-3 border border-wy-moderate rounded-lg focus:ring-2 focus:ring-wy-primary focus:border-transparent outline-none transition-all font-body"
                  required
                />
              </div>

              <div>
                <label className="block text-label font-body text-wy-dark mb-2">
                  Dirección de la Entidad Legal*
                </label>
                <input
                  type="text"
                  name="companyAddress"
                  value={formData.companyAddress}
                  onChange={handleInputChange}
                  placeholder="Calle 100 #19-61, Bogotá, Colombia"
                  className="w-full px-4 py-3 border border-wy-moderate rounded-lg focus:ring-2 focus:ring-wy-primary focus:border-transparent outline-none transition-all font-body"
                  required
                />
              </div>

              <div>
                <label className="block text-label font-body text-wy-dark mb-2">
                  Email Empresarial*
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="contacto@wycredito.com"
                  className="w-full px-4 py-3 border border-wy-moderate rounded-lg focus:ring-2 focus:ring-wy-primary focus:border-transparent outline-none transition-all font-body"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-wy-primary text-wy-white py-3 px-6 rounded-lg font-body font-medium hover:bg-wy-secondary transition-colors flex items-center justify-center space-x-2"
              >
                <span>Generar Reporte</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-16 px-6 bg-wy-light">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-h2 font-heading text-wy-dark mb-4">
              Integraciones Disponibles
            </h2>
            <p className="text-body font-body text-wy-moderate mb-12">
              Conecte Wally con sus herramientas favoritas
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {[
              {
                icon: FileText,
                title: "1. Integración",
                description: "Integre Wally, el asistente de IA de Wy Crédito, en sus contratos con una simple línea de código"
              },
              {
                icon: Users,
                title: "2. Verificación",
                description: "Wally analiza automáticamente los datos de la empresa en tiempo real usando Wy Crédito"
              },
              {
                icon: CheckCircle,
                title: "3. Resultados",
                description: "Reciba un reporte completo de riesgo crediticio de Wy Crédito en segundos"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-wy-white p-6 rounded-xl shadow-lg text-center"
              >
                <div className="w-12 h-12 bg-wy-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-6 h-6 text-wy-primary" />
                </div>
                <h3 className="text-h3 font-heading text-wy-dark mb-2">{step.title}</h3>
                <p className="text-body font-body text-wy-moderate">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="como-funciona" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-h2 font-heading font-bold text-wy-very-dark-blue mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Cómo funciona Wally
            </motion.h2>
            <motion.p 
              className="text-body font-body text-wy-dark-moderate-cyan max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Wally, el asistente de IA de Wy Crédito, hace que la verificación crediticia sea simple, rápida y completamente automatizada
            </motion.p>
          </div>

          <div className="space-y-16">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-start space-x-6"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">1</span>
                </div>
              </div>
              <div>
                <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
                  PASO 1
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Evento de Contrato Detectado
                </h3>
                <p className="text-gray-600 mb-4">
                  <strong>Se abre, firma o edita un contrato.</strong>
                </p>
                <p className="text-gray-600">
                  Wally.ai escanea eventos de webhook desde plataformas como PandaDoc o DocuSign. 
                  En el momento en que se abre un documento o se solicita una firma, el proceso de 
                  verificación se inicia instantáneamente — no se necesita acción manual.
                </p>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-start space-x-6"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">2</span>
                </div>
              </div>
              <div>
                <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
                  PASO 2
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Comienza la Búsqueda de la Empresa
                </h3>
                <p className="text-gray-600 mb-4">
                  <strong>Se extraen el nombre y la dirección.</strong>
                </p>
                <p className="text-gray-600">
                  Extraemos el nombre y la dirección de la empresa directamente del documento o campos personalizados. 
                  Esto activa una búsqueda KYB (Conozca su Empresa) a través de nuestros datos de identidad 
                  propietarios que incluyen identificadores de entidades, estado de registro y datos de propiedad.
                </p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-start space-x-6"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">3</span>
                </div>
              </div>
              <div>
                <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
                  PASO 3
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Análisis de Riesgo en Tiempo Real
                </h3>
                <p className="text-gray-600 mb-4">
                  <strong>Se escanean más de 50 señales de datos.</strong>
                </p>
                <p className="text-gray-600">
                  Nuestro motor escanea referencias en múltiples bases de datos de fraude como listas de sanciones, 
                  licencias, sanciones, historial de deuda y mucho más. Cada señal se pondera según 
                  nuestros algoritmos propietarios para generar una puntuación de riesgo integral.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonios" className="py-20 px-6 bg-wy-light">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-h2 font-heading text-wy-dark mb-4">
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-body font-body text-wy-moderate">
              Empresas de todos los tamaños confían en Wally
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-wy-white p-8 rounded-xl shadow-lg"
            >
              <div className="flex text-wy-secondary mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star}>★</span>
                ))}
              </div>
              <p className="text-body font-body text-wy-moderate mb-6 italic">
                "La integración con PandaDoc es perfecta, las verificaciones de antecedentes se ejecutan automáticamente."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-wy-primary bg-opacity-10 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-heading font-bold text-wy-dark">Carlos Mendoza</h4>
                  <p className="text-label font-body text-wy-moderate">Director Financiero</p>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-wy-white p-8 rounded-xl shadow-lg"
            >
              <div className="flex text-wy-secondary mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star}>★</span>
                ))}
              </div>
              <p className="text-body font-body text-wy-moderate mb-6 italic">
                "Las verificaciones manuales tomaban días, ahora la incorporación es instantánea y completamente confiable."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-wy-primary bg-opacity-10 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-heading font-bold text-wy-dark">Ana Rodríguez</h4>
                  <p className="text-label font-body text-wy-moderate">Jefe de Operaciones</p>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-wy-white p-8 rounded-xl shadow-lg"
            >
              <div className="flex text-wy-secondary mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star}>★</span>
                ))}
              </div>
              <p className="text-body font-body text-wy-moderate mb-6 italic">
                "Wally.ai detectó un proveedor estafador de $30K, nos salvó durante la incorporación instantáneamente."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-wy-primary bg-opacity-10 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-heading font-bold text-wy-dark">David Kim</h4>
                  <p className="text-label font-body text-wy-moderate">Gerente de Cumplimiento</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Credit Simulator Section */}
      <CreditSimulator onRequestCredit={handleCreditRequest} />

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-6 bg-wy-light">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-h2 font-heading text-wy-dark mb-4">
              Preguntas Frecuentes
            </h2>
            <p className="text-body font-body text-wy-moderate">
              Todo lo que necesita saber sobre Wally
            </p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                question: "¿Cómo se integra Wally.ai con mi plataforma de contratos?",
                answer: "Wally.ai se integra perfectamente con las principales plataformas de contratos como DocuSign, PandaDoc y más a través de webhooks y APIs."
              },
              {
                question: "¿Cuánto tiempo toma una verificación KYB típica?",
                answer: "Las verificaciones se completan en segundos, proporcionando resultados en tiempo real durante el proceso de firma del contrato."
              },
              {
                question: "¿Qué información se requiere para ejecutar una verificación KYB?",
                answer: "Solo necesitamos el nombre legal de la empresa y su dirección registrada para comenzar el proceso de verificación."
              },
              {
                question: "¿Wally.ai soporta empresas internacionales?",
                answer: "Sí, nuestra plataforma tiene cobertura global y puede verificar empresas en múltiples jurisdicciones."
              },
              {
                question: "¿Qué tan segura está mi data con Wally.ai?",
                answer: "Utilizamos encriptación de nivel empresarial y cumplimos con los más altos estándares de seguridad y privacidad de datos."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-wy-white border border-wy-light rounded-lg p-6 hover:shadow-sm transition-shadow"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-h3 font-heading text-wy-dark">{faq.question}</h3>
                  <span className="text-wy-primary text-xl">+</span>
                </div>
                <p className="text-body font-body text-wy-moderate mt-4">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-wy-dark text-wy-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-wy-primary rounded-lg flex items-center justify-center">
                  <span className="text-wy-white font-heading font-bold text-sm">W</span>
                </div>
                <span className="text-h3 font-heading">Wy Crédito</span>
              </div>
              <p className="text-wy-moderate font-body mb-4">
                Soluciones crediticias inteligentes con Wally, nuestro asistente de IA para verificación instantánea y confiable.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-wy-moderate hover:text-wy-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <div className="w-6 h-6 bg-wy-moderate rounded"></div>
                </a>
                <a href="#" className="text-wy-moderate hover:text-wy-white transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <div className="w-6 h-6 bg-wy-moderate rounded"></div>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-heading font-bold mb-4">Producto</h4>
              <ul className="space-y-2 text-wy-moderate font-body">
                <li><a href="#" className="hover:text-wy-white transition-colors">Características</a></li>
                <li><a href="#" className="hover:text-wy-white transition-colors">Integraciones</a></li>
                <li><a href="#" className="hover:text-wy-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-wy-white transition-colors">Documentación</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading font-bold mb-4">Empresa</h4>
              <ul className="space-y-2 text-wy-moderate font-body">
                <li><a href="#" className="hover:text-wy-white transition-colors">Acerca de</a></li>
                <li><a href="#" className="hover:text-wy-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-wy-white transition-colors">Carreras</a></li>
                <li><a href="#" className="hover:text-wy-white transition-colors">Contacto</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading font-bold mb-4">Soporte</h4>
              <ul className="space-y-2 text-wy-moderate font-body">
                <li><a href="#" className="hover:text-wy-white transition-colors">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-wy-white transition-colors">Estado del Servicio</a></li>
                <li><a href="#" className="hover:text-wy-white transition-colors">Seguridad</a></li>
                <li><a href="#" className="hover:text-wy-white transition-colors">Privacidad</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-wy-moderate pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-wy-moderate font-body text-sm">
              © 2024 Wally. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-wy-moderate hover:text-wy-white font-body text-sm transition-colors">
                Términos de Servicio
              </a>
              <a href="#" className="text-wy-moderate hover:text-wy-white font-body text-sm transition-colors">
                Política de Privacidad
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;