import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  AlertTriangle,
  RefreshCw,
  Clock,
  Star,
  KeyRound
} from 'lucide-react';
import { CustomerReview } from '../types';
import { getApiUrl } from '../config/api';

interface ReviewModerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewsUpdated?: () => void;
}

export const ReviewModerationModal: React.FC<ReviewModerationModalProps> = ({
  isOpen,
  onClose,
  onReviewsUpdated
}) => {
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  if (!isOpen) return null;

  // Handle Admin Key verification via secure backend endpoint
  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!adminKey.trim()) {
      setAuthError('Veuillez entrer la clé administrateur.');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch(getApiUrl('/api/admin/verify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: adminKey.trim() })
      });

      if (res.ok) {
        setIsAuthenticated(true);
        loadAdminReviews(adminKey.trim());
      } else {
        const data = await res.json().catch(() => ({}));
        setAuthError(data.error || 'Clé administrateur incorrecte ou non autorisée.');
      }
    } catch {
      setAuthError('Erreur de connexion avec le serveur.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Fetch all reviews from backend
  const loadAdminReviews = async (key: string) => {
    setIsLoadingReviews(true);
    setActionError('');
    try {
      const res = await fetch(getApiUrl('/api/admin/reviews'), {
        headers: { 'x-admin-key': key }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.reviews)) {
          setReviews(data.reviews);
        }
      } else {
        setActionError('Impossible de charger les avis. Clé expirée ou invalide.');
      }
    } catch {
      setActionError('Erreur réseau lors du chargement des avis.');
    } finally {
      setIsLoadingReviews(false);
    }
  };

  // Approve a review
  const handleApprove = async (id: string) => {
    setActionError('');
    setActionSuccess('');
    try {
      const res = await fetch(getApiUrl(`/api/admin/reviews/${id}/approve`), {
        method: 'POST',
        headers: { 'x-admin-key': adminKey.trim() }
      });
      if (res.ok) {
        setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
        setActionSuccess('Avis approuvé avec succès ! Il est maintenant visible publiquement.');
        if (onReviewsUpdated) onReviewsUpdated();
        setTimeout(() => setActionSuccess(''), 3000);
      } else {
        setActionError('Erreur lors de l\'approbation.');
      }
    } catch {
      setActionError('Erreur de communication avec le serveur.');
    }
  };

  // Reject a review
  const handleReject = async (id: string) => {
    setActionError('');
    setActionSuccess('');
    try {
      const res = await fetch(getApiUrl(`/api/admin/reviews/${id}/reject`), {
        method: 'POST',
        headers: { 'x-admin-key': adminKey.trim() }
      });
      if (res.ok) {
        setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
        setActionSuccess('Avis rejeté.');
        if (onReviewsUpdated) onReviewsUpdated();
        setTimeout(() => setActionSuccess(''), 3000);
      } else {
        setActionError('Erreur lors du rejet.');
      }
    } catch {
      setActionError('Erreur de communication avec le serveur.');
    }
  };

  // Delete a review permanently
  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer définitivement cet avis ?')) {
      return;
    }
    setActionError('');
    setActionSuccess('');
    try {
      const res = await fetch(getApiUrl(`/api/admin/reviews/${id}`), {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey.trim() }
      });
      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== id));
        setActionSuccess('Avis supprimé définitivement.');
        if (onReviewsUpdated) onReviewsUpdated();
        setTimeout(() => setActionSuccess(''), 3000);
      } else {
        setActionError('Erreur lors de la suppression.');
      }
    } catch {
      setActionError('Erreur de communication avec le serveur.');
    }
  };

  const pendingReviews = reviews.filter(r => r.status === 'pending');
  const approvedReviews = reviews.filter(r => r.status === 'approved');
  const rejectedReviews = reviews.filter(r => r.status === 'rejected');

  const filteredReviews = activeTab === 'pending'
    ? pendingReviews
    : activeTab === 'approved'
    ? approvedReviews
    : activeTab === 'rejected'
    ? rejectedReviews
    : reviews;

  const formatDate = (isoString: string) => {
    try {
      return new Intl.DateTimeFormat('fr-CA', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-[#D5EAD9] overflow-hidden flex flex-col max-h-[90vh] my-auto">
        
        {/* Modal Header */}
        <div className="bg-[#EAF6EE] px-5 py-4 border-b border-[#D5EAD9] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white border border-[#16A34A]/30 flex items-center justify-center text-[#16A34A] shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-heading font-black text-[#0D2818] uppercase tracking-wide">
                Modération des avis clients
              </h3>
              <p className="text-[11px] text-[#3E6552]">
                Espace sécurisé réservé au propriétaire de Max Expert 360
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-[#F4FAF6] border border-[#D5EAD9] text-[#4F7A64] hover:text-[#0D2818] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Security Requirement Notice */}
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex items-start gap-2.5 text-amber-900 text-xs">
          <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-snug">
            <strong>Authentification requise :</strong> Les actions de modération (approbation, rejet, suppression) sont protégées par une clé secrète côté serveur pour empêcher tout accès public non autorisé.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {!isAuthenticated ? (
            /* Authentication Form */
            <div className="max-w-md mx-auto py-6 space-y-4">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-2xl bg-[#EAF6EE] border border-[#BEE7CB] text-[#16A34A] mx-auto flex items-center justify-center shadow-xs">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h4 className="font-heading font-bold text-[#0D2818] text-base">
                  Connexion Modérateur
                </h4>
                <p className="text-xs text-[#4F7A64]">
                  Entrez votre clé de sécurité pour gérer les avis en attente.
                </p>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleAuthenticate} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#15803D] uppercase tracking-wider mb-1">
                    Clé administrateur :
                  </label>
                  <input
                    type="password"
                    autoFocus
                    required
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    placeholder="Clé secrète configurée sur le serveur"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FCF9] border border-[#D5EAD9] text-xs text-[#0D2818] focus:border-[#16A34A] focus:outline-none"
                  />
                  <p className="text-[10px] text-[#7A9C87] mt-1">
                    Définie dans l'environnement serveur (ADMIN_SECRET_KEY).
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-heading font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-sm shadow-[#16A34A]/25"
                >
                  {isVerifying ? 'Vérification...' : 'Déverrouiller l\'espace modérateur'}
                </button>
              </form>
            </div>
          ) : (
            /* Moderation Dashboard */
            <div className="space-y-4">
              {/* Alert Feedback Messages */}
              {actionError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}
              {actionSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              {/* Tabs & Refresh */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#EAF5ED]">
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('pending')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'pending'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-[#F4FAF6] text-[#4F7A64] hover:bg-[#EAF6EE]'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>En attente</span>
                    {pendingReviews.length > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        activeTab === 'pending' ? 'bg-white text-amber-600' : 'bg-amber-500 text-white'
                      }`}>
                        {pendingReviews.length}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('approved')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'approved'
                        ? 'bg-[#16A34A] text-white shadow-xs'
                        : 'bg-[#F4FAF6] text-[#4F7A64] hover:bg-[#EAF6EE]'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approuvés ({approvedReviews.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('rejected')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'rejected'
                        ? 'bg-gray-600 text-white shadow-xs'
                        : 'bg-[#F4FAF6] text-[#4F7A64] hover:bg-[#EAF6EE]'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Rejetés ({rejectedReviews.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'all'
                        ? 'bg-[#0D2818] text-white shadow-xs'
                        : 'bg-[#F4FAF6] text-[#4F7A64] hover:bg-[#EAF6EE]'
                    }`}
                  >
                    Tous ({reviews.length})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => loadAdminReviews(adminKey.trim())}
                  disabled={isLoadingReviews}
                  className="px-3 py-1.5 rounded-xl bg-white border border-[#D5EAD9] text-[#4F7A64] hover:text-[#0D2818] text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingReviews ? 'animate-spin' : ''}`} />
                  <span>Actualiser</span>
                </button>
              </div>

              {/* Reviews List */}
              {isLoadingReviews ? (
                <div className="text-center py-10 text-xs text-[#4F7A64]">
                  Chargement des avis...
                </div>
              ) : filteredReviews.length === 0 ? (
                <div className="text-center py-10 rounded-2xl bg-[#F8FCF9] border border-dashed border-[#D5EAD9] p-6 space-y-2">
                  <p className="text-xs font-medium text-[#4F7A64]">
                    Aucun avis dans cet onglet ({activeTab}).
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl bg-[#F8FCF9] border border-[#D5EAD9] space-y-3 hover:border-[#16A34A] transition-all"
                    >
                      {/* Top Bar: Name, Stars, Date, Status badge */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#0D2818]">
                              {rev.name}
                            </span>
                            {rev.service && (
                              <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#EAF6EE] text-[#15803D] border border-[#BEE7CB] font-medium">
                                {rev.service}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex text-[#16A34A]">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < rev.rating
                                      ? 'text-[#16A34A] fill-[#16A34A]'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-[11px] text-[#7A9C87] font-mono">
                              {formatDate(rev.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {rev.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                              <Clock className="w-3 h-3" />
                              En attente de validation
                            </span>
                          )}
                          {rev.status === 'approved' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle className="w-3 h-3" />
                              Publié en ligne
                            </span>
                          )}
                          {rev.status === 'rejected' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                              <XCircle className="w-3 h-3" />
                              Rejeté (masqué)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Comment text */}
                      <p className="text-xs sm:text-[13px] text-[#244634] leading-relaxed bg-white p-3 rounded-xl border border-[#EAF5ED]">
                        "{rev.comment}"
                      </p>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#EAF5ED]">
                        <span className="text-[10px] text-[#7A9C87] font-mono">
                          ID: {rev.id}
                        </span>

                        <div className="flex items-center gap-2">
                          {rev.status !== 'approved' && (
                            <button
                              type="button"
                              onClick={() => handleApprove(rev.id)}
                              className="px-3 py-1.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Approuver</span>
                            </button>
                          )}

                          {rev.status !== 'rejected' && (
                            <button
                              type="button"
                              onClick={() => handleReject(rev.id)}
                              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Rejeter</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(rev.id)}
                            className="px-3 py-1.5 rounded-lg bg-white hover:bg-red-50 border border-red-200 text-red-600 text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Supprimer</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
