'use client'
import React, { useState, useEffect } from 'react';

//import Image from "next/image";
import Link from 'next/link';
import Footer from '../components/footer';


export default function DemoPage() {
  const [referralData, setReferralData] = useState(null);
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [codeRes, earningsRes] = await Promise.all([
          fetch('/api/referral/my-code', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/referral/earnings', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (codeRes.ok) {
          const codeData = await codeRes.json();
          setReferralData(codeData);
        }
        if (earningsRes.ok) {
          const earningsData = await earningsRes.json();
          setEarnings(earningsData.earnings || []);
        }
      } catch (err) {
        console.error('Failed to fetch referral data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const hasReferrals = referralData && (referralData.directReferrals > 0 || earnings.length > 0);
  
  return (
    <div>
      <main>
        <div className="page-wrappers empty-page  full-height">

  <div className="page-wrapperss page-wrapper-ex page-wrapper-login page-wrapper-loginacc form-wrapper">
    <div className="brdc">
      <div className="back-btn">
        <Link href="/home">
          <img src="images/back-btn.png" />
        </Link>
      </div>
      <h3>Referals</h3>
    </div>
    <section className="section-1a banner-img">
      <div className="image">
        <img src="images/ref-img.jpg" style={{"width":"100%"}} />
      </div>
    </section>

    {loading ? (
      <section className="section-1">
        <div style={{textAlign: "center", padding: "20px", color: "#888"}}>Loading...</div>
      </section>
    ) : hasReferrals ? (
      <>
        {/* Referral Stats */}
        <div className="pricerefBx" style={{marginBottom: "10px"}}>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px"}}>
            <div>
              <p style={{fontSize: "12px", color: "#888", margin: 0}}>Your Code</p>
              <p style={{fontSize: "16px", fontWeight: "bold", margin: "4px 0", letterSpacing: "2px"}}>{referralData?.referralCode}</p>
            </div>
            <div style={{textAlign: "center"}}>
              <p style={{fontSize: "12px", color: "#888", margin: 0}}>Referrals</p>
              <p style={{fontSize: "16px", fontWeight: "bold", margin: "4px 0"}}>{referralData?.directReferrals || 0}</p>
            </div>
            <div style={{textAlign: "right"}}>
              <p style={{fontSize: "12px", color: "#888", margin: 0}}>Earnings</p>
              <p style={{fontSize: "16px", fontWeight: "bold", margin: "4px 0", color: "#10a992"}}>{(referralData?.totalEarnings || 0).toFixed(4)}</p>
            </div>
          </div>
        </div>

        {/* Referred Users */}
        {referralData?.referredUsers?.length > 0 && (
          <div className="pricerefBx pricerefBx-01" style={{marginBottom: "10px"}}>
            <h4><b>Invited Users</b></h4>
            <table width="100%">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {referralData.referredUsers.map((u, i) => (
                  <tr key={i}>
                    <td>{u.fullName || u.email}</td>
                    <td>{new Date(u.joinedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Earnings History */}
        {earnings.length > 0 && (
          <div className="pricerefBx pricerefBx-01">
            <h4><b>Earnings History</b></h4>
            <table width="100%">
              <thead>
                <tr>
                  <th>From</th>
                  <th>Level</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {earnings.map((e, i) => (
                  <tr key={i}>
                    <td>{e.fromUser?.fullName || e.fromUser?.email || 'User'}</td>
                    <td>L{e.level}</td>
                    <td style={{color: "#10a992"}}>{e.amount.toFixed(4)}</td>
                    <td>{new Date(e.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>
    ) : (
      <section className="section-1">
        <div className="image">
          <img src="images/empty.jpg" />
        </div>
      </section>
    )}
  </div>
</div>

<Footer></Footer>

      </main>    
    </div>
  );
}

