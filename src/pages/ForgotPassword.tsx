import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Layout from '../components/Layout';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      await resetPassword(email);
      setMessage('Revisa tu correo para el enlace de restablecimiento');
    } catch (error: any) {
      setError(error.message || 'Error al restablecer contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout hideNavbar>
      <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-black to-gray-900"></div>
        
        {/* Animated mesh gradient overlay */}
        <div className="fixed inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-md w-full">
          {/* Logo Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/5 px-5 py-2.5 border border-white/10 backdrop-blur-xl">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500 blur-md opacity-75"></div>
                <div className="relative h-2 w-2 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500"></div>
              </div>
              <span className="text-sm font-bold uppercase tracking-[0.3em] bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Anypost
              </span>
            </div>
          </div>

          {/* Forgot Password Card */}
          <div className="relative group">
            {/* Glow effect on hover */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700"></div>
            
            {/* Card */}
            <div className="relative bg-gradient-to-br from-gray-900/50 via-gray-800/40 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-10 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_40px_rgba(0,0,0,0.12)]">
              {/* Shimmer effect */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              </div>

              {/* Header */}
              <div className="relative text-center mb-8">
                {/* Icon */}
                <div className="relative inline-flex mb-6">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 blur-lg opacity-75"></div>
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-4xl font-bold mb-3">
                  <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                    Restablece tu contraseña
                  </span>
                </h2>
                
                <p className="text-gray-400 text-sm leading-relaxed">
                  Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                </p>
              </div>

              {/* Form */}
              <form className="relative space-y-6" onSubmit={handleSubmit}>
                {/* Error Message */}
                {error && (
                  <div className="relative rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 backdrop-blur-xl">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-400">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {message && (
                  <div className="relative rounded-xl bg-green-500/10 border border-green-500/30 px-4 py-3 backdrop-blur-xl">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-400">{message}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Email Input */}
                <div>
                  <Input
                    label="Correo electrónico"
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ingresa tu correo"
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    }
                  />
                </div>

                {/* Info Box */}
                <div className="rounded-xl bg-white/5 border border-white/10 p-4 backdrop-blur-xl">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Recibirás un correo con instrucciones para crear una nueva contraseña. El enlace será válido por 1 hora.
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg shadow-black/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Enviando enlace...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Enviar enlace de restablecimiento
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative px-4 bg-gray-900/50 backdrop-blur-xl">
                    <span className="text-xs uppercase tracking-[0.2em] text-white/30">O</span>
                  </div>
                </div>

                {/* Back to Login Link */}
                <div className="text-center">
                  <Link
                    to="/login"
                    className="group inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hover:from-purple-300 hover:to-pink-300 transition-all"
                  >
                    <svg className="w-4 h-4 text-purple-400 group-hover:text-purple-300 group-hover:-translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver al inicio de sesión
                  </Link>
                </div>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-xs text-white/20 font-medium">
              Anypost © 2024 · Tu plataforma de creación de contenido
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
