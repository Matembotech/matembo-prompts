import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../supabaseClient';
import { cloudinaryConfig } from '../cloudinaryConfig';
import AnalyticsDashboard from './AnalyticsDashboard';
import StatsRow from './admin/StatsRow';

function AdminPanel() {
  // ─── App state ───
  const [activePage, setActivePage] = useState('analytics');

  // ─── Auth state ───
  const [isAuthed, setIsAuthed] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isPwdFocused, setIsPwdFocused] = useState(false);

  // ─── Form state ───
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageSource, setImageSource] = useState('file');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [videoPrompt, setVideoPrompt] = useState('');
  const [imagePromptFocused, setImagePromptFocused] = useState(false);
  const [videoPromptFocused, setVideoPromptFocused] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [saving, setSaving] = useState(false);

  // ─── Responsive State ───
  // ─── Responsive State ───
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsTablet(window.innerWidth < 1024);
      if (!mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fileInputRef = useRef(null);

  // ─── Manage Prompts state ───
  const [prompts, setPrompts] = useState([]);
  const [loadingPrompts, setLoadingPrompts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  const filteredPrompts = prompts.filter(p => 
    p.image_prompt?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.video_prompt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPrompts.length / itemsPerPage);
  const paginatedPrompts = filteredPrompts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editImageSource, setEditImageSource] = useState('file');
  const [editTitle, setEditTitle] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImagePrompt, setEditImagePrompt] = useState('');
  const [editVideoPrompt, setEditVideoPrompt] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const editFileInputRef = useRef(null);

  // ─── Toast Helper ───
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const generateSlug = (text) => {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
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
    if (passwordInput === import.meta.env.VITE_ADMIN_PASSWORD) {
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
  const uploadToCloudinary = async (input) => {
    const formData = new FormData();

    if (typeof input === 'string') {
      const response = await fetch(input);
      if (!response.ok) throw new Error('Failed to fetch image from URL');
      const blob = await response.blob();
      formData.append('file', blob, 'image.jpg');
    } else {
      formData.append('file', input);
    }

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
    if (imageSource === 'file' && !imageFile) {
      setFormError('Please upload an image');
      return;
    }
    if (imageSource === 'url' && !imageUrl.trim()) {
      setFormError('Please paste an image URL');
      return;
    }
    if (!imagePrompt.trim() && !videoPrompt.trim()) {
      setFormError('Please add at least one prompt');
      return;
    }

    setSaving(true);
    try {
      // 1. Upload image to Cloudinary (file or URL)
      const finalImageUrl = imageSource === 'file'
        ? await uploadToCloudinary(imageFile)
        : await uploadToCloudinary(imageUrl.trim());

      // 2. Save to Supabase
      const { error } = await supabase.from('prompts').insert([
        {
          title: title.trim() || null,
          slug: slug.trim() || null,
          description: description.trim() || null,
          image_url: finalImageUrl,
          image_prompt: imagePrompt.trim() || null,
          video_prompt: videoPrompt.trim() || null,
          copy_count: 0,
        },
      ]);

      if (error) {
        if (error.code === '23505') throw new Error('Slug must be unique. Please change the slug.');
        throw error;
      }

      showToast('Prompt saved successfully!', 'success');
      // Reset form
      setTitle('');
      setSlug('');
      setDescription('');
      setImageFile(null);
      setImagePreview(null);
      setImageUrl('');
      setImageSource('file');
      setImagePrompt('');
      setVideoPrompt('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchPrompts(); // Refresh grid
    } catch (err) {
      console.error(err);
      const msg = err.message || 'Something went wrong. Try again.';
      setFormError(msg);
      showToast(msg, 'error');
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

  const handleCopyShareLink = async (slug) => {
    if (!slug) {
      showToast('No slug available for this prompt', 'error');
      return;
    }
    try {
      const link = `${window.location.origin}/prompts/${slug}`;
      await navigator.clipboard.writeText(link);
      showToast('Share link copied to clipboard!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to copy link', 'error');
    }
  };

  // ─── Edit Flow ───
  const openEditModal = (prompt) => {
    setEditingPromptId(prompt.id);
    setEditTitle(prompt.title || '');
    setEditSlug(prompt.slug || '');
    setEditDescription(prompt.description || '');
    setEditImagePreview(prompt.image_url);
    setEditImageUrl(prompt.image_url || '');
    setEditImageFile(null);
    setEditImageSource('file');
    setEditImagePrompt(prompt.image_prompt || '');
    setEditVideoPrompt(prompt.video_prompt || '');
    setEditModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    document.body.style.overflow = 'unset';
    setEditingPromptId(null);
    setEditImageUrl('');
    setEditImageSource('file');
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
      let finalImageUrl = editImagePreview;
      if (editImageSource === 'file' && editImageFile) {
        finalImageUrl = await uploadToCloudinary(editImageFile);
      } else if (editImageSource === 'url' && editImageUrl.trim() !== editImagePreview) {
        finalImageUrl = await uploadToCloudinary(editImageUrl.trim());
      }

      const { error } = await supabase
        .from('prompts')
        .update({
          title: editTitle.trim() || null,
          slug: editSlug.trim() || null,
          description: editDescription.trim() || null,
          image_url: finalImageUrl,
          image_prompt: editImagePrompt.trim() || null,
          video_prompt: editVideoPrompt.trim() || null,
        })
        .eq('id', editingPromptId);

      if (error) {
        if (error.code === '23505') throw new Error('Slug must be unique. Please change the slug.');
        throw error;
      }

      showToast('Prompt updated successfully', 'success');
      closeEditModal();
      fetchPrompts();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Something went wrong. Try again.', 'error');
    } finally {
      setEditSaving(false);
    }
  };

  /* ════════════════════════════════════════════
     PASSWORD SCREEN
     ════════════════════════════════════════════ */
  if (!isAuthed) {
    return (
      <div style={{ ...styles.passwordPage, padding: '24px 16px' }}>
        <form onSubmit={handleLogin} style={{ ...styles.passwordCard, padding: isMobile ? '28px 20px' : '40px 32px', borderRadius: isMobile ? '16px' : '20px' }}>
          <div style={styles.lockIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 style={{ ...styles.passwordHeading, fontSize: isMobile ? '20px' : '22px' }}>Admin Access</h2>
          <p style={styles.passwordSubtext}>Enter your password to continue</p>

          <input
            type="password"
            value={passwordInput}
            onChange={(e) => {
              setPasswordInput(e.target.value);
              setAuthError('');
            }}
            onFocus={() => setIsPwdFocused(true)}
            onBlur={() => setIsPwdFocused(false)}
            placeholder="Password"
            style={{
              ...styles.passwordInput,
              ...(isPwdFocused ? { borderColor: '#0F6E56' } : {})
            }}
            autoFocus
          />

          {authError && <p style={styles.passwordErrorMsg}>{authError}</p>}

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
  const getPageTitle = () => {
    switch (activePage) {
      case 'analytics': return 'Analytics Overview';
      case 'prompts': return 'Manage Prompts';
      case 'add': return 'Add New Prompt';
      case 'settings': return 'Settings';
      default: return 'Admin Panel';
    }
  };

  return (
    <div style={styles.appShell}>
      {/* ── OVERLAY ── */}
      {isMobile && sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0,
            width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.4)',
            zIndex: 99,
          }} 
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside style={{
        ...styles.sidebar,
        position: isMobile ? 'fixed' : 'relative',
        width: !isMobile ? '64px' : '220px',
        transform: !isMobile ? 'none' : (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)')
      }}>
        <div style={{
          height: '52px', width: '100%', display: 'flex', alignItems: 'center',
          borderBottom: '1px solid #e5e7eb',
          padding: (isMobile && sidebarOpen) ? '0 16px' : '0',
          justifyContent: (isMobile && sidebarOpen) ? 'space-between' : 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/logo.webp" alt="Matembo Logo" style={{ width: '28px', height: '28px', borderRadius: '8px', objectFit: 'cover' }} />
            {(isMobile && sidebarOpen) && <span style={{ fontSize: '13px', fontWeight: 600, color: '#0d0d0d', marginLeft: '8px' }}>Matembo</span>}
          </div>

          {(isMobile && sidebarOpen) && (
            <button onClick={() => setSidebarOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', padding: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>

        <nav style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: (isMobile && sidebarOpen) ? 'flex-start' : 'center',
          padding: '12px 0', gap: '4px', width: '100%'
        }}>
          {(isMobile && sidebarOpen) && <h3 style={styles.navSectionTitle}>Overview</h3>}
          
          <div className="nav-item-wrap" style={{ width: '100%', display: 'flex', justifyContent: (isMobile && sidebarOpen) ? 'flex-start' : 'center', padding: (isMobile && sidebarOpen) ? '0 10px' : '0', position: 'relative' }}>
            <button 
              className="nav-item-btn"
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', 
                padding: (isMobile && sidebarOpen) ? '7px 10px' : '10px', 
                borderRadius: '8px', fontSize: '13px', cursor: 'pointer', border: 'none', 
                background: activePage === 'analytics' ? '#E1F5EE' : 'transparent', 
                color: activePage === 'analytics' ? '#0F6E56' : '#6b7280',
                fontWeight: activePage === 'analytics' ? 500 : 400,
                width: (isMobile && sidebarOpen) ? '100%' : 'auto', 
                textAlign: 'left', outline: 'none'
              }} 
              onClick={() => { setActivePage('analytics'); if (isMobile) setSidebarOpen(false); }}
              title={!isMobile ? "Analytics" : ""}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
              {(isMobile && sidebarOpen) && <span>Analytics</span>}
            </button>
          </div>

          {(isMobile && sidebarOpen) && <h3 style={{...styles.navSectionTitle, marginTop: '8px'}}>Content</h3>}
          
          <div className="nav-item-wrap" style={{ width: '100%', display: 'flex', justifyContent: (isMobile && sidebarOpen) ? 'flex-start' : 'center', padding: (isMobile && sidebarOpen) ? '0 10px' : '0', position: 'relative' }}>
            <button 
              className="nav-item-btn"
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', 
                padding: (isMobile && sidebarOpen) ? '7px 10px' : '10px', 
                borderRadius: '8px', fontSize: '13px', cursor: 'pointer', border: 'none', 
                background: activePage === 'prompts' ? '#E1F5EE' : 'transparent', 
                color: activePage === 'prompts' ? '#0F6E56' : '#6b7280',
                fontWeight: activePage === 'prompts' ? 500 : 400,
                width: (isMobile && sidebarOpen) ? '100%' : 'auto', 
                textAlign: 'left', outline: 'none'
              }} 
              onClick={() => { setActivePage('prompts'); if (isMobile) setSidebarOpen(false); }}
              title={!isMobile ? "Prompts" : ""}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              {(isMobile && sidebarOpen) && <span>Prompts</span>}
              {(isMobile && sidebarOpen) && <span style={styles.navBadge}>{prompts.length}</span>}
            </button>
          </div>

          <div className="nav-item-wrap" style={{ width: '100%', display: 'flex', justifyContent: (isMobile && sidebarOpen) ? 'flex-start' : 'center', padding: (isMobile && sidebarOpen) ? '0 10px' : '0', position: 'relative' }}>
            <button 
              className="nav-item-btn"
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', 
                padding: (isMobile && sidebarOpen) ? '7px 10px' : '10px', 
                borderRadius: '8px', fontSize: '13px', cursor: 'pointer', border: 'none', 
                background: activePage === 'add' ? '#E1F5EE' : 'transparent', 
                color: activePage === 'add' ? '#0F6E56' : '#6b7280',
                fontWeight: activePage === 'add' ? 500 : 400,
                width: (isMobile && sidebarOpen) ? '100%' : 'auto', 
                textAlign: 'left', outline: 'none'
              }} 
              onClick={() => { setActivePage('add'); if (isMobile) setSidebarOpen(false); }}
              title={!isMobile ? "Add Prompt" : ""}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
              {(isMobile && sidebarOpen) && <span>Add Prompt</span>}
            </button>
          </div>

          {(isMobile && sidebarOpen) && <h3 style={{...styles.navSectionTitle, marginTop: '8px'}}>System</h3>}
          
          <div className="nav-item-wrap" style={{ width: '100%', display: 'flex', justifyContent: (isMobile && sidebarOpen) ? 'flex-start' : 'center', padding: (isMobile && sidebarOpen) ? '0 10px' : '0', position: 'relative' }}>
            <button 
              className="nav-item-btn"
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', 
                padding: (isMobile && sidebarOpen) ? '7px 10px' : '10px', 
                borderRadius: '8px', fontSize: '13px', cursor: 'pointer', border: 'none', 
                background: activePage === 'settings' ? '#E1F5EE' : 'transparent', 
                color: activePage === 'settings' ? '#0F6E56' : '#6b7280',
                fontWeight: activePage === 'settings' ? 500 : 400,
                width: (isMobile && sidebarOpen) ? '100%' : 'auto', 
                textAlign: 'left', outline: 'none'
              }} 
              onClick={() => { setActivePage('settings'); if (isMobile) setSidebarOpen(false); }}
              title={!isMobile ? "Settings" : ""}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              {(isMobile && sidebarOpen) && <span>Settings</span>}
            </button>
          </div>
        </nav>

        <div style={{ display: 'flex', flexDirection: 'column', padding: '12px 8px', borderTop: '1px solid #e5e7eb', gap: '8px' }}>
          <div className="nav-item-wrap" style={{ width: '100%', display: 'flex', justifyContent: (isMobile && sidebarOpen) ? 'flex-start' : 'center', padding: (isMobile && sidebarOpen) ? '0 10px' : '0', position: 'relative' }}>
            <button 
              className="nav-item-btn"
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', 
                padding: (isMobile && sidebarOpen) ? '7px 10px' : '10px', 
                borderRadius: '8px', fontSize: '13px', cursor: 'pointer', border: 'none', 
                background: 'transparent', 
                color: '#6b7280',
                fontWeight: 400,
                width: (isMobile && sidebarOpen) ? '100%' : 'auto', 
                textAlign: 'left', outline: 'none'
              }} 
              onClick={() => { window.location.href = '/'; }}
              title={!isMobile ? "Back to Site" : ""}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
              {(isMobile && sidebarOpen) && <span>Back to Site</span>}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: (isMobile && sidebarOpen) ? 'flex-start' : 'center', gap: '10px', padding: (isMobile && sidebarOpen) ? '0 10px' : '0', marginTop: '4px' }}>
          <div style={styles.avatar}>IM</div>
          {(isMobile && sidebarOpen) && (
            <>
              <div style={styles.userTextContainer}>
                <p style={styles.userName}>Ibrahim M.</p>
                <p style={styles.userRole}>Admin</p>
              </div>
              <button style={styles.userOptionsBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
              </button>
            </>
          )}
        </div>
        </div>
      </aside>

      {/* ── MAIN WRAPPER ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* TOPBAR */}
        <header style={{ ...styles.topbar, height: isMobile ? '48px' : '52px', padding: isMobile ? '0 12px' : '0 20px', gap: isMobile ? '8px' : '12px' }}>
          {isMobile && (
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', color: '#111827' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          )}
          <h1 style={{ ...styles.topbarTitle, fontSize: isMobile ? '13px' : '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getPageTitle()}</h1>
          {!isMobile && <input type="text" placeholder="Search prompts..." style={styles.topbarSearch} />}
          {!isMobile && (
            <button style={styles.topbarBell}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            </button>
          )}
          <button style={{ ...styles.topbarAddBtn, fontSize: isMobile ? '11px' : '12px', padding: isMobile ? '5px 10px' : '6px 12px' }} onClick={() => setActivePage('add')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {!isMobile && 'Add Prompt'}
          </button>
        </header>

        {/* CONTENT */}
        <main style={{ ...styles.mainContent, padding: isMobile ? '16px 12px' : '24px', display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
          {activePage === 'analytics' && (
            <>
              <StatsRow promptCount={prompts.length} prompts={prompts} isMobile={isMobile} />
              <AnalyticsDashboard isMobile={isMobile} isTablet={isTablet} />
            </>
          )}

          {activePage === 'add' && (
            <div style={{ ...styles.card, padding: isMobile ? '20px 16px' : '32px', borderRadius: isMobile ? '12px' : '16px', maxWidth: isMobile ? '100%' : '600px' }}>
              <div style={styles.cardHeaderRow}>
                <div style={styles.cardHeaderIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                </div>
                <div>
                  <h2 style={{ ...styles.cardHeading, fontSize: isMobile ? '16px' : '16px' }}>Add New Prompt</h2>
                  <p style={styles.cardSubtitle}>Upload an image and add your AI prompts</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} style={styles.form}>
                {/* ── Meta Details ── */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); setSlug(generateSlug(e.target.value)); }}
                    placeholder="E.g., Facebook Marketing Plan"
                    style={styles.urlInput}
                    required
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Slug (Auto-generated)</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="facebook-marketing-plan"
                    style={styles.urlInput}
                    required
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Short Description (Optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A brief description of what this prompt does..."
                    style={{ ...styles.textarea, height: '60px' }}
                  />
                </div>

                {/* ── Image Upload ── */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Image</label>

                  {/* Toggle */}
                  <div style={styles.sourceToggle}>
                    <button
                      type="button"
                      onClick={() => setImageSource('file')}
                      style={{
                        ...styles.sourceBtn,
                        ...(imageSource === 'file' ? styles.sourceBtnActive : {}),
                        fontSize: isMobile ? '12px' : '13px',
                        padding: isMobile ? '8px 12px' : '9px 16px',
                      }}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSource('url')}
                      style={{
                        ...styles.sourceBtn,
                        ...(imageSource === 'url' ? styles.sourceBtnActive : {}),
                        fontSize: isMobile ? '12px' : '13px',
                        padding: isMobile ? '8px 12px' : '9px 16px',
                      }}
                    >
                      Paste URL
                    </button>
                  </div>

                  {imageSource === 'file' ? (
                    /* File upload mode */
                    <div
                      style={{
                        ...styles.uploadArea,
                        ...(imagePreview ? styles.uploadAreaHasImage : {}),
                        height: isMobile ? '160px' : '180px',
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
                        <img src={imagePreview} alt="Preview" style={styles.previewImg} />
                      ) : (
                        <>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                          <span style={styles.uploadText}>Click to upload image</span>
                          <span style={styles.uploadHint}>or drag and drop</span>
                        </>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        style={{ display: 'none' }}
                      />
                    </div>
                  ) : (
                    /* URL input mode */
                    <div>
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => {
                          setImageUrl(e.target.value);
                          setImagePreview(null);
                          setFormError('');
                        }}
                        placeholder="https://example.com/image.jpg"
                        style={styles.urlInput}
                      />
                      {imageUrl && imageUrl.trim() && (
                        <img
                          src={imageUrl}
                          alt="URL preview"
                          style={{ ...styles.previewImg, marginTop: '12px', maxHeight: '280px', borderRadius: '12px', objectFit: 'contain', width: '100%', border: '2px solid #e5e7eb', background: '#000' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* ── Image Prompt ── */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Image Prompt</label>
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    onFocus={() => setImagePromptFocused(true)}
                    onBlur={() => setImagePromptFocused(false)}
                    placeholder="Enter the prompt for AI image generation..."
                    style={{
                      ...styles.textarea,
                      ...(imagePromptFocused ? { borderColor: '#0F6E56' } : {}),
                      height: isMobile ? '90px' : '110px',
                    }}
                  />
                </div>

                {/* ── Video Prompt ── */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Video Prompt</label>
                  <textarea
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    onFocus={() => setVideoPromptFocused(true)}
                    onBlur={() => setVideoPromptFocused(false)}
                    placeholder="Enter the prompt for AI video generation..."
                    style={{
                      ...styles.textarea,
                      ...(videoPromptFocused ? { borderColor: '#0F6E56' } : {}),
                      height: isMobile ? '90px' : '110px',
                    }}
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
                    padding: isMobile ? '12px' : '14px',
                    fontSize: isMobile ? '14px' : '16px',
                  }}
                >
                  {saving ? 'Saving...' : 'Save Prompt'}
                </button>
              </form>
            </div>
          )}

          {activePage === 'prompts' && (
            <div style={{ ...styles.manageSection, padding: isMobile ? '20px 16px' : '40px' }}>
              {/* Header Row */}
              <div style={styles.manageHeaderRow}>
                <div>
                  <h2 style={{ ...styles.manageHeading, fontSize: isMobile ? '18px' : '24px' }}>Manage Prompts</h2>
                  <p style={styles.manageSubtitle}>Edit or delete existing prompts</p>
                </div>
                <button style={styles.refreshBtn} onClick={fetchPrompts}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                </button>
              </div>

              {/* Search + Filter Row */}
              <div style={{ ...styles.searchFilterRow, flexDirection: isMobile ? 'column' : 'row', gap: '8px' }}>
                <input 
                  type="text" 
                  style={{ ...styles.searchInput, width: isMobile ? '100%' : 'auto', flex: isMobile ? 'none' : 1, boxSizing: 'border-box' }} 
                  placeholder="Search prompts..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button style={{ ...styles.filterBtn, width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                  Filter
                </button>
              </div>

              {/* Grid */}
              {loadingPrompts ? (
                <div className="admin-grid">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} style={styles.newSkeletonCard} />
                  ))}
                </div>
              ) : (
                <div className="admin-grid">
                  {paginatedPrompts.map((p) => {
                    const typeBadge = p.image_prompt && p.video_prompt ? 'Both' : (p.image_prompt ? 'Image' : 'Video');
                    const previewText = p.image_prompt || p.video_prompt || '';
                    const dateFmt = p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';
                    
                    return (
                      <div key={p.id} style={styles.newGridCard}>
                        <div style={{ ...styles.gridImageArea, height: isMobile ? '150px' : '200px' }}>
                          <img src={p.image_url} alt="Prompt" style={styles.gridImgCover} />
                          <div style={styles.typeBadge}>{typeBadge}</div>
                        </div>
                        <div style={styles.gridBody}>
                          <div style={styles.promptPreview}>{previewText}</div>
                          <div style={styles.gridMetaRow}>
                            <div style={styles.metaItem}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                              {p.copy_count || 0} copies
                            </div>
                            <div style={styles.metaItem}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                              {dateFmt}
                            </div>
                          </div>
                        </div>
                        <div style={{ ...styles.gridActionsRow, padding: isMobile ? '8px' : '12px', gap: isMobile ? '6px' : '8px', display: 'flex', flexWrap: 'wrap' }}>
                          <button className="interactive-btn" style={{ ...styles.newBtnEdit, fontSize: isMobile ? '12px' : '14px', padding: isMobile ? '6px' : '8px', flex: 1 }} onClick={() => handleCopyShareLink(p.slug)}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                            Copy Link
                          </button>
                          <button className="interactive-btn" style={{ ...styles.newBtnEdit, fontSize: isMobile ? '12px' : '14px', padding: isMobile ? '6px' : '8px', flex: 1 }} onClick={() => openEditModal(p)}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                            Edit
                          </button>
                          <button className="interactive-btn" style={{ ...styles.newBtnDelete, fontSize: isMobile ? '12px' : '14px', padding: isMobile ? '6px' : '8px', flex: 1 }} onClick={() => triggerDelete(p.id)}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination Controls */}
              {!loadingPrompts && totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{ ...styles.filterBtn, opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    Previous
                  </button>
                  <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={{ ...styles.filterBtn, opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {activePage === 'settings' && (
            <div>Settings coming soon</div>
          )}
        </main>
      </div>

      {/* ── PORTALS ── */}
      {deleteConfirmOpen && createPortal(
        <div style={{ ...styles.modalOverlay, padding: isMobile ? '0' : '20px', alignItems: isMobile ? 'flex-end' : 'center' }}>
          <div style={{ ...styles.modalCard, borderRadius: isMobile ? '16px 16px 0 0' : '16px', padding: isMobile ? '24px 20px' : '32px', maxWidth: isMobile ? '100%' : '400px' }}>
            <h3 style={{ ...styles.modalHeading, fontSize: isMobile ? '17px' : '20px' }}>Confirm Delete</h3>
            <p style={{ ...styles.modalText, fontSize: isMobile ? '13px' : '15px' }}>Are you sure you want to delete this prompt? This cannot be undone.</p>
            <div style={{ ...styles.modalBtnRow, flexDirection: isMobile ? 'column-reverse' : 'row', gap: isMobile ? '8px' : '12px' }}>
              <button className="interactive-btn" style={{ ...styles.modalBtnCancel, width: isMobile ? '100%' : 'auto', padding: isMobile ? '12px' : '10px 16px' }} onClick={() => { setDeleteConfirmOpen(false); setDeletingPromptId(null); }}>Cancel</button>
              <button className="interactive-btn" style={{ ...styles.modalBtnDelete, width: isMobile ? '100%' : 'auto', padding: isMobile ? '12px' : '10px 16px' }} onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {editModalOpen && createPortal(
        <div style={{ ...styles.modalOverlay, padding: isMobile ? '0' : '20px', alignItems: isMobile ? 'flex-end' : 'center' }}>
          <div style={{ ...styles.editModalCard, borderRadius: isMobile ? '16px 16px 0 0' : '16px', padding: isMobile ? '20px 16px' : '32px', maxWidth: isMobile ? '100%' : '560px' }}>
            <button style={styles.modalCloseBtn} onClick={closeEditModal}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
            <h3 style={{ ...styles.modalHeading, fontSize: isMobile ? '17px' : '20px' }}>Edit Prompt</h3>
            <form onSubmit={handleEditSubmit} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => { setEditTitle(e.target.value); setEditSlug(generateSlug(e.target.value)); }}
                  placeholder="E.g., Facebook Marketing Plan"
                  style={styles.urlInput}
                  required
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Slug (Auto-generated)</label>
                <input
                  type="text"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  placeholder="facebook-marketing-plan"
                  style={styles.urlInput}
                  required
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Short Description (Optional)</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="A brief description of what this prompt does..."
                  style={{ ...styles.textarea, height: '60px' }}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Image</label>

                {/* Toggle */}
                <div style={styles.sourceToggle}>
                  <button
                    type="button"
                    onClick={() => setEditImageSource('file')}
                    style={{
                      ...styles.sourceBtn,
                      ...(editImageSource === 'file' ? styles.sourceBtnActive : {}),
                    }}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditImageSource('url');
                      setEditImageUrl(editImagePreview || '');
                    }}
                    style={{
                      ...styles.sourceBtn,
                      ...(editImageSource === 'url' ? styles.sourceBtnActive : {}),
                    }}
                  >
                    Paste URL
                  </button>
                </div>

                {editImageSource === 'file' ? (
                  <div style={styles.editImageWrapper}>
                    <img src={editImagePreview} alt="Preview" style={styles.editPreviewImg} />
                    <button type="button" className="interactive-btn" style={styles.editChangeImgBtn} onClick={() => editFileInputRef.current?.click()}>Change Image</button>
                    <input ref={editFileInputRef} type="file" accept="image/*" onChange={handleEditImageSelect} style={{ display: 'none' }} />
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      style={{
                        ...styles.urlInput,
                        ...(editImageUrl && editImageUrl.trim() ? { borderColor: '#0a6b5e' } : {}),
                      }}
                    />
                    {editImageUrl && editImageUrl.trim() && (
                      <img
                        src={editImageUrl}
                        alt="URL preview"
                        style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '12px', marginTop: '12px' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                  </div>
                )}
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
        <div className={`toast-enter`} style={{
          position: 'fixed',
          bottom: isMobile ? '16px' : '24px',
          right: isMobile ? '12px' : '24px',
          left: isMobile ? '12px' : 'auto',
          background: toast.type === 'error' ? '#dc2626' : '#0d0d0d',
          color: '#ffffff',
          padding: isMobile ? '10px 14px' : '12px 20px',
          borderRadius: '10px',
          fontSize: isMobile ? '13px' : '14px',
          fontWeight: 500,
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 9999,
        }}>
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
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          width: 100%;
        }
        @media (min-width: 768px) {
          .admin-grid { 
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
        }
        @media (min-width: 1024px) {
          .admin-grid { 
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        }
        .nav-item-btn {
          transition: background 0.15s ease;
        }
        .nav-item-btn:hover:not([style*="background: #E1F5EE"]) {
          background: #f9fafb !important;
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
  passwordPage: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', fontFamily: "'DM Sans', sans-serif" },
  passwordCard: { background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '20px', padding: '40px 32px', maxWidth: '360px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 },
  lockIcon: { width: '52px', height: '52px', background: '#E1F5EE', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
  passwordHeading: { fontSize: '20px', fontWeight: 700, color: '#0d0d0d', margin: '0 0 6px 0' },
  passwordSubtext: { fontSize: '13px', color: '#6b7280', margin: '0 0 24px 0', textAlign: 'center' },
  passwordInput: { width: '100%', padding: '11px 14px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box' },
  passwordErrorMsg: { marginTop: '8px', fontSize: '12px', color: '#dc2626', textAlign: 'center', margin: '8px 0 0 0' },
  passwordBtn: { width: '100%', marginTop: '16px', background: '#0F6E56', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },

  /* ─── Admin App Shell ─── */
  appShell: { display: 'flex', height: '100vh', overflow: 'hidden', background: '#f9fafb', fontFamily: "'DM Sans', sans-serif" },
  sidebar: { top: 0, left: 0, height: '100vh', zIndex: 100, background: '#ffffff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', transition: 'transform 0.25s ease, width 0.25s ease', overflowX: 'hidden' },
  navSectionTitle: { fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '8px 16px 4px', fontWeight: 600, margin: 0 },
  navBadge: { marginLeft: 'auto', background: '#f3f4f6', color: '#4b5563', fontSize: '11px', padding: '2px 6px', borderRadius: '999px', fontWeight: 600 },
  avatar: { width: '28px', height: '28px', background: '#E1F5EE', color: '#0F6E56', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600 },
  userTextContainer: { flex: 1 },
  userName: { fontSize: '12px', fontWeight: 500, color: '#111827', margin: 0 },
  userRole: { fontSize: '10px', color: '#6b7280', margin: 0 },
  userOptionsBtn: { background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px' },
  mainWrapper: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  topbar: { background: '#ffffff', borderBottom: '1px solid #e5e7eb', height: '52px', display: 'flex', alignItems: 'center', padding: '0 20px', gap: '12px', flexShrink: 0 },
  topbarTitle: { fontSize: '13px', fontWeight: 500, color: '#111827', flex: 1, margin: 0 },
  topbarSearch: { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', width: '160px', outline: 'none' },
  topbarBell: { width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', color: '#6b7280' },
  topbarAddBtn: { background: '#0F6E56', color: '#ffffff', fontSize: '12px', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 },
  mainContent: { flex: 1, overflowY: 'auto', padding: '24px' },

  /* ─── Add Prompt Form (card styles) ─── */
  card: { background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '32px', maxWidth: '600px', margin: '0 auto', width: '100%' },
  cardHeaderRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' },
  cardHeaderIcon: { width: '36px', height: '36px', background: '#0F6E56', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' },
  cardHeading: { fontSize: '16px', fontWeight: 600, color: '#0d0d0d', margin: '0 0 2px 0' },
  cardSubtitle: { fontSize: '12px', color: '#9ca3af', margin: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: '24px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' },

  /* ─── Upload area ─── */
  sourceToggle: { display: 'inline-flex', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px' },
  sourceBtn: { padding: '7px 16px', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', background: '#ffffff', color: '#6b7280', transition: 'all 0.15s ease', outline: 'none' },
  sourceBtnActive: { background: '#0F6E56', color: '#ffffff' },
  
  uploadArea: { width: '100%', height: '180px', border: '2px dashed #e5e7eb', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', overflow: 'hidden', background: '#fafafa' },
  uploadAreaHasImage: { border: '2px solid #e5e7eb', background: '#000' },
  uploadText: { fontSize: '13px', fontWeight: 500, color: '#374151' },
  uploadHint: { fontSize: '11px', color: '#9ca3af' },
  previewImg: { width: '100%', height: '100%', objectFit: 'contain' },
  
  urlInput: { width: '100%', padding: '10px 14px', fontSize: '13px', border: '1px solid #e5e7eb', borderRadius: '10px', outline: 'none', boxSizing: 'border-box' },

  /* ─── Textareas ─── */
  textarea: { width: '100%', height: '110px', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", outline: 'none', resize: 'vertical', boxSizing: 'border-box' },

  /* ─── Messages ─── */
  errorMsg: { color: '#dc2626', fontSize: '14px', fontWeight: 500, margin: '0', padding: '10px 14px', background: '#fef2f2', borderRadius: '10px', border: '1px solid #fecaca' },
  successMsg: { color: '#16a34a', fontSize: '14px', fontWeight: 500, margin: '0', padding: '10px 14px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' },

  /* ─── Submit button ─── */
  submitBtn: { width: '100%', padding: '12px', border: 'none', borderRadius: '10px', background: '#0F6E56', color: '#ffffff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', marginTop: '4px', fontFamily: "'DM Sans', sans-serif" },
  submitBtnDisabled: { background: '#d1d5db', cursor: 'not-allowed' },

  /* ─── Manage Section ─── */
  /* ─── Manage Prompts ─── */
  manageSection: { width: '100%' },
  manageHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  manageHeading: { fontSize: '14px', fontWeight: 500, color: '#0d0d0d', margin: 0 },
  manageSubtitle: { fontSize: '11px', color: '#9ca3af', marginTop: '2px', margin: 0 },
  refreshBtn: { width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#ffffff', cursor: 'pointer' },
  searchFilterRow: { display: 'flex', gap: '8px', marginBottom: '16px' },
  searchInput: { flex: 1, padding: '8px 12px', fontSize: '13px', border: '1px solid #e5e7eb', borderRadius: '8px', outline: 'none' },
  filterBtn: { padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#ffffff', fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' },
  
  newSkeletonCard: { height: '260px', borderRadius: '12px', background: '#f3f4f6' },
  newGridCard: { background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  gridImageArea: { height: '180px', position: 'relative' },
  gridImgCover: { width: '100%', height: '100%', objectFit: 'cover', background: '#f3f4f6' },
  typeBadge: { position: 'absolute', top: '8px', left: '8px', background: '#0F6E56', color: '#ffffff', fontSize: '9px', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 },
  gridBody: { padding: '10px 12px', flex: 1 },
  promptPreview: { fontSize: '11px', color: '#6b7280', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '26px' },
  gridMetaRow: { display: 'flex', gap: '12px', marginTop: '6px' },
  metaItem: { fontSize: '10px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' },
  gridActionsRow: { padding: '8px 12px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '8px' },
  newBtnEdit: { flex: 1, padding: '6px', border: '1.5px solid #0F6E56', color: '#0F6E56', background: 'transparent', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' },
  newBtnDelete: { flex: 1, padding: '6px', border: '1.5px solid #dc2626', color: '#dc2626', background: 'transparent', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' },

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
