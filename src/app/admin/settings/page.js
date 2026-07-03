"use client";
import { useEffect, useState } from 'react';
import styles from '../admin.module.css';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/components/ToastProvider';

const TABS = [
  { id: 'general',  label: 'General',   icon: 'fas fa-sliders-h' },
  { id: 'crypto',   label: 'Crypto',    icon: 'fas fa-coins' },
  { id: 'referral', label: 'Referral',  icon: 'fas fa-share-alt' },
  { id: 'security', label: 'Security',  icon: 'fas fa-shield-alt' },
];

export default function AdminSettingsPage() {
  const [rate, setRate] = useState(102);
  const [depositMin, setDepositMin] = useState(100);
  const [withdrawMin, setWithdrawMin] = useState(50);

  const [trc20Address, setTrc20Address] = useState('');
  const [erc20Address, setErc20Address] = useState('');
  const [trc20QrUrl, setTrc20QrUrl] = useState('');
  const [erc20QrUrl, setErc20QrUrl] = useState('');

  const [referralLevel1, setReferralLevel1] = useState(0.1);
  const [referralLevel2, setReferralLevel2] = useState(0.03);
  const [referralLevel3, setReferralLevel3] = useState(0.02);
  const [referralLevel4, setReferralLevel4] = useState(0.01);
  const [referralLevel5, setReferralLevel5] = useState(0.01);

  const [adminEmail, setAdminEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updatingSecurity, setUpdatingSecurity] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const [settingsRes, profileRes] = await Promise.all([
        fetch('/api/admin/settings'),
        fetch('/api/admin/profile'),
      ]);
      if (settingsRes.status === 401 || profileRes.status === 401) {
        return router.replace('/admin/login');
      }
      const settingsData = await settingsRes.json();
      if (settingsData.settings) {
        const s = settingsData.settings;
        setRate(s.rate);
        setDepositMin(s.depositMin);
        setWithdrawMin(s.withdrawMin);
        setTrc20Address(s.trc20Address || '');
        setErc20Address(s.erc20Address || '');
        setTrc20QrUrl(s.trc20QrUrl || '');
        setErc20QrUrl(s.erc20QrUrl || '');
        if (s.referralLevel1 !== undefined) setReferralLevel1(s.referralLevel1);
        if (s.referralLevel2 !== undefined) setReferralLevel2(s.referralLevel2);
        if (s.referralLevel3 !== undefined) setReferralLevel3(s.referralLevel3);
        if (s.referralLevel4 !== undefined) setReferralLevel4(s.referralLevel4);
        if (s.referralLevel5 !== undefined) setReferralLevel5(s.referralLevel5);
      }
      const profileData = await profileRes.json();
      if (profileData.success && profileData.admin) {
        setAdminEmail(profileData.admin.email || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!trc20Address || !erc20Address) {
      showToast('Both TRC20 and ERC20 addresses are required', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        rate: parseFloat(rate) || 0,
        depositMin: parseFloat(depositMin) || 0,
        withdrawMin: parseFloat(withdrawMin) || 0,
        trc20Address, erc20Address, trc20QrUrl, erc20QrUrl,
        referralLevel1: parseFloat(referralLevel1) || 0,
        referralLevel2: parseFloat(referralLevel2) || 0,
        referralLevel3: parseFloat(referralLevel3) || 0,
        referralLevel4: parseFloat(referralLevel4) || 0,
        referralLevel5: parseFloat(referralLevel5) || 0,
      };
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Settings updated successfully ✅', 'success');
        fetchSettings();
      } else {
        showToast(data.error || 'Failed to update settings', 'error');
      }
    } catch (err) {
      showToast('Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSecurity = async () => {
    if (!currentPassword) {
      showToast('Current password is required', 'error');
      return;
    }
    setUpdatingSecurity(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newEmail: adminEmail, newPassword: newPassword || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Security settings updated ✅', 'success');
        setCurrentPassword('');
        setNewPassword('');
        if (data.emailChanged) {
          showToast('Email changed! Please login again.', 'success');
          setTimeout(() => router.push('/admin/login'), 2000);
        } else {
          fetchSettings();
        }
      } else {
        showToast(data.error || 'Failed to update security settings', 'error');
      }
    } catch (err) {
      showToast('Failed to update security settings', 'error');
    } finally {
      setUpdatingSecurity(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        Loading settings...
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Settings</h1>
          <p className={styles.pageSubtitle}>Configure platform settings and preferences</p>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.activeTab : ''}`}
          >
            <i className={tab.icon} style={{ marginRight: '7px' }} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={styles.sectionCard}>
        <div style={{ padding: '28px 24px', maxWidth: '640px' }}>

          {/* ── GENERAL ── */}
          {activeTab === 'general' && (
            <>
              <div className={styles.settingsSectionTitle}>
                <i className="fas fa-sliders-h" style={{ color: '#6366f1' }} />
                Transaction Settings
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <i className="fas fa-chart-line" style={{ marginRight: '6px', color: '#22c55e' }} />
                  Exchange Rate (per USDT in ₹)
                </label>
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                  className={styles.input}
                  step="0.01"
                  placeholder="e.g. 102"
                />
                <p className={styles.formHint}>Exchange rate for USDT to INR conversion</p>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <i className="fas fa-arrow-down" style={{ marginRight: '6px', color: '#38bdf8' }} />
                  Minimum Deposit Amount (USDT)
                </label>
                <input
                  type="number"
                  value={depositMin}
                  onChange={(e) => setDepositMin(parseFloat(e.target.value) || 0)}
                  className={styles.input}
                  step="1"
                  placeholder="e.g. 100"
                />
                <p className={styles.formHint}>Minimum USDT amount users can deposit</p>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <i className="fas fa-arrow-up" style={{ marginRight: '6px', color: '#f59e0b' }} />
                  Minimum Withdrawal Amount (USDT)
                </label>
                <input
                  type="number"
                  value={withdrawMin}
                  onChange={(e) => setWithdrawMin(parseFloat(e.target.value) || 0)}
                  className={styles.input}
                  step="1"
                  placeholder="e.g. 50"
                />
                <p className={styles.formHint}>Minimum USDT amount users can withdraw</p>
              </div>

              <SaveBar onSave={handleSave} saving={saving} />
            </>
          )}

          {/* ── CRYPTO ── */}
          {activeTab === 'crypto' && (
            <>
              <div className={styles.settingsSectionTitle}>
                <i className="fas fa-coins" style={{ color: '#f59e0b' }} />
                Crypto Wallet Addresses
              </div>

              <div className={styles.infoCard}>
                <i className="fas fa-info-circle" style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }} />
                <span>These wallet addresses and QR codes will be shown to users when they make a deposit.</span>
              </div>

              <NetworkField label="TRC20 Address" icon="fas fa-network-wired" iconColor="#f59e0b"
                value={trc20Address} onChange={setTrc20Address} placeholder="Enter TRC20 wallet address"
                qrUrl={trc20QrUrl} onQrChange={setTrc20QrUrl} qrLabel="TRC20 QR Code" />

              <div style={{ height: '24px' }} />

              <NetworkField label="ERC20 Address" icon="fas fa-network-wired" iconColor="#38bdf8"
                value={erc20Address} onChange={setErc20Address} placeholder="Enter ERC20 wallet address"
                qrUrl={erc20QrUrl} onQrChange={setErc20QrUrl} qrLabel="ERC20 QR Code" />

              <SaveBar onSave={handleSave} saving={saving} />
            </>
          )}

          {/* ── REFERRAL ── */}
          {activeTab === 'referral' && (
            <>
              <div className={styles.settingsSectionTitle}>
                <i className="fas fa-share-alt" style={{ color: '#a855f7' }} />
                Referral Commission Rates
              </div>

              <div className={styles.infoCard}>
                <i className="fas fa-info-circle" style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }} />
                <span>Set the commission percentage each referral level earns when their subordinate completes a transaction.</span>
              </div>

              {[
                { label: 'Level 1 — Direct Referrer',    emoji: '🥇', val: referralLevel1, set: setReferralLevel1 },
                { label: 'Level 2 — 2nd Upline',         emoji: '🥈', val: referralLevel2, set: setReferralLevel2 },
                { label: 'Level 3 — 3rd Upline',         emoji: '🥉', val: referralLevel3, set: setReferralLevel3 },
                { label: 'Level 4 — 4th Upline',         emoji: '4️⃣', val: referralLevel4, set: setReferralLevel4 },
                { label: 'Level 5 — 5th Upline',         emoji: '5️⃣', val: referralLevel5, set: setReferralLevel5 },
              ].map((lvl, i) => (
                <div key={i} className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {lvl.emoji}&nbsp; {lvl.label} <span style={{ color: '#636b80', fontWeight: 400 }}>(%)</span>
                  </label>
                  <input
                    type="number"
                    value={lvl.val}
                    onChange={(e) => lvl.set(e.target.value)}
                    className={styles.input}
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0.00"
                  />
                </div>
              ))}

              <SaveBar onSave={handleSave} saving={saving} />
            </>
          )}

          {/* ── SECURITY ── */}
          {activeTab === 'security' && (
            <>
              <div className={styles.settingsSectionTitle}>
                <i className="fas fa-shield-alt" style={{ color: '#ef4444' }} />
                Admin Credentials
              </div>

              <div className={styles.infoCard}>
                <i className="fas fa-lock" style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                <span>Update your admin email or password. You must enter your current password to confirm any changes.</span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <i className="fas fa-envelope" style={{ marginRight: '6px', color: '#38bdf8' }} />
                  Admin Email
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className={styles.input}
                  placeholder="admin@example.com"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <i className="fas fa-key" style={{ marginRight: '6px', color: '#a855f7' }} />
                  New Password <span style={{ color: '#636b80', fontWeight: 400 }}>(Optional)</span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={styles.input}
                  placeholder="Leave blank to keep current password"
                />
                <p className={styles.formHint}>Must be at least 8 characters</p>
              </div>

              <div className={styles.formGroup} style={{
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                borderRadius: '12px',
                padding: '16px',
                marginTop: '8px',
              }}>
                <label className={styles.formLabel} style={{ color: '#f87171' }}>
                  <i className="fas fa-exclamation-triangle" style={{ marginRight: '6px' }} />
                  Current Password <span style={{ fontWeight: 400 }}>(Required to save)</span>
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={styles.input}
                  placeholder="Enter your current password to confirm"
                />
              </div>

              <div style={{ marginTop: '20px' }}>
                <button
                  onClick={handleUpdateSecurity}
                  disabled={updatingSecurity || !currentPassword}
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  style={{ opacity: !currentPassword ? 0.5 : 1 }}
                >
                  {updatingSecurity
                    ? <><i className="fas fa-spinner fa-spin" /> Updating...</>
                    : <><i className="fas fa-shield-alt" /> Update Security Settings</>
                  }
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Helper: Save Bar ── */
function SaveBar({ onSave, saving }) {
  return (
    <div style={{
      marginTop: '28px',
      paddingTop: '20px',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      justifyContent: 'flex-end',
    }}>
      <button
        onClick={onSave}
        disabled={saving}
        className={`${styles.btn} ${styles.btnPrimary}`}
      >
        {saving
          ? <><i className="fas fa-spinner fa-spin" /> Saving...</>
          : <><i className="fas fa-save" /> Save Changes</>
        }
      </button>
    </div>
  );
}

/* ── Helper: Network Field (address + QR) ── */
function NetworkField({ label, icon, iconColor, value, onChange, placeholder, qrUrl, onQrChange, qrLabel }) {
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => onQrChange(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '13px', fontWeight: 600, color: '#a0aec0', marginBottom: '8px',
        }}>
          <i className={icon} style={{ color: iconColor }} />
          {label}
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '11px 14px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.07)',
            fontSize: '13px',
            fontFamily: 'monospace',
            color: '#f0f2ff',
            background: '#0f111a',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => { e.target.style.borderColor = '#6366f1'; }}
          onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; }}
        />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#a0aec0', marginBottom: '8px' }}>
          {qrLabel}
        </label>
        {qrUrl && (
          <div style={{ marginBottom: '10px', position: 'relative', display: 'inline-block' }}>
            <img
              src={qrUrl}
              alt={qrLabel}
              style={{
                width: '120px', height: '120px', objectFit: 'cover',
                borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                display: 'block',
              }}
            />
            <button
              onClick={() => onQrChange('')}
              style={{
                position: 'absolute', top: '-8px', right: '-8px',
                width: '22px', height: '22px',
                background: '#ef4444', border: 'none', borderRadius: '50%',
                color: 'white', fontSize: '10px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <i className="fas fa-times" />
            </button>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
          style={{
            display: 'block',
            fontSize: '13px',
            color: '#636b80',
            background: '#0f111a',
            border: '1px dashed rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '8px 12px',
            cursor: 'pointer',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
      </div>
    </div>
  );
}
