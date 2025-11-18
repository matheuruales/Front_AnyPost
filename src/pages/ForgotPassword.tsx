import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Layout from '../components/Layout';

type Step = 'request' | 'verify' | 'reset' | 'done';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<Step>('request');

  const { requestPasswordReset, verifyResetCode, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'done') {
      window.location.href = '/login';
      return;
    }
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      if (step === 'request') {
        await requestPasswordReset(email);
        setMessage('Enviamos un código de verificación a tu correo.');
        setStep('verify');
      } else if (step === 'verify') {
        await verifyResetCode(email, code);
        setMessage('Código verificado. Ahora coloca tu nueva contraseña.');
        setStep('reset');
      } else if (step === 'reset') {
        if (newPassword.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres.');
        }
        if (newPassword !== confirmPassword) {
          throw new Error('Las contraseñas no coinciden.');
        }
        await resetPassword(email, code, newPassword);
        setMessage('Contraseña actualizada. Ahora puedes iniciar sesión.');
        setStep('done');
      }
    } catch (err: any) {
      setError(err?.message || 'No pudimos completar la acción. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonLabel = () => {
    if (step === 'request') return 'Enviar código';
    if (step === 'verify') return 'Validar código';
    if (step === 'reset') return 'Cambiar contraseña';
    return 'Volver a inicio de sesión';
  };

  const getHelperText = () => {
    if (step === 'request') return 'Ingresa tu correo y te enviaremos un código válido por 15 minutos.';
    if (step === 'verify') return 'Revisa tu bandeja de entrada y coloca el código de 6 dígitos.';
    if (step === 'reset') return 'Define una nueva contraseña segura para tu cuenta.';
    return 'Contraseña cambiada exitosamente.';
  };

  return (
    <Layout hideNavbar>
      <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-black to-gray-900"></div>
        <div className="fixed inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 max-w-md w-full">
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

          <div className="relative group">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700"></div>

            <div className="relative bg-gradient-to-br from-gray-900/50 via-gray-800/40 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-10 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_40px_rgba(0,0,0,0.12)]">
              <div className="absolute inset-0 rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              </div>

              <div className="relative text-center mb-8">
                <div className="relative inline-flex mb-6">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 blur-lg opacity-75"></div>
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                </div>

                <h2 className="text-4xl font-bold mb-3">
                  <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                    Recupera tu acceso
                  </span>
                </h2>
                
                <p className="text-gray-400 text-sm leading-relaxed">
                  {getHelperText()}
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {(message || error) && (
                  <div className={`rounded-xl p-4 border ${message ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'} backdrop-blur-xl`}>
                    <div className="flex items-start gap-3">
                      <svg className={`w-5 h-5 mt-0.5 ${message ? 'text-green-400' : 'text-red-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {message ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        )}
                      </svg>
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-1">{message ? 'Listo' : 'Hubo un problema'}</h4>
                        <p className="text-sm text-gray-300">{message || error}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  <Input
                    label="Correo electrónico"
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    disabled={step !== 'request'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ingresa tu correo"
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    }
                  />

                  {(step === 'verify' || step === 'reset' || step === 'done') && (
                    <Input
                      label="Código de verificación"
                      id="code"
                      name="code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      required
                      disabled={step === 'reset' || step === 'done'}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Ej: 123456"
                      maxLength={6}
                      icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 .552-.448 1-1 1s-1-.448-1-1 .448-1 1-1 1 .448 1 1z M19 11c0 .552-.448 1-1 1s-1-.448-1-1 .448-1 1-1 1 .448 1 1z M5 11c0 .552-.448 1-1 1s-1-.448-1-1 .448-1 1-1 1 .448 1 1z" />
                        </svg>
                      }
                    />
                  )}

                  {(step === 'reset' || step === 'done') && (
                    <>
                      <Input
                        label="Nueva contraseña"
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        disabled={step === 'done'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                      />
                      <Input
                        label="Confirmar contraseña"
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        disabled={step === 'done'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repítela para confirmar"
                      />
                    </>
                  )}
                </div>

                <div className="rounded-xl bg-white/5 border border-white/10 p-4 backdrop-blur-xl">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {step === 'request'
                        ? 'El código llega desde Gmail; revisa spam si no lo ves en 1-2 minutos.'
                        : 'Si el código expiró, vuelve a solicitarlo y usa el más reciente.'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
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
                          Procesando...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {getButtonLabel()}
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
                  </button>

                  {step !== 'request' && step !== 'done' && (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={async () => {
                        setError('');
                        setMessage('');
                        setIsLoading(true);
                        try {
                          await requestPasswordReset(email);
                          setMessage('Reenviamos un nuevo código a tu correo.');
                          setStep('verify');
                        } catch (err: any) {
                          setError(err?.message || 'No pudimos enviar el código.');
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      className="text-sm text-purple-300 hover:text-purple-200 transition-colors"
                    >
                      Reenviar código
                    </button>
                  )}
                </div>

                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative px-4 bg-gray-900/50 backdrop-blur-xl">
                    <span className="text-xs uppercase tracking-[0.2em] text-white/30">O</span>
                  </div>
                </div>

                <div className="text-center">
                  <Link
                    to="/login"
                    className="group inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hover:from-purple-300 hover:to-pink-300 transition-all"
                  >
                    <svg className="w-4 h-4 text-purple-400 group-hover:text-purple-300 group-hover:-translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {step === 'done' ? 'Ir al inicio de sesión' : 'Volver al inicio de sesión'}
                  </Link>
                </div>
              </form>
            </div>
          </div>

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
