import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../supabaseClient';
import { cloudinaryConfig } from '../cloudinaryConfig';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'matembo2024';

function AdminPanel() {
  // ─── Auth state ───
  const [isAuthed, setIsAuthed] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // ─── Form state ───
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imagePrompt, setImagePrompt] = useState('');
  const [videoPrompt, setVideoPrompt] = useState('');
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [saving, setSaving] = useState(false);



  const fileInputRef = useRef(null);

  // ─── Manage Prompts state ───
  const [prompts, setPrompts] = useState([]);
  const [loadingPrompts, setLoadingPrompts] = useState(true);

  // ─── Toast state ───
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // ─── Delete Modal state ───
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingPromptId, setDeletingPromptId] = useState(null);

  // ─── Edit Modal state ───
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPromptId, setEditingPromptId] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [editImagePrompt, setEditImagePrompt] = useState('');
  const [editVideoPrompt, setEditVideoPrompt] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const editFileInputRef = useRef(null);

  // ─── Toast Helper ───
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // ─── Data Fetching ───
  const fetchPrompts = async () => {
    setLoadingPrompts(true);
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPrompts(data || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load prompts', 'error');
    } finally {
      setLoadingPrompts(false);
    }
  };

  useEffect(() => {
    if (isAuthed) {
      fetchPrompts();
    }
  }, [isAuthed]);

  // ─── Password check ───
  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthed(true);
      setAuthError('');
    } else {
      setAuthError('Wrong password. Try again.');
    }
  };

  // ─── Image selection ───
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setFormError('');
  };

  // ─── Upload to Cloudinary ───
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);

    const res = await fetch(cloudinaryConfig.uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('Cloudinary upload failed');
    const data = await res.json();
    return data.secure_url;
  };

  // ─── Form submit ───
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');

    // Validation
    if (!imageFile) {
      setFormError('Please upload an image');
      return;
    }
    if (!imagePrompt.trim() && !videoPrompt.trim()) {
      setFormError('Please add at least one prompt');
      return;
    }

    setSaving(true);
    try {
      // 1. Upload image to Cloudinary
      const imageUrl = await uploadToCloudinary(imageFile);

      // 2. Save to Supabase
      const { error } = await supabase.from('prompts').insert([
        {
          image_url: imageUrl,
          image_prompt: imagePrompt.trim() || null,
          video_prompt: videoPrompt.trim() || null,
          copy_count: 0,
        },
      ]);

      if (error) throw error;

      showToast('Prompt saved successfully!', 'success');
      // Reset form
      setImageFile(null);
      setImagePreview(null);
      setImagePrompt('');
      setVideoPrompt('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchPrompts(); // Refresh grid
    } catch (err) {
      console.error(err);
      setFormError('Something went wrong. Try again.');
      showToast('Something went wrong. Try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete Flow ───
  const triggerDelete = (id) => {
    setDeletingPromptId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingPromptId) return;
    const idToDelete = deletingPromptId;

    // Optimistic UI update
    setPrompts((prev) => prev.filter((p) => p.id !== idToDelete));
    setDeleteConfirmOpen(false);
    setDeletingPromptId(null);

    try {
      const { error } = await supabase.from('prompts').delete().eq('id', idToDelete);
      if (error) {
        fetchPrompts();
        throw error;
      }
      showToast('Prompt deleted successfully', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to delete prompt', 'error');
    }
  };

  // ─── Edit Flow ───
  const openEditModal = (prompt) => {
    setEditingPromptId(prompt.id);
    setEditImagePreview(prompt.image_url);
    setEditImageFile(null);
    setEditImagePrompt(prompt.image_prompt || '');
    setEditVideoPrompt(prompt.video_prompt || '');
    setEditModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    document.body.style.overflow = 'unset';
    setEditingPromptId(null);
  };

  const handleEditImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditImageFile(file);
    setEditImagePreview(URL.createObjectURL(file));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editImagePrompt.trim() && !editVideoPrompt.trim()) {
      showToast('Please add at least one prompt', 'error');
      return;
    }

    setEditSaving(true);
    try {
      let imageUrl = editImagePreview;
      if (editImageFile) {
        imageUrl = await uploadToCloudinary(editImageFile);
      }

      const { error } = await supabase
        .from('prompts')
        .update({
          image_url: imageUrl,
          image_prompt: editImagePrompt.trim() || null,
          video_prompt: editVideoPrompt.trim() || null,
        })
        .eq('id', editingPromptId);

      if (error) throw error;

      showToast('Prompt updated successfully', 'success');
      closeEditModal();
      fetchPrompts();
    } catch (err) {
      console.error(err);
      showToast('Something went wrong. Try again.', 'error');
    } finally {
      setEditSaving(false);
    }
  };

  /* ════════════════════════════════════════════
     PASSWORD SCREEN
     ════════════════════════════════════════════ */
  if (!isAuthed) {
    return (
      <div style={styles.passwordPage}>
        <form onSubmit={handleLogin} style={styles.passwordCard}>
          <div style={styles.lockIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0a6b5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 style={styles.passwordHeading}>Admin Access</h2>
          <p style={styles.passwordSubtext}>Enter the password to continue</p>

          <input
            type="password"
            value={passwordInput}
            onChange={(e) => {
              setPasswordInput(e.target.value);
              setAuthError('');
            }}
            placeholder="Password"
            style={styles.passwordInput}
            onFocus={(e) => (e.target.style.borderColor = '#0a6b5e')}
            onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
            autoFocus
          />

          {authError && <p style={styles.errorMsg}>{authError}</p>}

          <button type="submit" style={styles.passwordBtn}>
            Enter
          </button>
        </form>
      </div>
    );
  }

  /* ════════════════════════════════════════════
     ADMIN FORM
     ════════════════════════════════════════════ */
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Brand */}
        <span style={styles.brand}>Matembo Prompts</span>

        {/* Heading */}
        <h1 style={styles.heading}>Add New Prompt</h1>
        <p style={styles.subtitle}>Upload an image and add your AI prompts</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* ── Image Upload ── */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Image</label>
            <div
              style={{
                ...styles.uploadArea,
                ...(imagePreview ? styles.uploadAreaHasImage : {}),
              }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file && file.type.startsWith('image/')) {
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                  setFormError('');
                }
              }}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={styles.previewImg}
                />
              ) : (
                <div style={styles.uploadPlaceholder}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span style={styles.uploadText}>Click to upload image</span>
                  <span style={styles.uploadHint}>or drag and drop</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* ── Image Prompt ── */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Image Prompt</label>
            <textarea
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              placeholder="Enter the prompt for AI image generation..."
              style={styles.textarea}
              onFocus={(e) => (e.target.style.borderColor = '#0a6b5e')}
              onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
            />
          </div>

          {/* ── Video Prompt ── */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Video Prompt</label>
            <textarea
              value={videoPrompt}
              onChange={(e) => setVideoPrompt(e.target.value)}
              placeholder="Enter the prompt for AI video generation..."
              style={styles.textarea}
              onFocus={(e) => (e.target.style.borderColor = '#0a6b5e')}
              onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
            />
          </div>

          {/* ── Messages ── */}
          {formError && <p style={styles.errorMsg}>{formError}</p>}
          {successMsg && <p style={styles.successMsg}>{successMsg}</p>}

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={saving}
            style={{
              ...styles.submitBtn,
              ...(saving ? styles.submitBtnDisabled : {}),
            }}
          >
            {saving ? 'Saving...' : 'Save Prompt'}
          </button>
        </form>
      </div>

      {/* ── Manage Prompts Section ── */}
      <div style={styles.manageSection}>
        <div style={styles.manageHeader}>
          <h2 style={styles.manageHeading}>Manage Prompts</h2>
          <p style={styles.manageSubtitle}>Edit or delete existing prompts</p>
        </div>
        <div style={styles.divider} />

        {loadingPrompts ? (
          <div className="admin-grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={styles.skeletonCard} />
            ))}
          </div>
        ) : (
          <div className="admin-grid">
            {prompts.map((p) => (
              <div key={p.id} style={styles.gridCard}>
                <img src={p.image_url} alt="Prompt" style={styles.gridImg} />
                <div style={styles.gridBtnRow}>
                  <button className="interactive-btn" style={styles.btnEdit} onClick={() => openEditModal(p)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                    Edit
                  </button>
                  <button className="interactive-btn" style={styles.btnDelete} onClick={() => triggerDelete(p.id)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── PORTALS ── */}
      {deleteConfirmOpen && createPortal(
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h3 style={styles.modalHeading}>Confirm Delete</h3>
            <p style={styles.modalText}>Are you sure you want to delete this prompt? This cannot be undone.</p>
            <div style={styles.modalBtnRow}>
              <button className="interactive-btn" style={styles.modalBtnCancel} onClick={() => { setDeleteConfirmOpen(false); setDeletingPromptId(null); }}>Cancel</button>
              <button className="interactive-btn" style={styles.modalBtnDelete} onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {editModalOpen && createPortal(
        <div style={styles.modalOverlay}>
          <div style={styles.editModalCard}>
            <button style={styles.modalCloseBtn} onClick={closeEditModal}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
            <h3 style={styles.modalHeading}>Edit Prompt</h3>
            <form onSubmit={handleEditSubmit} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Image</label>
                <div style={styles.editImageWrapper}>
                  <img src={editImagePreview} alt="Preview" style={styles.editPreviewImg} />
                  <button type="button" className="interactive-btn" style={styles.editChangeImgBtn} onClick={() => editFileInputRef.current?.click()}>Change Image</button>
                  <input ref={editFileInputRef} type="file" accept="image/*" onChange={handleEditImageSelect} style={{ display: 'none' }} />
                </div>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Image Prompt</label>
                <textarea value={editImagePrompt} onChange={(e) => setEditImagePrompt(e.target.value)} style={styles.textarea} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Video Prompt</label>
                <textarea value={editVideoPrompt} onChange={(e) => setEditVideoPrompt(e.target.value)} style={styles.textarea} />
              </div>
              <div style={styles.modalBtnRow}>
                <button type="button" className="interactive-btn" style={styles.modalBtnCancel} onClick={closeEditModal}>Cancel</button>
                <button type="submit" className="interactive-btn" style={styles.submitBtn} disabled={editSaving}>{editSaving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {toast.show && createPortal(
        <div style={{ ...styles.toast, ...(toast.type === 'error' ? styles.toastError : styles.toastSuccess) }}>
          {toast.type === 'error' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          )}
          {toast.message}
        </div>,
        document.body
      )}

      <style>{`
        .admin-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          width: 100%;
        }
        @media (max-width: 1024px) {
          .admin-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .admin-grid { grid-template-columns: 1fr; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .toast-enter {
          animation: fadeIn 0.3s ease forwards;
        }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════
   INLINE STYLES
   ══════════════════════════════════════════════ */
const styles = {
  /* ─── Password screen ─── */
  passwordPage: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f9fafb',
    padding: '24px',
    fontFamily: "'DM Sans', sans-serif",
  },
  passwordCard: {
    width: '100%',
    maxWidth: '380px',
    background: '#ffffff',
    borderRadius: '20px',
    padding: '40px 32px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  lockIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    background: '#ecfdf5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '8px',
  },
  passwordHeading: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#0d0d0d',
    margin: '8px 0 0',
    fontFamily: "'DM Sans', sans-serif",
  },
  passwordSubtext: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '4px 0 20px',
    fontFamily: "'DM Sans', sans-serif",
  },
  passwordInput: {
    width: '100%',
    padding: '12px 16px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '15px',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  passwordBtn: {
    width: '100%',
    padding: '13px',
    border: 'none',
    borderRadius: '999px',
    background: '#0a6b5e',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 700,
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer',
    transition: 'background 0.2s, transform 0.15s',
    marginTop: '8px',
  },

  /* ─── Admin form page ─── */
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '40px',
    background: '#f9fafb',
    padding: '48px 24px',
    fontFamily: "'DM Sans', sans-serif",
  },
  card: {
    width: '100%',
    maxWidth: '600px',
    background: '#ffffff',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
  },
  brand: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#0a6b5e',
    letterSpacing: '0.04em',
    display: 'block',
    marginBottom: '16px',
  },
  heading: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#0d0d0d',
    margin: '0 0 6px',
    fontFamily: "'DM Sans', sans-serif",
  },
  subtitle: {
    fontSize: '15px',
    color: '#6b7280',
    margin: '0 0 32px',
    fontFamily: "'DM Sans', sans-serif",
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#0d0d0d',
  },

  /* ─── Upload area ─── */
  uploadArea: {
    width: '100%',
    height: '200px',
    border: '2px dashed #d1d5db',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    overflow: 'hidden',
    transition: 'border-color 0.2s, background 0.2s',
    background: '#fafafa',
  },
  uploadAreaHasImage: {
    border: '2px solid #e5e7eb',
    background: '#000',
  },
  uploadPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  uploadText: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#374151',
  },
  uploadHint: {
    fontSize: '13px',
    color: '#9ca3af',
  },
  previewImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },

  /* ─── Textareas ─── */
  textarea: {
    width: '100%',
    height: '120px',
    padding: '12px 16px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '15px',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    resize: 'vertical',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
    lineHeight: 1.6,
  },

  /* ─── Messages ─── */
  errorMsg: {
    color: '#dc2626',
    fontSize: '14px',
    fontWeight: 500,
    margin: '0',
    padding: '10px 14px',
    background: '#fef2f2',
    borderRadius: '10px',
    border: '1px solid #fecaca',
  },
  successMsg: {
    color: '#16a34a',
    fontSize: '14px',
    fontWeight: 500,
    margin: '0',
    padding: '10px 14px',
    background: '#f0fdf4',
    borderRadius: '10px',
    border: '1px solid #bbf7d0',
  },

  /* ─── Submit button ─── */
  submitBtn: {
    width: '100%',
    padding: '14px',
    border: 'none',
    borderRadius: '999px',
    background: '#0a6b5e',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 700,
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer',
    transition: 'background 0.2s, transform 0.15s, box-shadow 0.2s',
    marginTop: '4px',
  },
  submitBtnDisabled: {
    background: '#6b7280',
    cursor: 'not-allowed',
  },

  /* ─── Manage Section ─── */
  manageSection: {
    width: '100%',
    maxWidth: '1200px',
    background: '#ffffff',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    boxSizing: 'border-box',
  },
  manageHeader: {
    marginBottom: '20px',
  },
  manageHeading: {
    fontSize: '24px',
    fontWeight: 800,
    color: '#0d0d0d',
    margin: '0 0 4px',
    fontFamily: "'DM Sans', sans-serif",
  },
  manageSubtitle: {
    fontSize: '15px',
    color: '#6b7280',
    margin: 0,
    fontFamily: "'DM Sans', sans-serif",
  },
  divider: {
    height: '1px',
    background: '#e5e7eb',
    width: '100%',
    margin: '0 0 32px 0',
  },
  skeletonCard: {
    width: '100%',
    height: '260px',
    borderRadius: '12px',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  },
  gridCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    overflow: 'hidden',
    background: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
  },
  gridImg: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    background: '#f3f4f6',
  },
  gridBtnRow: {
    display: 'flex',
    padding: '12px',
    gap: '8px',
    borderTop: '1px solid #e5e7eb',
  },
  btnEdit: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px',
    border: '1.5px solid #0a6b5e',
    background: 'transparent',
    color: '#0a6b5e',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  btnDelete: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px',
    border: '1.5px solid #dc2626',
    background: 'transparent',
    color: '#dc2626',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },

  /* ─── Modals ─── */
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
    animation: 'fadeIn 0.25s ease',
  },
  modalCard: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '400px',
    width: '100%',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  },
  editModalCard: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '560px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    position: 'relative',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: 'transparent',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    padding: '4px',
  },
  modalHeading: {
    fontSize: '20px',
    fontWeight: 800,
    color: '#0d0d0d',
    margin: '0 0 12px 0',
    fontFamily: "'DM Sans', sans-serif",
  },
  modalText: {
    fontSize: '15px',
    color: '#4b5563',
    margin: '0 0 24px 0',
    lineHeight: 1.5,
    fontFamily: "'DM Sans', sans-serif",
  },
  modalBtnRow: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '16px',
  },
  modalBtnCancel: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1.5px solid #d1d5db',
    background: 'transparent',
    color: '#374151',
    fontWeight: 600,
    cursor: 'pointer',
  },
  modalBtnDelete: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: '#dc2626',
    color: '#ffffff',
    fontWeight: 600,
    cursor: 'pointer',
  },
  editImageWrapper: {
    width: '100%',
    height: '160px',
    borderRadius: '12px',
    background: '#f3f4f6',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #e5e7eb',
  },
  editPreviewImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  editChangeImgBtn: {
    position: 'absolute',
    bottom: '12px',
    right: '12px',
    background: 'rgba(255,255,255,0.9)',
    border: '1px solid #d1d5db',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    color: '#0d0d0d',
  },

  /* ─── Toasts ─── */
  toast: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    padding: '12px 20px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#ffffff',
    zIndex: 10000,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    fontFamily: "'DM Sans', sans-serif",
  },
  toastSuccess: {
    background: '#16a34a',
  },
  toastError: {
    background: '#dc2626',
  },
};

export default AdminPanel;
