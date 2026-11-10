import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EmailNotification } from '../../types';
import { 
  X, 
  Mail, 
  CheckCheck, 
  ExternalLink, 
  Clock, 
  ChevronRight, 
  ArrowLeft,
  ShieldCheck 
} from 'lucide-react';

export const EmailNotificationDrawer: React.FC = () => {
  const { 
    isEmailDrawerOpen, 
    setIsEmailDrawerOpen, 
    notifications, 
    markNotificationRead,
    setActiveTab,
    setSelectedTrackingJob,
    jobs 
  } = useApp();

  const [selectedEmail, setSelectedEmail] = useState<EmailNotification | null>(null);

  if (!isEmailDrawerOpen) return null;

  const handleOpenEmail = (notif: EmailNotification) => {
    setSelectedEmail(notif);
    markNotificationRead(notif.id);
  };

  const handleJumpToTrack = (referenceId: string) => {
    const found = jobs.find(j => j.trackingCode === referenceId);
    if (found) {
      setSelectedTrackingJob(found);
      setActiveTab('dashboard');
      setIsEmailDrawerOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col border-l border-stone-200">
        
        {/* Drawer Header */}
        <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <Mail className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm text-white font-heading">Automātiskā klientu e-pastu sistēma</h3>
              <p className="text-[11px] text-stone-400">Reāllaika izsūtīto e-pastu žurnāls par apstiprinājumiem un statusiem</p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsEmailDrawerOpen(false);
              setSelectedEmail(null);
            }}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: List or Email Detail */}
        <div className="flex-1 overflow-y-auto">
          {selectedEmail ? (
            /* Single Email View */
            <div className="p-6 space-y-4">
              <button
                onClick={() => setSelectedEmail(null)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-950 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Atpakaļ uz paziņojumu sarakstu</span>
              </button>

              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">No:</span>
                  <span className="font-mono text-stone-900 font-semibold">VentVelo serviss &lt;ventvelo@ventvelo.lv&gt;</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Kam:</span>
                  <span className="font-mono text-stone-900">{selectedEmail.recipientEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Temats:</span>
                  <span className="font-semibold text-stone-900">{selectedEmail.subject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Nosūtīts:</span>
                  <span className="text-stone-700">{selectedEmail.timestamp}</span>
                </div>
              </div>

              {/* HTML Content Render */}
              <div 
                className="border border-stone-200 rounded-xl overflow-hidden shadow-xs bg-white"
                dangerouslySetInnerHTML={{ __html: selectedEmail.htmlContent }}
              />

              {/* Jump to Track if relevant */}
              {selectedEmail.referenceId && (
                <div className="pt-2">
                  <button
                    onClick={() => handleJumpToTrack(selectedEmail.referenceId)}
                    className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs font-heading"
                  >
                    <span>Skatīt remonta gaitu manā velogaražā</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Notification List */
            <div className="divide-y divide-stone-100">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-stone-500 text-xs">
                  Pagaidām nav saņemts neviens paziņojums.
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => handleOpenEmail(n)}
                    className={`p-4 hover:bg-stone-50 transition-colors cursor-pointer flex items-start gap-3 ${
                      !n.read ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    <div className="mt-1">
                      {!n.read ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-100" />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-stone-500">{n.timestamp}</span>
                        <span className="text-[10px] uppercase font-bold text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">
                          {n.category === 'service_booking' ? 'Servisa pieteikums' : n.category === 'status_update' ? 'Statusa maiņa' : 'Pirkuma čeks'}
                        </span>
                      </div>

                      <h4 className="font-semibold text-stone-900 text-xs leading-snug">
                        {n.subject}
                      </h4>

                      <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                        {n.previewText}
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-stone-400 shrink-0 self-center" />
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 text-xs text-stone-500 flex items-center justify-between shrink-0">
          <span>SMTP sistēma: aktīva</span>
          <span>Automātiski e-pasti Ventspilij, Usmai un Talsiem</span>
        </div>

      </div>
    </div>
  );
};
