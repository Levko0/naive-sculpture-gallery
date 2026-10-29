import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Sculpture, SculptureInput } from '../../types';
import {
  fetchAdminSculptures,
  createSculpture,
  updateSculpture,
  deleteSculpture,
} from '../../services/api';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/Badge';
import { SculptureEditorModal } from './SculptureEditorModal';
import { OrdersManager } from './OrdersManager';
import {
  Plus,
  Edit2,
  Trash2,
  LogOut,
  Layers,
  Inbox,
  ExternalLink,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { isAuthenticated, logout, session } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'sculptures' | 'orders'>('sculptures');
  const [sculptures, setSculptures] = useState<Sculpture[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingSculpture, setEditingSculpture] = useState<Sculpture | null>(null);

  // Auth Guard
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  const loadSculptures = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminSculptures();
      setSculptures(data);
    } catch (err) {
      console.error('Failed to fetch sculptures:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadSculptures();
    }
  }, [isAuthenticated]);

  const handleOpenCreate = () => {
    setEditingSculpture(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (sculpture: Sculpture) => {
    setEditingSculpture(sculpture);
    setIsEditorOpen(true);
  };

  const handleDelete = async (sculpture: Sculpture) => {
    if (confirm(`Ви дійсно бажаєте видалити скульптуру "${sculpture.title_ua}"?`)) {
      try {
        await deleteSculpture(sculpture.id);
        await loadSculptures();
      } catch (err: any) {
        alert(`Помилка видалення: ${err.message}`);
      }
    }
  };

  const handleSaveSculpture = async (data: SculptureInput) => {
    if (editingSculpture) {
      await updateSculpture(editingSculpture.id, data);
    } else {
      await createSculpture(data);
    }
    await loadSculptures();
  };

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-gallery-border mb-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-museum text-gallery-muted">
            AWS Cognito Авторизовано
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-gallery-ink font-medium mt-1">
            {t.admin.title}
          </h1>
          <p className="text-xs text-gallery-muted mt-0.5">
            Сесія: {session?.email || 'artist@naive-sculptures.art'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            <span className="flex items-center space-x-1.5 text-gallery-muted hover:text-red-600">
              <LogOut className="w-4 h-4" />
              <span>{t.admin.logout}</span>
            </span>
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-gallery-border mb-8">
        <button
          type="button"
          onClick={() => setActiveTab('sculptures')}
          className={`flex items-center space-x-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'sculptures'
              ? 'border-gallery-ink text-gallery-ink'
              : 'border-transparent text-gallery-muted hover:text-gallery-ink'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{t.admin.tabSculptures}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gallery-stone text-gallery-ink">
            {sculptures.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`flex items-center space-x-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'orders'
              ? 'border-gallery-ink text-gallery-ink'
              : 'border-transparent text-gallery-muted hover:text-gallery-ink'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>{t.admin.tabOrders}</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: SCULPTURES CATALOG MANAGEMENT */}
      {/* ==================================================================== */}
      {activeTab === 'sculptures' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-serif text-2xl text-gallery-ink font-medium">
              Каталог робіт ({sculptures.length})
            </h2>
            <Button variant="primary" size="sm" onClick={handleOpenCreate}>
              <span className="flex items-center space-x-1.5">
                <Plus className="w-4 h-4" />
                <span>Додати скульптуру</span>
              </span>
            </Button>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-gallery-muted">Завантаження...</div>
          ) : (
            <div className="overflow-x-auto border border-gallery-border bg-gallery-milk">
              <table className="w-full text-left text-xs">
                <thead className="bg-gallery-stone/50 border-b border-gallery-border uppercase tracking-wider text-gallery-muted font-semibold">
                  <tr>
                    <th className="py-3 px-4">Фото</th>
                    <th className="py-3 px-4">Назва</th>
                    <th className="py-3 px-4">Розміри</th>
                    <th className="py-3 px-4">Ціна</th>
                    <th className="py-3 px-4">Статус</th>
                    <th className="py-3 px-4 text-right">Дії</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gallery-border/50">
                  {sculptures.map((sculpture) => {
                    const coverPhoto =
                      sculpture.photos.find((p) => p.is_cover)?.url ||
                      sculpture.photos[0]?.url ||
                      '';

                    return (
                      <tr key={sculpture.id} className="hover:bg-gallery-stone/20 transition-colors">
                        <td className="py-3 px-4">
                          <div className="w-12 h-14 bg-gallery-stone rounded overflow-hidden">
                            {coverPhoto && (
                              <img
                                src={coverPhoto}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-serif text-base font-medium text-gallery-ink">
                            {sculpture.title_ua}
                          </div>
                          <div className="text-[11px] text-gallery-muted">
                            {sculpture.title_en} • {sculpture.year}
                          </div>
                        </td>
                        <td className="py-3 px-4 tabular-nums text-gallery-muted">
                          {sculpture.dimensions.height_cm} × {sculpture.dimensions.width_cm} × {sculpture.dimensions.depth_cm} cm
                        </td>
                        <td className="py-3 px-4 tabular-nums font-semibold text-gallery-ink">
                          {sculpture.price_uah.toLocaleString()} ₴
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={sculpture.status} size="sm" />
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <a
                            href={`/sculpture/${sculpture.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block p-1.5 text-gallery-muted hover:text-gallery-ink"
                            title="Переглянути на сайті"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(sculpture)}
                            className="p-1.5 text-gallery-muted hover:text-gallery-ink"
                            title="Редагувати"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(sculpture)}
                            className="p-1.5 text-gallery-muted hover:text-red-600"
                            title="Видалити"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: ORDERS & INQUIRIES WORKFLOW */}
      {/* ==================================================================== */}
      {activeTab === 'orders' && (
        <OrdersManager onOrdersUpdated={loadSculptures} />
      )}

      {/* Create / Edit Sculpture Modal */}
      <SculptureEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        sculpture={editingSculpture}
        onSave={handleSaveSculpture}
      />
    </div>
  );
};
