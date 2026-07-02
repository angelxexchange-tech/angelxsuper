"use client";
import { useEffect, useState } from 'react';
import styles from '../admin.module.css';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/components/ToastProvider';

export default function AdminSettingsPage() {
  const [rate, setRate] = useState(102);
  const [depositMin, setDepositMin] = useState(100);
  const [withdrawMin, setWithdrawMin] = useState(50);
  
  // Crypto Settings
  const [trc20Address, setTrc20Address] = useState("");
  const [erc20Address, setErc20Address] = useState("");
  const [trc20QrUrl, setTrc20QrUrl] = useState("");
  const [erc20QrUrl, setErc20QrUrl] = useState("");

  // Security Settings
  const [adminEmail, setAdminEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [updatingSecurity, setUpdatingSecurity] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const router = useRouter();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const [settingsRes, profileRes] = await Promise.all([
        fetch('/api/admin/settings'),
        fetch('/api/admin/profile')
      ]);

      if (settingsRes.status === 401 || profileRes.status === 401) {
        return router.replace('/admin/login');
      }

      const settingsData = await settingsRes.json();
      if (settingsData.settings) {
        setRate(settingsData.settings.rate);
        setDepositMin(settingsData.settings.depositMin);
        setWithdrawMin(settingsData.settings.withdrawMin);
        setTrc20Address(settingsData.settings.trc20Address || "");
        setErc20Address(settingsData.settings.erc20Address || "");
        setTrc20QrUrl(settingsData.settings.trc20QrUrl || "");
        setErc20QrUrl(settingsData.settings.erc20QrUrl || "");
      }

      const profileData = await profileRes.json();
      if (profileData.success && profileData.admin) {
        setAdminEmail(profileData.admin.email || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const { showToast } = useToast();

  const handleSave = async () => {
    // Validate before sending
    if (!trc20Address || !erc20Address) {
      showToast('❌ Both TRC20 and ERC20 addresses are required', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = { 
        rate: parseFloat(rate) || 0,
        depositMin: parseFloat(depositMin) || 0,
        withdrawMin: parseFloat(withdrawMin) || 0,
        trc20Address: trc20Address || "",
        erc20Address: erc20Address || "",
        trc20QrUrl: trc20QrUrl || "",
        erc20QrUrl: erc20QrUrl || ""
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
      console.error(err);
      showToast('Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSecurity = async () => {
    if (!currentPassword) {
      showToast('❌ Current password is required to make changes', 'error');
      return;
    }

    setUpdatingSecurity(true);
    try {
      const payload = {
        currentPassword,
        newEmail: adminEmail,
        newPassword: newPassword || undefined
      };

      const res = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        showToast('Security settings updated successfully ✅', 'success');
        setCurrentPassword("");
        setNewPassword("");
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
      console.error(err);
      showToast('Failed to update security settings', 'error');
    } finally {
      setUpdatingSecurity(false);
    }
  };

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <>
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "4px", color: "#111827" }}>Settings</h2>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>Configure platform settings and preferences</p>
      </div>

      <div className={styles.sectionCard} style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", overflowX: "auto" }}>
            <button 
              onClick={() => setActiveTab('general')}
              style={{ 
                padding: "16px 24px", 
                fontWeight: 500, 
                color: activeTab === 'general' ? "#2563eb" : "#4b5563", 
                borderBottom: activeTab === 'general' ? "2px solid #2563eb" : "none",
                background: "none",
                border: "none",
                cursor: "pointer"
              }}
            >
              General
            </button>
            <button 
              onClick={() => setActiveTab('crypto')}
              style={{ 
                padding: "16px 24px", 
                fontWeight: 500, 
                color: activeTab === 'crypto' ? "#2563eb" : "#4b5563", 
                borderBottom: activeTab === 'crypto' ? "2px solid #2563eb" : "none",
                background: "none",
                border: "none",
                cursor: "pointer"
              }}
            >
              Crypto
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              style={{ 
                padding: "16px 24px", 
                fontWeight: 500, 
                color: activeTab === 'security' ? "#2563eb" : "#4b5563", 
                borderBottom: activeTab === 'security' ? "2px solid #2563eb" : "none",
                background: "none",
                border: "none",
                cursor: "pointer"
              }}
            >
              Security
            </button>
          </div>
        </div>

        <div style={{ padding: "24px" }}>
          {activeTab === 'general' && (
            <div style={{ maxWidth: "600px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px", color: "#111827" }}>Transaction Settings</h3>
              
              <div className={styles.formGroup}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <label className={styles.formLabel} style={{ marginBottom: 0 }}>📊 Rate (per USDT in ₹)</label>
                </div>
                <input 
                  type="number" 
                  value={rate} 
                  onChange={(e) => setRate(parseFloat(e.target.value) || 0)} 
                  className={styles.formInput}
                  step="0.01"
                />
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: 4 }}>Exchange rate for USDT to INR conversion</p>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>� Minimum Deposit Amount (USDT)</label>
                <input 
                  type="number" 
                  value={depositMin} 
                  onChange={(e) => setDepositMin(parseFloat(e.target.value) || 0)} 
                  className={styles.formInput}
                  step="1"
                />
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: 4 }}>Minimum USDT amount users can deposit in one transaction</p>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>💳 Minimum Withdrawal Amount (USDT)</label>
                <input 
                  type="number" 
                  value={withdrawMin} 
                  onChange={(e) => setWithdrawMin(parseFloat(e.target.value) || 0)} 
                  className={styles.formInput}
                  step="1"
                />
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: 4 }}>Minimum USDT amount users can withdraw to their bank account</p>
              </div>

              <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid #e5e7eb" }}>
                <button 
                  onClick={handleSave} 
                  disabled={saving}
                  className={styles.viewAllBtn}
                  style={{ padding: "10px 20px", fontSize: "14px" }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'crypto' && (
            <div style={{ maxWidth: "600px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px", color: "#111827" }}>Crypto Settings</h3>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>TRC20 Address</label>
                <input 
                  type="text" 
                  value={trc20Address} 
                  onChange={(e) => setTrc20Address(e.target.value)} 
                  className={styles.formInput}
                  placeholder="Enter TRC20 Wallet Address"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>TRC20 QR Code</label>
                {trc20QrUrl && (
                  <div style={{ marginBottom: "10px" }}>
                    <img src={trc20QrUrl} alt="TRC20 QR" style={{ maxWidth: "150px", borderRadius: "8px" }} />
                  </div>
                )}
                <input 
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setTrc20QrUrl(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }} 
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>ERC20 Address</label>
                <input 
                  type="text" 
                  value={erc20Address} 
                  onChange={(e) => setErc20Address(e.target.value)} 
                  className={styles.formInput}
                  placeholder="Enter ERC20 Wallet Address"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>ERC20 QR Code</label>
                {erc20QrUrl && (
                  <div style={{ marginBottom: "10px" }}>
                    <img src={erc20QrUrl} alt="ERC20 QR" style={{ maxWidth: "150px", borderRadius: "8px" }} />
                  </div>
                )}
                <input 
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setErc20QrUrl(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }} 
                  className={styles.formInput}
                />
              </div>

              <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid #e5e7eb" }}>
                <button 
                  onClick={handleSave} 
                  disabled={saving}
                  className={styles.viewAllBtn}
                  style={{ padding: "10px 20px", fontSize: "14px" }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div style={{ maxWidth: "600px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px", color: "#111827" }}>Admin Credentials</h3>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Admin Email</label>
                <input 
                  type="email" 
                  value={adminEmail} 
                  onChange={(e) => setAdminEmail(e.target.value)} 
                  className={styles.formInput}
                  placeholder="admin@example.com"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>New Password (Optional)</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  className={styles.formInput}
                  placeholder="Leave blank to keep current password"
                />
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: 4 }}>Must be at least 8 characters</p>
              </div>

              <div className={styles.formGroup} style={{ marginTop: "24px" }}>
                <label className={styles.formLabel} style={{ color: "#b91c1c" }}>Current Password (Required to save changes)</label>
                <input 
                  type="password" 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)} 
                  className={styles.formInput}
                  placeholder="Enter your current password to confirm"
                  style={{ border: "1px solid #fca5a5", backgroundColor: "#fef2f2" }}
                />
              </div>

              <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid #e5e7eb" }}>
                <button 
                  onClick={handleUpdateSecurity} 
                  disabled={updatingSecurity || !currentPassword}
                  className={styles.viewAllBtn}
                  style={{ padding: "10px 20px", fontSize: "14px", backgroundColor: currentPassword ? "#2563eb" : "#9ca3af" }}
                >
                  {updatingSecurity ? 'Updating...' : 'Update Security Settings'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
