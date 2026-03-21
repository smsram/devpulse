import React, { useState } from 'react';
import './Messages.css';

export default function Messages() {
  const [selectedId, setSelectedId] = useState(1);

  const inbox = [
    {
      id: 1,
      sender: "Sarah Chen",
      role: "Engineering Manager",
      subject: "Collaboration Opportunity",
      time: "10:24 AM",
      unread: true,
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCh_0hAg5Fn8P2UkWlo2WhRDQPOTUPlnJExKvqIzocyWCLK7_2HWj_j3h1HhY9OEkyvubF1SmjKzbP_fHC5KsDaQHOQ07BzvgxZYeHtqaeNePvXR1gQxse0hzqKQul4GRw2sxU_D_aIp5mb6Rr9FmUdKEU70BuMbkvGxb8iss972kl_qI_-BOBv_VL26B8iRZ9247A6HLGWanTxSp2VgEcAlJtkj64nXkRrABRvavmr1cvyv0mmSu9DHPNsNxZPN0f1LzafXyihkoW1",
      body: "Hi Alex, I saw your Pulsar Engine core repository on DevPulse. We're looking for someone with deep asynchronous event processing knowledge for our upcoming infrastructure project. Would you be open to a quick sync next Tuesday?"
    },
    {
      id: 2,
      sender: "Jordan Smith",
      role: "Technical Recruiter",
      subject: "Your Portfolio",
      time: "Yesterday",
      unread: false,
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCM965NpzTsiJyX6gkgroT2NQMwoz6r_pAGM3ZSF0-GUbKk9dxG-Htb0zfXfF2ZFntu_gIXvuxvAAj7gbYveAw5DCTRe4FPpwO__iuQWLkh9MYA5L35VIRHe5aiQydYn4aup2HTmhtWE7RkF7Xg_lvImsoDiLG8XrGJuVtEXcjISANX-XtS2skdlIIyKIltgWzVs7kNkyFQ-Qc--eTpyq1TByY2cnlz2XYCGLGPQeRhFxtjky0Bct8m8GrRDoTKA72AiMKHX6_KGvPC",
      body: "Hey Alex! Your DevPulse profile caught our eye. The way you've visualized your skill growth is exactly what we look for in transparent engineering cultures. Are you currently exploring new roles?"
    },
    {
      id: 3,
      sender: "Lena Vo",
      role: "Security Specialist",
      subject: "Security Audit feedback",
      time: "Oct 12",
      unread: false,
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAPgO171rZjfJgoVPU4TUV3rb71VgIM07rOOiqL98yVziamUKdfgXJ88iDQZJX4W5cAixcS3MMQCa35nVSoCOlkpgXY8azZ-RBUa6LVMJFokn6MEWFVu0-9U4kU49cjk_zbn_HkIrf2_GQNYKKZV7ONgTX_WHi5h7j_7JrWzTT0RZumryX0yN47C6HUPHh8D0oe7b3uiM1oEcKs39s2yuuXlopXR3VHiAItTqJUjgSopYs1cokLH5uHYyx7OOQXppm8AIvWolS8lcNO",
      body: "Just finished reviewing the Nexus Data Sync repo. I've found a few minor edge cases in the CRDT conflict resolution logic. I've attached a detailed PDF with my findings. Great work on the architecture overall!"
    }
  ];

  const activeMsg = inbox.find(m => m.id === selectedId);

  return (
    <div className="messages-wrapper">
      <header className="messages-header">
        <div>
          <nav className="breadcrumb-nav">
            <span>Dashboard</span>
            <span className="separator">/</span>
            <span className="active">Messages</span>
          </nav>
          <h2 className="page-title">Inbox</h2>
        </div>
        <button className="btn-new-msg">
          <span className="material-symbols-outlined">edit_square</span>
          New Message
        </button>
      </header>

      <div className="inbox-container">
        {/* Master List: Sidebar within the card */}
        <aside className="message-list">
          <div className="list-search">
            <span className="material-symbols-outlined">search</span>
            <input type="text" placeholder="Search inbox..." />
          </div>
          <div className="list-scroll">
            {inbox.map((msg) => (
              <div 
                key={msg.id} 
                className={`msg-preview ${selectedId === msg.id ? 'active' : ''} ${msg.unread ? 'unread' : ''}`}
                onClick={() => setSelectedId(msg.id)}
              >
                <img src={msg.avatar} alt={msg.sender} className="msg-avatar" />
                <div className="msg-info">
                  <div className="msg-header-row">
                    <span className="sender-name">{msg.sender}</span>
                    <span className="msg-time">{msg.time}</span>
                  </div>
                  <p className="msg-subject">{msg.subject}</p>
                  <p className="msg-snippet">{msg.body.substring(0, 60)}...</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Detail View: Reading pane */}
        <section className="message-detail">
          {activeMsg ? (
            <>
              <div className="detail-header">
                <div className="sender-profile">
                  <img src={activeMsg.avatar} alt={activeMsg.sender} className="detail-avatar" />
                  <div>
                    <h3 className="detail-name">{activeMsg.sender}</h3>
                    <p className="detail-role">{activeMsg.role}</p>
                  </div>
                </div>
                <div className="detail-actions">
                  <button className="icon-btn"><span className="material-symbols-outlined">star</span></button>
                  <button className="icon-btn"><span className="material-symbols-outlined">reply</span></button>
                  <button className="icon-btn"><span className="material-symbols-outlined">delete</span></button>
                </div>
              </div>
              <div className="detail-content">
                <h1 className="detail-subject">{activeMsg.subject}</h1>
                <p className="detail-timestamp">Sent on {activeMsg.time === 'Yesterday' ? 'October 19, 2026' : 'Today, 10:24 AM'}</p>
                <div className="detail-body">
                  <p>{activeMsg.body}</p>
                </div>
              </div>
              <div className="detail-reply">
                <div className="reply-box">
                  <textarea placeholder={`Reply to ${activeMsg.sender}...`}></textarea>
                  <div className="reply-toolbar">
                    <div className="tools">
                      <button className="icon-btn"><span className="material-symbols-outlined">attach_file</span></button>
                      <button className="icon-btn"><span className="material-symbols-outlined">image</span></button>
                    </div>
                    <button className="btn-send">
                      Send Reply
                      <span className="material-symbols-outlined">send</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <span className="material-symbols-outlined">mail</span>
              <p>Select a message to read</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}