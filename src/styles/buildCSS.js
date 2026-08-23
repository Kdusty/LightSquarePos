export const buildCSS = (dark) => `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=JetBrains+Mono:wght@400;500;600&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

:root {
  --bg:          ${dark?"#0F0E1A":"#F7F6FF"};
  --bg2:         ${dark?"#17162A":"#EEF0FF"};
  --surface:     ${dark?"#1F1E35":"#FFFFFF"};
  --surface2:    ${dark?"#272546":"#F0EFFE"};
  --surface3:    ${dark?"#302E58":"#E8E6FD"};
  --border:      ${dark?"rgba(255,255,255,.07)":"rgba(91,79,233,.12)"};
  --border2:     ${dark?"rgba(255,255,255,.13)":"rgba(91,79,233,.22)"};
  --text:        ${dark?"#F0EFFF":"#1A1830"};
  --text2:       ${dark?"#9B98C4":"#5C5880"};
  --text3:       ${dark?"#6B68A0":"#9896aa"};

  --accent:      #5B4FE9;
  --accent2:     #7C6FFB;
  --accent-hover:#4A3FD4;
  --accent-active:#3B31C0;
  --accent-glow: ${dark?"rgba(91,79,233,.35)":"rgba(91,79,233,.2)"};
  --accent-bg:   ${dark?"rgba(91,79,233,.15)":"rgba(91,79,233,.09)"};
  --accent-text: ${dark?"#a89fff":"#5B4FE9"};

  --green:       #22c55e;
  --green-bg:    ${dark?"rgba(34,197,94,.15)":"rgba(34,197,94,.1)"};
  --green-text:  #16a34a;

  --amber:       #f59e0b;
  --amber-bg:    ${dark?"rgba(245,158,11,.15)":"rgba(245,158,11,.1)"};
  --amber-text:  #d97706;

  --red:         #F43F5E;
  --red-bg:      ${dark?"rgba(244,63,94,.15)":"rgba(244,63,94,.1)"};
  --red-text:    #E11D48;

  --blue:        #3b82f6;
  --blue-bg:     ${dark?"rgba(59,130,246,.15)":"rgba(59,130,246,.1)"};

  /* Soft-modern shadows — the key to the "neumorphic feel without the flaws" */
  --sh-inset:    ${dark
    ?"inset 2px 2px 5px rgba(0,0,0,.4), inset -1px -1px 3px rgba(255,255,255,.04)"
    :"inset 2px 2px 6px rgba(0,0,0,.09), inset -2px -2px 6px rgba(255,255,255,.85)"};
  --sh-raised:   ${dark
    ?"2px 2px 8px rgba(0,0,0,.5), -1px -1px 4px rgba(255,255,255,.04)"
    :"3px 3px 8px rgba(0,0,0,.12), -2px -2px 6px rgba(255,255,255,.9)"};
  --sh-float:    ${dark
    ?"0 8px 32px rgba(0,0,0,.6), 0 2px 8px rgba(0,0,0,.4)"
    :"0 8px 32px rgba(0,0,0,.13), 0 2px 6px rgba(0,0,0,.06)"};
  --sh-glow:     0 0 0 3px var(--accent-glow);

  --r-xs: 6px; --r-sm: 10px; --r: 14px; --r-lg: 18px; --r-xl: 24px;
  --font: 'Bricolage Grotesque', sans-serif;
  --mono: 'JetBrains Mono', monospace;
  --sidebar-w: 228px;
  --sidebar-collapsed: 64px;
  --topbar-h: 58px;
  --transition: .22s cubic-bezier(.4,0,.2,1);
}

html,body,#root{height:100%;}
body{background:var(--bg);color:var(--text);font-family:var(--font);font-size:14px;line-height:1.5;-webkit-font-smoothing:antialiased;}
button{font-family:var(--font);cursor:pointer;}
input,select,textarea{font-family:var(--font);}
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:var(--surface3);border-radius:99px;}

/* ── Layout ── */
.app{display:flex;height:100vh;overflow:hidden;background:var(--bg);}

/* ── Sidebar ── */
.sidebar{
  width:var(--sidebar-w);
  background:var(--surface);
  border-right:1px solid var(--border);
  display:flex;flex-direction:column;
  flex-shrink:0;
  transition:width var(--transition);
  overflow:hidden;
  z-index:30;
}
.sidebar.collapsed{width:var(--sidebar-collapsed);}
.sb-inner{overflow:hidden;display:flex;flex-direction:column;flex:1;min-height:0;}

.sb-brand{
  height:var(--topbar-h);
  display:flex;align-items:center;gap:12px;
  padding:0 18px;
  border-bottom:1px solid var(--border);
  flex-shrink:0;
  overflow:hidden;
  white-space:nowrap;
}
.brand-logo{
  width:34px;height:34px;flex-shrink:0;
  background:linear-gradient(135deg,var(--accent),var(--accent2));
  border-radius:var(--r-sm);
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 4px 14px var(--accent-glow);
}
.brand-text{overflow:hidden;}
.brand-name{font-size:15px;font-weight:800;letter-spacing:-.4px;white-space:nowrap;}
.brand-tagline{font-size:10.5px;color:var(--text3);white-space:nowrap;}

.sb-toggle{
  width:32px;height:32px;
  background:var(--surface2);
  border:1px solid var(--border2);
  border-radius:var(--r-xs);
  display:flex;align-items:center;justify-content:center;
  color:var(--text2);
  box-shadow:var(--sh-raised);
  transition:all var(--transition);
  cursor:pointer;
  flex-shrink:0;
}
.sb-toggle:hover{background:var(--accent-bg);color:var(--accent-text);border-color:var(--accent);}

.sb-nav{flex:1;overflow-y:auto;padding:12px 10px;}
.sb-section{margin-bottom:6px;}
.sb-section-label{
  font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;
  color:var(--text3);padding:6px 10px 4px;
  white-space:nowrap;overflow:hidden;
  transition:opacity var(--transition);
}
.sidebar.collapsed .sb-section-label{opacity:0;}
.nav-item{
  display:flex;align-items:center;gap:11px;
  padding:9px 10px;border-radius:var(--r-sm);
  border:none;background:none;color:var(--text2);
  font-size:13.5px;font-weight:500;
  width:100%;text-align:left;cursor:pointer;
  transition:all var(--transition);
  white-space:nowrap;overflow:hidden;
  position:relative;
}
.nav-item:hover{background:var(--surface2);color:var(--text);}
.nav-item.active{
  background:var(--accent-bg);color:var(--accent-text);font-weight:700;
  box-shadow:var(--sh-raised);
}
.nav-item.active .nav-icon-wrap{color:var(--accent-text);}
.nav-icon-wrap{flex-shrink:0;display:flex;align-items:center;justify-content:center;width:22px;}
.nav-label{flex:1;overflow:hidden;white-space:nowrap;}
.nav-badge{
  background:var(--amber);color:white;
  font-size:10px;font-weight:800;
  padding:2px 7px;border-radius:99px;
  flex-shrink:0;
}
.sidebar.collapsed .nav-label,.sidebar.collapsed .nav-badge{display:none;}
.nav-tooltip{
  position:fixed;left:calc(var(--sidebar-collapsed) + 8px);
  background:var(--surface2);color:var(--text);
  font-size:12.5px;font-weight:600;
  padding:6px 12px;border-radius:var(--r-sm);
  border:1px solid var(--border2);
  box-shadow:var(--sh-float);
  pointer-events:none;
  white-space:nowrap;
  opacity:0;
  transition:opacity .15s;
  z-index:200;
}
.sidebar.collapsed .nav-item:hover .nav-tooltip{opacity:1;}

.sb-bottom{
  padding:10px;border-top:1px solid var(--border);flex-shrink:0;
}
.user-card{
  display:flex;align-items:center;gap:10px;
  padding:8px 10px;border-radius:var(--r-sm);
  overflow:hidden;white-space:nowrap;
}
.user-av{
  width:32px;height:32px;border-radius:99px;flex-shrink:0;
  background:linear-gradient(135deg,var(--accent),#9D8FFC);
  display:flex;align-items:center;justify-content:center;
  color:white;font-size:12px;font-weight:800;
}
.user-info{overflow:hidden;}
.user-name{font-size:13px;font-weight:700;}
.user-role{font-size:11px;color:var(--text3);}
.sidebar.collapsed .user-info{display:none;}
.lock-btn{
  display:flex;align-items:center;gap:6px;
  padding:6px 10px;border-radius:var(--r-sm);
  border:1px solid var(--border);background:none;
  color:var(--text3);font-size:11.5px;font-weight:600;
  cursor:pointer;transition:all var(--transition);width:100%;
  margin-top:6px;
}
.lock-btn:hover{background:var(--surface2);color:var(--red-text);border-color:rgba(244,63,94,.3);}
.sidebar.collapsed .lock-btn span{display:none;}

/* ── Lock Screen ── */
.lock-screen{
  position:fixed;inset:0;z-index:500;
  background:var(--bg);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:0;
  animation:ov-in .3s ease;
}
.lock-logo{
  display:flex;align-items:center;gap:12px;margin-bottom:36px;
}
.lock-logo-icon{
  width:52px;height:52px;border-radius:var(--r);
  background:linear-gradient(135deg,var(--accent),#9D8FFC);
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 8px 24px var(--accent-glow);
}
.lock-logo-text{font-size:26px;font-weight:900;letter-spacing:-.6px;}
.lock-tagline{font-size:14px;color:var(--text3);margin-bottom:40px;text-align:center;}

.lock-staff-grid{
  display:flex;gap:16px;flex-wrap:wrap;
  justify-content:center;max-width:520px;margin-bottom:40px;
}
.lock-staff-btn{
  display:flex;flex-direction:column;align-items:center;gap:10px;
  padding:20px 24px;border-radius:var(--r-lg);
  border:1.5px solid var(--border);background:var(--surface);
  cursor:pointer;transition:all var(--transition);
  box-shadow:var(--sh-raised);min-width:110px;
}
.lock-staff-btn:hover{border-color:var(--accent);transform:translateY(-2px);box-shadow:var(--sh-float);}
.lock-staff-btn.selected{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-glow),var(--sh-float);}
.lock-av{
  width:52px;height:52px;border-radius:99px;
  display:flex;align-items:center;justify-content:center;
  font-size:18px;font-weight:800;color:white;
}
.lock-av.owner  {background:linear-gradient(135deg,var(--accent),#9D8FFC);}
.lock-av.manager{background:linear-gradient(135deg,#22c55e,#16a34a);}
.lock-av.cashier{background:linear-gradient(135deg,#3b82f6,#2563eb);}
.lock-staff-name{font-size:13px;font-weight:700;text-align:center;}
.lock-staff-role{font-size:11px;color:var(--text3);}

.pin-panel{
  background:var(--surface);border:1px solid var(--border2);
  border-radius:var(--r-xl);padding:28px;
  box-shadow:var(--sh-float);width:320px;
  animation:md-in .2s ease;
}
.pin-title{font-size:14px;font-weight:700;text-align:center;margin-bottom:6px;}
.pin-subtitle{font-size:12px;color:var(--text3);text-align:center;margin-bottom:22px;}
.pin-dots{
  display:flex;gap:14px;justify-content:center;margin-bottom:24px;
}
.pin-dot{
  width:14px;height:14px;border-radius:99px;
  border:2px solid var(--border2);
  background:transparent;
  transition:all .15s ease;
}
.pin-dot.filled{background:var(--accent);border-color:var(--accent);}
.pin-dot.error{background:var(--red-text);border-color:var(--red-text);}
@keyframes pin-shake{0%,100%{transform:translateX(0);}25%{transform:translateX(-8px);}75%{transform:translateX(8px);}}
.pin-dots.shake{animation:pin-shake .3s ease;}
.pin-pad{
  display:grid;grid-template-columns:repeat(3,1fr);
  gap:10px;margin-bottom:16px;
}
.pin-key{
  height:56px;border-radius:var(--r-sm);
  border:1px solid var(--border);background:var(--surface2);
  font-size:20px;font-weight:700;color:var(--text);
  cursor:pointer;transition:all var(--transition);
  display:flex;align-items:center;justify-content:center;
  box-shadow:var(--sh-raised);
}
.pin-key:hover{background:var(--surface3);border-color:var(--border2);}
.pin-key:active{transform:scale(.94);box-shadow:none;}
.pin-key.del{font-size:14px;color:var(--text3);}
.pin-key.zero{grid-column:2;}
.pin-back-btn{
  font-size:12.5px;color:var(--text3);background:none;border:none;
  cursor:pointer;display:block;margin:0 auto;
  font-weight:600;padding:4px 12px;
}
.pin-back-btn:hover{color:var(--text);}

/* ── Staff Management (Settings tab) ── */
.staff-list{display:flex;flex-direction:column;gap:10px;}
.staff-card{
  background:var(--surface);border:1px solid var(--border);
  border-radius:var(--r);padding:14px 16px;
  display:flex;align-items:center;gap:14px;
  box-shadow:var(--sh-raised);
  transition:opacity var(--transition);
}
.staff-card.inactive{opacity:.5;}
.staff-av-lg{
  width:42px;height:42px;border-radius:99px;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  font-size:15px;font-weight:800;color:white;
}
.staff-av-lg.owner  {background:linear-gradient(135deg,var(--accent),#9D8FFC);}
.staff-av-lg.manager{background:linear-gradient(135deg,#22c55e,#16a34a);}
.staff-av-lg.cashier{background:linear-gradient(135deg,#3b82f6,#2563eb);}
.staff-info{flex:1;}
.staff-info-name{font-size:14px;font-weight:800;letter-spacing:-.2px;}
.staff-info-sub{font-size:12px;color:var(--text3);margin-top:2px;}
.staff-role-badge{
  padding:3px 10px;border-radius:99px;font-size:11.5px;font-weight:700;
  border:1px solid transparent;
}
.staff-actions{display:flex;gap:6px;align-items:center;}
.staff-pin-dots{display:flex;gap:3px;}
.staff-pin-dot{width:6px;height:6px;border-radius:99px;background:var(--border2);}

/* PIN entry in staff form */
.pin-input-row{display:flex;gap:8px;justify-content:center;margin:8px 0;}
.pin-input-box{
  width:44px;height:52px;border-radius:var(--r-sm);
  border:1.5px solid var(--border);background:var(--surface2);
  font-size:22px;font-weight:800;text-align:center;
  color:var(--text);outline:none;font-family:var(--mono);
  transition:border var(--transition);
}
.pin-input-box:focus{border-color:var(--accent);}

/* No-access screen */
.no-access{
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  height:100%;gap:12px;color:var(--text3);
  animation:ov-in .2s ease;
}
.no-access .na-icon{font-size:48px;opacity:.2;margin-bottom:8px;}
.no-access h3{font-size:18px;font-weight:800;color:var(--text2);}

/* ── Main ── */
.main{flex:1;overflow:hidden;display:flex;flex-direction:column;min-width:0;}

/* ── Topbar ── */
.topbar{
  height:var(--topbar-h);
  background:var(--surface);
  border-bottom:1px solid var(--border);
  display:flex;align-items:center;
  padding:0 22px;gap:14px;
  flex-shrink:0;
}
.topbar-title{font-size:16px;font-weight:800;flex:1;letter-spacing:-.3px;}
.topbar-date{font-size:12px;color:var(--text3);font-family:var(--mono);}
.theme-btn{
  width:36px;height:36px;border-radius:var(--r-sm);
  border:1px solid var(--border2);background:var(--surface2);
  color:var(--text2);display:flex;align-items:center;justify-content:center;
  transition:all var(--transition);box-shadow:var(--sh-raised);
}
.theme-btn:hover{background:var(--accent-bg);color:var(--accent-text);border-color:var(--accent);}

/* ── POS Layout ── */
.pos-layout{display:flex;flex:1;overflow:hidden;}

.products-area{flex:1;overflow-y:auto;padding:18px 20px;}
.products-controls{display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap;}

.search-wrap{position:relative;flex:1;min-width:180px;max-width:280px;}
.search-icon{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--text3);}
.search-input{
  width:100%;padding:9px 12px 9px 36px;
  background:var(--surface);border:1px solid var(--border);
  border-radius:var(--r-sm);color:var(--text);font-size:13px;
  outline:none;transition:all var(--transition);
  box-shadow:var(--sh-inset);
}
.search-input:focus{border-color:var(--accent);box-shadow:var(--sh-inset),var(--sh-glow);}
::placeholder{color:var(--text3);}

.cat-pills{display:flex;gap:6px;flex-wrap:wrap;}
.cat-pill{
  padding:7px 15px;border-radius:99px;
  border:1px solid var(--border);background:var(--surface);
  color:var(--text2);font-size:12.5px;font-weight:600;
  transition:all var(--transition);box-shadow:var(--sh-raised);
}
.cat-pill:hover{border-color:var(--border2);color:var(--text);}
.cat-pill.active{
  background:var(--accent);border-color:var(--accent);
  color:white;box-shadow:0 4px 14px var(--accent-glow);
}

.products-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(146px,1fr));gap:12px;}

.product-card{
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:var(--r-lg);
  padding:0 0 14px;
  cursor:pointer;
  transition:all var(--transition);
  position:relative;
  overflow:hidden;
  box-shadow:var(--sh-raised);
  user-select:none;
}
.product-card:hover{transform:translateY(-2px);box-shadow:var(--sh-float);border-color:var(--border2);}
.product-card:active{transform:translateY(0);box-shadow:var(--sh-raised);}
.product-card.oos{opacity:.4;pointer-events:none;}
.product-card.incart{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent-glow),var(--sh-raised);}

.prod-img-wrap{
  width:100%;height:100px;
  background:var(--surface2);
  display:flex;align-items:center;justify-content:center;
  margin-bottom:10px;overflow:hidden;border-radius:var(--r-lg) var(--r-lg) 0 0;
}
.prod-img-wrap img{width:100%;height:100%;object-fit:cover;}
.prod-emoji-display{font-size:42px;line-height:1;}
.prod-info{padding:0 12px;}
.prod-name{font-size:12.5px;font-weight:700;margin-bottom:3px;line-height:1.3;}
.prod-price{font-size:15px;font-weight:800;color:var(--accent-text);font-family:var(--mono);}
.prod-stock{font-size:10.5px;color:var(--text3);margin-top:3px;}

.card-badge{
  position:absolute;top:8px;right:8px;
  font-size:10px;font-weight:800;
  padding:3px 8px;border-radius:99px;border:none;
}
.card-badge.low{background:var(--amber-bg);color:var(--amber-text);}
.card-badge.qty{background:var(--accent);color:white;width:22px;height:22px;padding:0;display:flex;align-items:center;justify-content:center;border-radius:99px;}

/* ── Cart ── */
.cart-panel{
  width:355px;flex-shrink:0;
  background:var(--surface);
  border-left:1px solid var(--border);
  display:flex;flex-direction:column;
}
.cart-top{
  padding:14px 16px;border-bottom:1px solid var(--border);
  display:flex;align-items:center;gap:8px;
}
.cart-top-title{font-size:14px;font-weight:800;flex:1;letter-spacing:-.2px;}
.order-input{
  background:var(--surface2);border:1px solid var(--border);
  border-radius:var(--r-xs);padding:5px 10px;
  font-size:12px;font-weight:600;color:var(--text);outline:none;width:100px;
  box-shadow:var(--sh-inset);transition:all var(--transition);
}
.order-input:focus{border-color:var(--accent);}

.icon-btn{
  width:32px;height:32px;border-radius:var(--r-xs);
  border:1px solid var(--border);background:var(--surface2);
  color:var(--text2);display:flex;align-items:center;justify-content:center;
  transition:all var(--transition);box-shadow:var(--sh-raised);flex-shrink:0;
}
.icon-btn:hover{background:var(--surface3);color:var(--text);border-color:var(--border2);}
.icon-btn.danger:hover{background:var(--red-bg);color:var(--red-text);border-color:var(--red);}
.icon-btn.accent:hover{background:var(--accent-bg);color:var(--accent-text);border-color:var(--accent);}

.cart-body{flex:1;overflow-y:auto;padding:8px 16px;}
.cart-empty{
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  height:100%;color:var(--text3);gap:10px;padding:40px 20px;text-align:center;
}
.cart-empty-icon{opacity:.25;}
.cart-empty-text{font-size:13px;line-height:1.6;}

.cart-item{
  padding:11px 0;border-bottom:1px solid var(--border);
  display:flex;align-items:flex-start;gap:10px;
}
.ci-thumb{
  width:38px;height:38px;border-radius:var(--r-sm);
  background:var(--surface2);overflow:hidden;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;font-size:22px;
  box-shadow:var(--sh-raised);
}
.ci-thumb img{width:100%;height:100%;object-fit:cover;}
.ci-body{flex:1;min-width:0;}
.ci-name{font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.ci-sub{font-size:11.5px;color:var(--text3);display:flex;align-items:center;gap:8px;margin-top:3px;}
.ci-note-text{font-style:italic;color:var(--accent-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:110px;}
.ci-variant-tags{display:flex;flex-wrap:wrap;gap:4px;margin:3px 0;}
.ci-vtag{
  font-size:10.5px;font-weight:700;padding:2px 7px;
  border-radius:99px;border:1px solid var(--border2);
  background:var(--surface3);color:var(--text2);
}
.prod-from{font-size:10px;color:var(--text3);font-weight:500;margin-left:2px;}
.prod-variants-hint{font-size:10.5px;color:var(--accent-text);font-weight:700;letter-spacing:.2px;margin-top:2px;}

/* Variant Picker Modal */
.vp-product-header{display:flex;align-items:center;gap:14px;padding-bottom:16px;border-bottom:1px solid var(--border);margin-bottom:20px;}
.vp-thumb{width:52px;height:52px;border-radius:var(--r);background:var(--surface2);display:flex;align-items:center;justify-content:center;font-size:30px;flex-shrink:0;box-shadow:var(--sh-raised);}
.vp-thumb img{width:100%;height:100%;object-fit:cover;border-radius:var(--r);}
.vp-prod-name{font-size:18px;font-weight:800;letter-spacing:-.4px;}
.vp-base-price{font-size:13px;color:var(--text3);margin-top:2px;}

.vp-groups{display:flex;flex-direction:column;gap:20px;margin-bottom:20px;}
.vp-group{}
.vp-group-label{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.7px;color:var(--text3);margin-bottom:10px;display:flex;align-items:center;gap:6px;}
.vp-required-chip{font-size:9.5px;font-weight:800;padding:2px 7px;border-radius:99px;background:var(--red-bg);color:var(--red-text);border:1px solid rgba(244,63,94,.25);}
.vp-optional-chip{font-size:9.5px;font-weight:800;padding:2px 7px;border-radius:99px;background:var(--surface3);color:var(--text3);border:1px solid var(--border2);}
.vp-options{display:flex;flex-wrap:wrap;gap:8px;}
.vp-opt{
  padding:9px 16px;border-radius:var(--r-sm);
  border:1.5px solid var(--border);background:var(--surface2);
  color:var(--text2);font-size:13px;font-weight:600;
  cursor:pointer;transition:all var(--transition);
  box-shadow:var(--sh-raised);
  display:flex;align-items:center;gap:6px;
}
.vp-opt:hover{border-color:var(--border2);color:var(--text);}
.vp-opt.sel{border-color:var(--accent);background:var(--accent-bg);color:var(--accent-text);box-shadow:0 0 0 3px var(--accent-glow);}
.vp-opt.sel-multi{border-color:var(--green);background:var(--green-bg);color:var(--green-text);box-shadow:0 0 0 3px rgba(34,197,94,.15);}
.vp-opt-price{font-size:11.5px;opacity:.7;font-family:var(--mono);}

.vp-summary{
  background:var(--surface2);border:1px solid var(--border2);
  border-radius:var(--r);padding:14px 16px;margin-bottom:16px;
  box-shadow:var(--sh-inset);
}
.vp-summary-row{display:flex;justify-content:space-between;font-size:12.5px;padding:3px 0;color:var(--text2);}
.vp-summary-row.total{font-size:16px;font-weight:800;color:var(--text);padding-top:8px;border-top:1px solid var(--border2);margin-top:4px;}
.vp-summary-row.total span:last-child{color:var(--accent-text);font-family:var(--mono);}

/* Product form variant builder */
.var-builder{margin-top:20px;padding-top:20px;border-top:1px solid var(--border);}
.var-builder-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
.var-builder-head h4{font-size:13px;font-weight:800;letter-spacing:-.2px;}
.var-group-card{
  background:var(--surface2);border:1px solid var(--border);
  border-radius:var(--r);padding:14px;margin-bottom:10px;
  box-shadow:var(--sh-raised);
}
.var-group-top{display:flex;align-items:center;gap:8px;margin-bottom:10px;}
.var-group-top input{flex:1;padding:7px 10px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-xs);font-size:13px;font-weight:700;color:var(--text);outline:none;}
.var-group-top input:focus{border-color:var(--accent);}
.var-req-toggle{display:flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:var(--text2);cursor:pointer;white-space:nowrap;}
.var-options-list{display:flex;flex-direction:column;gap:6px;margin-bottom:8px;}
.var-opt-row{display:flex;align-items:center;gap:7px;}
.var-opt-row input{padding:6px 9px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-xs);font-size:12.5px;color:var(--text);outline:none;}
.var-opt-row input:focus{border-color:var(--accent);}
.var-opt-row input.price-in{width:80px;font-family:var(--mono);}
.var-opt-row input.name-in{flex:1;}
.var-del-btn{width:24px;height:24px;border-radius:var(--r-xs);border:1px solid var(--border);background:var(--surface);color:var(--text3);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all var(--transition);flex-shrink:0;}
.var-del-btn:hover{border-color:var(--red-text);background:var(--red-bg);color:var(--red-text);}
.var-add-opt-btn{font-size:12px;font-weight:700;color:var(--accent-text);background:none;border:none;cursor:pointer;padding:0;}
.ci-controls{display:flex;align-items:center;gap:7px;margin-top:6px;}
.qty-btn{
  width:24px;height:24px;border-radius:var(--r-xs);
  border:1px solid var(--border);background:var(--surface2);
  color:var(--text);display:flex;align-items:center;justify-content:center;
  transition:all var(--transition);box-shadow:var(--sh-raised);
}
.qty-btn:hover{background:var(--accent);color:white;border-color:var(--accent);}
.qty-num{font-size:13px;font-weight:800;min-width:20px;text-align:center;font-family:var(--mono);}
.note-btn{font-size:11px;color:var(--text3);background:none;border:none;cursor:pointer;padding:0;transition:color var(--transition);}
.note-btn:hover{color:var(--accent-text);}
.note-input{
  margin-top:5px;width:100%;
  background:var(--surface2);border:1px solid var(--border);
  border-radius:var(--r-xs);padding:5px 9px;
  font-size:12px;color:var(--text);outline:none;
  box-shadow:var(--sh-inset);
}
.note-input:focus{border-color:var(--accent);}
.ci-total{font-size:13px;font-weight:800;font-family:var(--mono);flex-shrink:0;}

.disc-row{
  padding:10px 0;border-bottom:1px solid var(--border);
  display:flex;align-items:center;gap:8px;
}
.disc-row-label{font-size:12.5px;font-weight:700;color:var(--text2);flex:1;}
.disc-pill{
  padding:4px 11px;border-radius:99px;
  border:1px solid var(--border);background:var(--surface2);
  font-size:11.5px;font-weight:600;color:var(--text2);
  transition:all var(--transition);box-shadow:var(--sh-raised);
}
.disc-pill:hover{border-color:var(--accent);color:var(--accent-text);}
.disc-pill.applied{background:var(--green-bg);color:var(--green-text);border-color:var(--green);}
.disc-amount{font-size:13px;font-weight:800;color:var(--green-text);font-family:var(--mono);}

.cart-footer{padding:14px 16px;border-top:1px solid var(--border);}
.totals{margin-bottom:14px;}
.total-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;}
.total-row .lbl{font-size:12.5px;color:var(--text2);}
.total-row .val{font-size:13px;font-family:var(--mono);font-weight:600;}
.total-row.grand .lbl{font-size:16px;font-weight:800;color:var(--text);}
.total-row.grand .val{font-size:22px;font-weight:800;font-family:var(--mono);color:var(--text);}
.total-row .green{color:var(--green-text);}
.tot-divider{height:1px;background:var(--border);margin:9px 0;}

.pay-row{display:flex;gap:8px;margin-bottom:12px;}
.pay-btn{
  flex:1;padding:10px;border-radius:var(--r-sm);
  border:1.5px solid var(--border);background:var(--surface2);
  color:var(--text2);font-size:12.5px;font-weight:700;
  display:flex;align-items:center;justify-content:center;gap:7px;
  transition:all var(--transition);box-shadow:var(--sh-raised);
}
.pay-btn:hover{border-color:var(--border2);color:var(--text);}
.pay-btn.active{
  border-color:var(--accent);background:var(--accent-bg);
  color:var(--accent-text);box-shadow:0 4px 14px var(--accent-glow);
}
.pay-btn.gcash.active{border-color:#0070ba;background:rgba(0,112,186,.1);color:#0070ba;box-shadow:0 4px 14px rgba(0,112,186,.25);}

.charge-btn{
  width:100%;padding:14px;
  background:linear-gradient(135deg,var(--accent),var(--accent2));
  color:white;border:none;border-radius:var(--r-sm);
  font-size:15px;font-weight:800;letter-spacing:.2px;
  transition:all var(--transition);
  box-shadow:0 6px 20px var(--accent-glow);
}
.charge-btn:hover{transform:translateY(-1px);box-shadow:0 10px 28px var(--accent-glow);}
.charge-btn:active{transform:translateY(0);}
.charge-btn:disabled{opacity:.35;cursor:not-allowed;transform:none;box-shadow:none;}

.hold-bar{
  border-top:1px solid var(--border);padding:9px 16px;
  display:flex;gap:8px;overflow-x:auto;background:var(--surface2);
}
.hold-chip{
  display:flex;align-items:center;gap:6px;
  background:var(--surface);border:1px solid var(--border);
  border-radius:var(--r-sm);padding:5px 10px;
  font-size:11.5px;font-weight:600;cursor:pointer;
  white-space:nowrap;transition:all var(--transition);
  flex-shrink:0;box-shadow:var(--sh-raised);
}
.hold-chip:hover{border-color:var(--accent);color:var(--accent-text);}
.hold-chip-x{background:none;border:none;color:var(--text3);cursor:pointer;display:flex;align-items:center;}
.hold-chip-x:hover{color:var(--red-text);}

/* ── Pages ── */
.page{display:flex;flex-direction:column;height:100%;overflow:hidden;}
.page-head{
  padding:18px 24px;border-bottom:1px solid var(--border);
  background:var(--surface);flex-shrink:0;
  display:flex;align-items:center;justify-content:space-between;
}
.page-head-left h1{font-size:20px;font-weight:800;letter-spacing:-.5px;}
.page-head-left p{font-size:12.5px;color:var(--text3);margin-top:2px;}
.page-body{flex:1;overflow-y:auto;padding:22px 24px;}

/* ── Buttons ── */
.btn{
  display:inline-flex;align-items:center;gap:7px;
  padding:8px 16px;border-radius:var(--r-sm);
  font-size:13px;font-weight:700;border:none;
  transition:all var(--transition);cursor:pointer;
}
.btn-primary{
  background:linear-gradient(135deg,var(--accent),var(--accent2));
  color:white;box-shadow:0 4px 14px var(--accent-glow);
}
.btn-primary:hover{transform:translateY(-1px);box-shadow:0 8px 20px var(--accent-glow);}
.btn-secondary{
  background:var(--surface2);color:var(--text);
  border:1px solid var(--border);box-shadow:var(--sh-raised);
}
.btn-secondary:hover{background:var(--surface3);border-color:var(--border2);}
.btn-danger{background:var(--red-bg);color:var(--red-text);border:1px solid var(--red);}
.btn-danger:hover{background:var(--red);color:white;}
.btn-sm{padding:6px 12px;font-size:12px;}

/* ── Analytics ── */
.analytics-head{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;}
.range-pills{display:flex;gap:6px;align-items:center;}
.range-pill{
  padding:6px 14px;border-radius:99px;
  border:1px solid var(--border);background:var(--surface2);
  color:var(--text2);font-size:12.5px;font-weight:600;
  transition:all var(--transition);box-shadow:var(--sh-raised);cursor:pointer;
}
.range-pill:hover{border-color:var(--border2);color:var(--text);}
.range-pill.active{background:var(--accent);border-color:var(--accent);color:white;box-shadow:0 4px 14px var(--accent-glow);}

/* Calendar date picker */
.cal-wrap{position:relative;}
.cal-trigger{
  display:flex;align-items:center;gap:7px;
  padding:6px 14px;border-radius:99px;
  border:1px solid var(--border);background:var(--surface2);
  color:var(--text2);font-size:12.5px;font-weight:600;
  transition:all var(--transition);box-shadow:var(--sh-raised);cursor:pointer;
  white-space:nowrap;
}
.cal-trigger:hover{border-color:var(--border2);color:var(--text);}
.cal-trigger.active{background:var(--accent);border-color:var(--accent);color:white;box-shadow:0 4px 14px var(--accent-glow);}
.cal-trigger.active svg{stroke:white;}

.cal-dropdown{
  position:absolute;top:calc(100% + 8px);right:0;
  background:var(--surface);border:1px solid var(--border2);
  border-radius:var(--r-lg);padding:18px 20px;
  box-shadow:var(--sh-float);
  z-index:100;min-width:300px;
  animation:md-in .18s ease;
}
.cal-dropdown h4{font-size:13px;font-weight:800;margin-bottom:14px;letter-spacing:-.2px;}
.cal-fields{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;}
.cal-field{display:flex;flex-direction:column;gap:5px;}
.cal-field label{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--text3);}
.cal-field input[type="date"]{
  padding:9px 11px;
  background:var(--surface2);border:1px solid var(--border);
  border-radius:var(--r-sm);color:var(--text);font-size:13px;
  font-family:var(--mono);outline:none;
  transition:all var(--transition);box-shadow:var(--sh-inset);
  cursor:pointer;
}
.cal-field input[type="date"]:focus{border-color:var(--accent);box-shadow:var(--sh-inset),var(--sh-glow);}
.cal-field input[type="date"]::-webkit-calendar-picker-indicator{
  opacity:.5;cursor:pointer;filter:${dark?"invert(1)":"none"};
}
.cal-preview{
  background:var(--surface2);border:1px solid var(--border);
  border-radius:var(--r-sm);padding:9px 12px;
  font-size:12px;color:var(--text2);margin-bottom:14px;
  display:flex;align-items:center;justify-content:space-between;
  box-shadow:var(--sh-inset);
}
.cal-preview .cp-days{font-weight:800;color:var(--accent-text);font-family:var(--mono);}
.cal-shortcuts{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;}
.cal-short{
  padding:4px 10px;border-radius:99px;
  border:1px solid var(--border);background:var(--surface2);
  color:var(--text3);font-size:11px;font-weight:600;
  cursor:pointer;transition:all var(--transition);
}
.cal-short:hover{border-color:var(--accent);color:var(--accent-text);}
.cal-apply{
  width:100%;padding:10px;
  background:linear-gradient(135deg,var(--accent),var(--accent2));
  color:white;border:none;border-radius:var(--r-sm);
  font-size:13px;font-weight:800;cursor:pointer;
  transition:all var(--transition);box-shadow:0 4px 14px var(--accent-glow);
}
.cal-apply:hover{transform:translateY(-1px);box-shadow:0 6px 18px var(--accent-glow);}
.cal-apply:disabled{opacity:.4;cursor:not-allowed;transform:none;}

.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px;}
.stat-card{
  background:var(--surface);border:1px solid var(--border);
  border-radius:var(--r-lg);padding:18px 20px;
  box-shadow:var(--sh-raised);position:relative;overflow:hidden;
}
.stat-card::before{
  content:'';position:absolute;top:0;left:0;right:0;height:3px;
  background:linear-gradient(90deg,var(--sc-color,var(--accent)),transparent);
}
.sc-icon-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
.sc-icon{width:36px;height:36px;border-radius:var(--r-sm);display:flex;align-items:center;justify-content:center;box-shadow:var(--sh-raised);}
.sc-trend{display:flex;align-items:center;gap:4px;font-size:12px;font-weight:700;padding:3px 8px;border-radius:99px;}
.sc-trend.up{background:var(--green-bg);color:var(--green-text);}
.sc-trend.down{background:var(--red-bg);color:var(--red-text);}
.sc-trend.neutral{background:var(--surface2);color:var(--text3);}
.sc-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:var(--text3);margin-bottom:5px;}
.sc-value{font-size:24px;font-weight:800;letter-spacing:-.6px;font-family:var(--mono);line-height:1;margin-bottom:4px;}
.sc-sub{font-size:11.5px;color:var(--text3);}

/* Sparkline row */
.spark-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px;}
.spark-card{
  background:var(--surface);border:1px solid var(--border);
  border-radius:var(--r-lg);padding:20px;box-shadow:var(--sh-raised);
}
.spark-card-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px;}
.spark-card-head h3{font-size:14px;font-weight:800;letter-spacing:-.3px;}
.spark-card-head p{font-size:12px;color:var(--text3);margin-top:2px;}
.spark-card-head .big-num{font-size:26px;font-weight:800;font-family:var(--mono);letter-spacing:-.5px;}
.spark-card-head .trend-sub{font-size:12px;color:var(--text3);margin-top:2px;}

/* Interactive bar chart */
.ibar-chart{display:flex;align-items:flex-end;gap:4px;height:140px;position:relative;}
.ibar-col{
  flex:1;display:flex;flex-direction:column;align-items:center;
  gap:4px;height:100%;justify-content:flex-end;cursor:pointer;
  position:relative;
}
.ibar{
  width:100%;border-radius:4px 4px 0 0;
  background:var(--surface3);min-height:3px;
  transition:all .2s;
}
.ibar:hover,.ibar.hovered{background:var(--accent);box-shadow:0 4px 12px var(--accent-glow);}
.ibar.today{background:linear-gradient(180deg,var(--accent),var(--accent2));}
.ibar-lbl{font-size:9.5px;color:var(--text3);font-weight:600;white-space:nowrap;}

.bar-tooltip{
  position:fixed;
  background:var(--surface);border:1px solid var(--border2);
  border-radius:var(--r-sm);padding:10px 14px;
  box-shadow:var(--sh-float);
  z-index:100;pointer-events:none;
  min-width:130px;
}
.bt-date{font-size:11px;color:var(--text3);margin-bottom:4px;}
.bt-rev{font-size:16px;font-weight:800;font-family:var(--mono);margin-bottom:2px;}
.bt-orders{font-size:11.5px;color:var(--text2);}

/* SVG sparkline */
.sparkline-svg{width:100%;height:60px;overflow:visible;}
.spark-line{fill:none;stroke:var(--accent);stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
.spark-area{fill:url(#sparkGrad);opacity:.15;}

/* Payment split */
.payment-split{display:flex;flex-direction:column;gap:14px;}
.split-bars{display:flex;height:16px;border-radius:99px;overflow:hidden;gap:2px;}
.split-bar{height:100%;transition:width .5s ease;}
.split-bar.cash{background:var(--green);border-radius:99px 0 0 99px;}
.split-bar.gcash{background:var(--blue);border-radius:0 99px 99px 0;}
.split-legend{display:flex;flex-direction:column;gap:10px;}
.split-item{display:flex;align-items:center;gap:10px;}
.split-dot{width:10px;height:10px;border-radius:3px;flex-shrink:0;}
.split-name{font-size:13px;font-weight:600;flex:1;}
.split-meta{text-align:right;}
.split-amt{font-size:13px;font-weight:800;font-family:var(--mono);}
.split-pct{font-size:11px;color:var(--text3);}
.split-count{font-size:11px;color:var(--text3);}

/* Bottom row */
.analytics-bottom{display:grid;grid-template-columns:1.2fr 1fr 1fr;gap:14px;}

.chart-card{
  background:var(--surface);border:1px solid var(--border);
  border-radius:var(--r-lg);padding:20px;box-shadow:var(--sh-raised);
}
.chart-card h3{font-size:14px;font-weight:800;letter-spacing:-.3px;margin-bottom:2px;}
.chart-card p{font-size:11.5px;color:var(--text3);margin-bottom:16px;}

/* Best sellers */
.bs-list{display:flex;flex-direction:column;gap:10px;}
.bs-item{display:flex;align-items:center;gap:11px;}
.bs-rank{font-size:12px;font-weight:800;color:var(--text3);min-width:18px;font-family:var(--mono);}
.bs-rank.g{color:var(--amber);}
.bs-thumb{width:34px;height:34px;border-radius:var(--r-xs);background:var(--surface2);display:flex;align-items:center;justify-content:center;font-size:18px;overflow:hidden;flex-shrink:0;box-shadow:var(--sh-raised);}
.bs-thumb img{width:100%;height:100%;object-fit:cover;}
.bs-info{flex:1;min-width:0;}
.bs-name{font-size:12.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.bs-bar-wrap{margin-top:4px;height:4px;background:var(--surface3);border-radius:99px;overflow:hidden;}
.bs-bar-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,var(--accent),var(--accent2));}
.bs-rev{font-size:12.5px;font-weight:800;font-family:var(--mono);text-align:right;flex-shrink:0;}
.bs-qty{font-size:10.5px;color:var(--text3);text-align:right;}

/* Category breakdown */
.cat-list{display:flex;flex-direction:column;gap:12px;}
.cat-row-item{display:flex;align-items:center;gap:10px;}
.cat-dot{width:9px;height:9px;border-radius:3px;flex-shrink:0;}
.cat-body{flex:1;min-width:0;}
.cat-name-row{display:flex;justify-content:space-between;margin-bottom:4px;}
.cat-name-row span{font-size:12px;color:var(--text2);font-weight:600;}
.cat-name-row strong{font-size:12px;font-family:var(--mono);}
.cat-track{height:6px;background:var(--surface3);border-radius:99px;overflow:hidden;box-shadow:var(--sh-inset);}
.cat-fill{height:100%;border-radius:99px;transition:width .5s ease;}

/* Peak hours heatmap */
.hours-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;}
.hour-cell{
  aspect-ratio:1;border-radius:5px;
  display:flex;align-items:center;justify-content:center;
  font-size:9px;font-weight:700;color:var(--text3);
  transition:all .2s;cursor:default;
  position:relative;
}
.hour-cell:hover{transform:scale(1.15);z-index:2;}

/* Low stock alerts */
.low-stock-list{display:flex;flex-direction:column;gap:8px;}
.ls-item{
  display:flex;align-items:center;gap:10px;
  padding:10px 12px;border-radius:var(--r-sm);
  background:var(--surface2);border:1px solid var(--border);
  box-shadow:var(--sh-raised);
}
.ls-item.critical{border-color:rgba(244,63,94,.3);background:var(--red-bg);}
.ls-thumb{width:30px;height:30px;border-radius:var(--r-xs);background:var(--surface3);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;}
.ls-name{flex:1;font-size:12.5px;font-weight:700;}
.ls-stock{font-size:12px;font-family:var(--mono);font-weight:800;}
.ls-stock.zero{color:var(--red-text);}
.ls-stock.low{color:var(--amber-text);}

.no-alerts{text-align:center;padding:20px;color:var(--text3);font-size:13px;}
.no-alerts .na-icon{font-size:32px;opacity:.3;margin-bottom:8px;}

/* ── End of Day Report ── */
.eod-overlay{
  position:fixed;inset:0;z-index:450;
  background:rgba(0,0,0,.55);backdrop-filter:blur(4px);
  display:flex;align-items:flex-start;justify-content:center;
  padding:24px 16px;overflow-y:auto;
  animation:ov-in .2s ease;
}
.eod-modal{
  background:var(--surface);border:1px solid var(--border2);
  border-radius:var(--r-xl);width:100%;max-width:680px;
  box-shadow:var(--sh-float);
  animation:md-in .25s ease;
  overflow:hidden;flex-shrink:0;
}
.eod-topbar{
  background:linear-gradient(135deg,var(--accent),#9D8FFC);
  padding:20px 24px;color:white;
  display:flex;align-items:center;justify-content:space-between;
}
.eod-topbar-left h2{font-size:20px;font-weight:900;letter-spacing:-.4px;margin-bottom:2px;}
.eod-topbar-left p{font-size:12.5px;opacity:.8;}
.eod-topbar-right{text-align:right;}
.eod-topbar-right .eod-date{font-size:22px;font-weight:900;font-family:var(--mono);}
.eod-topbar-right .eod-time{font-size:12px;opacity:.75;margin-top:2px;}
.eod-close-x{background:rgba(255,255,255,.15);border:none;color:white;width:28px;height:28px;border-radius:99px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:all .15s;}
.eod-close-x:hover{background:rgba(255,255,255,.28);}

.eod-body{padding:24px;}
.eod-section{margin-bottom:22px;}
.eod-section-title{
  font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.7px;
  color:var(--text3);margin-bottom:12px;
  display:flex;align-items:center;gap:8px;
}
.eod-section-title::after{content:"";flex:1;height:1px;background:var(--border);}

.eod-kpi-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;}
.eod-kpi{
  background:var(--surface2);border:1px solid var(--border);
  border-radius:var(--r);padding:13px 14px;
  box-shadow:var(--sh-raised);
}
.eod-kpi-label{font-size:11px;color:var(--text3);font-weight:600;margin-bottom:5px;}
.eod-kpi-val{font-size:20px;font-weight:900;font-family:var(--mono);letter-spacing:-.5px;}
.eod-kpi-sub{font-size:11px;color:var(--text3);margin-top:3px;}
.eod-kpi.accent{border-color:var(--accent);background:var(--accent-bg);}
.eod-kpi.accent .eod-kpi-val{color:var(--accent-text);}
.eod-kpi.green{border-color:rgba(34,197,94,.3);background:var(--green-bg);}
.eod-kpi.green .eod-kpi-val{color:var(--green-text);}
.eod-kpi.red{border-color:rgba(244,63,94,.3);background:var(--red-bg);}
.eod-kpi.red .eod-kpi-val{color:var(--red-text);}
.eod-kpi.amber{border-color:rgba(245,158,11,.3);background:var(--amber-bg);}
.eod-kpi.amber .eod-kpi-val{color:var(--amber-text);}

/* Payment split bar */
.eod-split-bar{
  background:var(--surface2);border:1px solid var(--border);
  border-radius:var(--r);padding:14px 16px;
}
.eod-split-labels{display:flex;justify-content:space-between;margin-bottom:8px;}
.eod-split-label{font-size:12.5px;font-weight:700;display:flex;align-items:center;gap:6px;}
.eod-split-track{height:10px;border-radius:99px;background:var(--border);overflow:hidden;margin-bottom:8px;}
.eod-split-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,#22c55e,#16a34a);transition:width .4s ease;}
.eod-split-amounts{display:flex;justify-content:space-between;}
.eod-split-amt{font-size:13px;font-family:var(--mono);font-weight:800;}

/* Drawer reconciliation */
.eod-drawer{
  background:var(--surface2);border:1px solid var(--border);
  border-radius:var(--r);overflow:hidden;
}
.eod-drawer-row{
  display:flex;align-items:center;justify-content:space-between;
  padding:11px 16px;border-bottom:1px solid var(--border);
}
.eod-drawer-row:last-child{border-bottom:none;}
.eod-drawer-label{font-size:13px;font-weight:600;color:var(--text2);}
.eod-drawer-val{font-size:14px;font-weight:800;font-family:var(--mono);}
.eod-drawer-input{
  width:120px;padding:7px 10px;text-align:right;
  background:var(--surface);border:1.5px solid var(--accent);
  border-radius:var(--r-sm);font-size:14px;font-weight:800;
  font-family:var(--mono);color:var(--text);outline:none;
}
.eod-variance-row{
  padding:13px 16px;display:flex;align-items:center;justify-content:space-between;
  border-top:2px solid var(--border);
}
.eod-variance-good{color:var(--green-text);}
.eod-variance-bad {color:var(--red-text);}

/* Top items */
.eod-items-list{display:flex;flex-direction:column;gap:6px;}
.eod-item-row{
  display:flex;align-items:center;gap:10px;
  padding:9px 12px;background:var(--surface2);
  border:1px solid var(--border);border-radius:var(--r-sm);
}
.eod-item-rank{width:20px;height:20px;border-radius:var(--r-xs);background:var(--surface3);color:var(--text3);font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.eod-item-rank.gold{background:#f59e0b;color:white;}
.eod-item-rank.silver{background:#94a3b8;color:white;}
.eod-item-rank.bronze{background:#b45309;color:white;}
.eod-item-icon{font-size:20px;flex-shrink:0;}
.eod-item-name{flex:1;font-size:13px;font-weight:700;}
.eod-item-qty{font-size:12px;color:var(--text3);}
.eod-item-rev{font-size:13px;font-weight:800;font-family:var(--mono);color:var(--accent-text);}

/* EOD footer */
.eod-footer{
  padding:16px 24px;border-top:1px solid var(--border);
  background:var(--surface2);
  display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;
}
.eod-closed-stamp{
  padding:10px 16px;border-radius:var(--r-sm);
  background:var(--green-bg);border:1px solid rgba(34,197,94,.3);
  color:var(--green-text);font-size:12.5px;font-weight:700;
  display:flex;align-items:center;gap:8px;
}
.eod-close-day-btn{
  padding:12px 24px;border-radius:var(--r-sm);
  background:linear-gradient(135deg,var(--accent),#9D8FFC);
  color:white;border:none;font-size:14px;font-weight:800;
  cursor:pointer;display:flex;align-items:center;gap:8px;
  box-shadow:0 4px 12px var(--accent-glow);
  transition:all var(--transition);
}
.eod-close-day-btn:hover{filter:brightness(1.08);transform:translateY(-1px);}

/* ── Kitchen Display System ── */
.kds-header{
  display:flex;align-items:center;justify-content:space-between;
  margin-bottom:20px;flex-wrap:wrap;gap:12px;
}
.kds-tabs{display:flex;gap:6px;}
.kds-tab{
  padding:7px 16px;border-radius:var(--r-sm);
  border:1.5px solid var(--border);background:var(--surface2);
  font-size:13px;font-weight:700;color:var(--text2);
  cursor:pointer;transition:all var(--transition);
  display:flex;align-items:center;gap:6px;
}
.kds-tab:hover{border-color:var(--border2);}
.kds-tab.active{border-color:var(--accent);background:var(--accent-bg);color:var(--accent-text);}
.kds-tab .kds-tab-badge{
  background:var(--accent);color:white;
  border-radius:99px;padding:1px 7px;font-size:11px;font-weight:800;
}
.kds-tab.done-tab.active{border-color:var(--green-text);background:var(--green-bg);color:var(--green-text);}
.kds-tab.done-tab .kds-tab-badge{background:var(--green-text);}

.kds-stats{display:flex;gap:12px;flex-wrap:wrap;}
.kds-stat{
  padding:6px 14px;border-radius:var(--r-sm);
  background:var(--surface2);border:1px solid var(--border);
  font-size:12px;color:var(--text3);
  display:flex;align-items:center;gap:6px;
}
.kds-stat strong{color:var(--text);font-weight:800;}

.kds-empty{
  display:flex;flex-direction:column;align-items:center;
  justify-content:center;padding:80px 24px;
  color:var(--text3);text-align:center;
}
.kds-empty .ke-icon{font-size:56px;margin-bottom:16px;opacity:.25;}
.kds-empty h3{font-size:18px;font-weight:800;color:var(--text2);margin-bottom:6px;}
.kds-empty p{font-size:13.5px;line-height:1.6;}

.kds-grid{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(280px,1fr));
  gap:16px;align-items:start;
}

/* Ticket card */
.kds-ticket{
  background:var(--surface);border:1.5px solid var(--border);
  border-radius:var(--r-lg);overflow:hidden;
  box-shadow:var(--sh-raised);
  transition:all var(--transition);
}
.kds-ticket:hover{box-shadow:var(--sh-float);}
.kds-ticket.urgent{border-color:rgba(245,158,11,.5);box-shadow:0 0 0 1px rgba(245,158,11,.2),var(--sh-raised);}
.kds-ticket.critical{border-color:rgba(244,63,94,.5);box-shadow:0 0 0 1px rgba(244,63,94,.2),var(--sh-raised);}
.kds-ticket.done-ticket{opacity:.75;}

.kt-head{
  padding:12px 14px;display:flex;align-items:center;gap:10px;
  border-bottom:1px solid var(--border);
}
.kt-num{
  width:34px;height:34px;border-radius:var(--r-sm);flex-shrink:0;
  background:linear-gradient(135deg,var(--accent),#9D8FFC);
  color:white;font-size:14px;font-weight:900;
  display:flex;align-items:center;justify-content:center;
  font-family:var(--mono);
}
.kds-ticket.urgent .kt-num{background:linear-gradient(135deg,#f59e0b,#d97706);}
.kds-ticket.critical .kt-num{background:linear-gradient(135deg,#F43F5E,#E11D48);}
.kds-ticket.done-ticket .kt-num{background:var(--surface3);color:var(--text3);}
.kt-info{flex:1;min-width:0;}
.kt-name{font-size:14px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.kt-meta{font-size:11px;color:var(--text3);margin-top:1px;}
.kt-timer{
  padding:4px 10px;border-radius:99px;
  font-size:12px;font-weight:800;font-family:var(--mono);
  flex-shrink:0;
}
.kt-timer.fresh{background:var(--green-bg);color:var(--green-text);}
.kt-timer.warm {background:var(--amber-bg);color:var(--amber-text);}
.kt-timer.hot  {background:var(--red-bg);color:var(--red-text);animation:pulse-red 1.5s ease-in-out infinite;}
.kt-timer.done {background:var(--surface3);color:var(--text3);}
@keyframes pulse-red{0%,100%{opacity:1;}50%{opacity:.6;}}

.kt-items{padding:12px 14px;display:flex;flex-direction:column;gap:8px;}
.kt-item{
  display:flex;align-items:flex-start;gap:10px;
  padding:9px 11px;border-radius:var(--r-sm);
  background:var(--surface2);border:1px solid var(--border);
  cursor:pointer;transition:all var(--transition);
  user-select:none;
}
.kt-item:hover{border-color:var(--border2);}
.kt-item.checked{
  opacity:.4;
  background:var(--green-bg);
  border-color:rgba(34,197,94,.2);
}
.kt-item.checked .kt-item-name{text-decoration:line-through;}
.kt-check{
  width:18px;height:18px;border-radius:var(--r-xs);flex-shrink:0;
  border:1.5px solid var(--border2);background:var(--surface);
  display:flex;align-items:center;justify-content:center;
  margin-top:1px;transition:all var(--transition);
  font-size:11px;color:transparent;
}
.kt-item.checked .kt-check{
  background:var(--green-text);border-color:var(--green-text);color:white;
}
.kt-item-icon{font-size:18px;flex-shrink:0;}
.kt-item-body{flex:1;min-width:0;}
.kt-item-name{font-size:13px;font-weight:700;margin-bottom:2px;}
.kt-item-qty{
  display:inline-flex;align-items:center;justify-content:center;
  width:20px;height:20px;border-radius:var(--r-xs);
  background:var(--accent);color:white;
  font-size:11px;font-weight:800;margin-right:6px;
}
.kt-item-variants{
  display:flex;flex-wrap:wrap;gap:3px;margin-top:4px;
}
.kt-variant-tag{
  font-size:10.5px;padding:2px 7px;border-radius:99px;
  background:var(--surface3);border:1px solid var(--border);
  color:var(--text3);font-weight:600;
}
.kt-item-note{
  font-size:11.5px;color:var(--amber-text);font-style:italic;
  margin-top:3px;display:flex;align-items:center;gap:4px;
}

.kt-foot{
  padding:10px 14px;border-top:1px solid var(--border);
  display:flex;align-items:center;justify-content:space-between;gap:8px;
}
.kt-progress{
  flex:1;height:4px;border-radius:99px;
  background:var(--border);overflow:hidden;
}
.kt-progress-bar{
  height:100%;border-radius:99px;
  background:var(--green-text);
  transition:width .3s ease;
}
.kt-done-btn{
  padding:8px 16px;border-radius:var(--r-sm);
  background:var(--green-text);color:white;border:none;
  font-size:13px;font-weight:800;cursor:pointer;
  display:flex;align-items:center;gap:6px;
  transition:all var(--transition);white-space:nowrap;
}
.kt-done-btn:hover{filter:brightness(1.1);}
.kt-done-btn:disabled{opacity:.4;cursor:not-allowed;filter:none;}
.kt-recall-btn{
  padding:7px 12px;border-radius:var(--r-sm);
  border:1px solid var(--border);background:var(--surface2);
  color:var(--text3);font-size:12px;font-weight:700;
  cursor:pointer;transition:all var(--transition);
}
.kt-recall-btn:hover{border-color:var(--amber-text);color:var(--amber-text);}
.kt-done-stamp{
  font-size:11px;color:var(--green-text);font-weight:700;
  display:flex;align-items:center;gap:4px;
}

/* ── Stock Toast Notifications ── */
.stock-toasts{
  position:fixed;bottom:24px;right:24px;
  z-index:600;display:flex;flex-direction:column;gap:10px;
  pointer-events:none;
}
.stock-toast{
  display:flex;align-items:center;gap:12px;
  padding:13px 16px;
  background:var(--surface);border:1px solid rgba(245,158,11,.4);
  border-left:4px solid var(--amber-text);
  border-radius:var(--r);
  box-shadow:var(--sh-float);
  min-width:280px;max-width:340px;
  animation:toast-in .3s cubic-bezier(.34,1.56,.64,1);
  pointer-events:all;
}
.stock-toast.critical{border-color:rgba(244,63,94,.4);border-left-color:var(--red-text);}
@keyframes toast-in{from{transform:translateX(120%);opacity:0;}to{transform:translateX(0);opacity:1;}}
.toast-icon{font-size:26px;flex-shrink:0;}
.toast-body{flex:1;}
.toast-title{font-size:13px;font-weight:800;margin-bottom:2px;}
.toast-msg{font-size:12px;color:var(--text2);}
.toast-badge{
  font-size:12px;font-weight:800;padding:3px 9px;
  border-radius:99px;flex-shrink:0;
}
.toast-dismiss{
  width:20px;height:20px;border-radius:99px;
  border:1px solid var(--border);background:var(--surface2);
  color:var(--text3);font-size:11px;
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;flex-shrink:0;transition:all var(--transition);
}
.toast-dismiss:hover{background:var(--surface3);color:var(--text);}

/* ── Table ── */
.table-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;box-shadow:var(--sh-raised);}
.table-toolbar{padding:14px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
table{width:100%;border-collapse:collapse;}
thead th{
  padding:11px 18px;text-align:left;
  font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:.8px;
  color:var(--text3);background:var(--surface2);
  border-bottom:1px solid var(--border);
}
tbody tr{border-bottom:1px solid var(--border);transition:background var(--transition);}
tbody tr:last-child{border-bottom:none;}
tbody tr:hover{background:var(--surface2);}
tbody tr.clickable{cursor:pointer;}
tbody tr.clickable:hover{background:var(--accent-bg);}
tbody td{padding:12px 18px;font-size:13.5px;}
.tbl-prod{display:flex;align-items:center;gap:10px;}
.tbl-thumb{width:34px;height:34px;border-radius:var(--r-sm);background:var(--surface2);display:flex;align-items:center;justify-content:center;font-size:18px;overflow:hidden;flex-shrink:0;box-shadow:var(--sh-raised);}
.tbl-thumb img{width:100%;height:100%;object-fit:cover;}

/* ── Transactions Page ── */
.txn-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px;}
.txn-stat{
  background:var(--surface);border:1px solid var(--border);
  border-radius:var(--r-lg);padding:16px 18px;
  box-shadow:var(--sh-raised);
}
.txn-stat-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--text3);margin-bottom:5px;}
.txn-stat-value{font-size:22px;font-weight:800;font-family:var(--mono);letter-spacing:-.5px;}
.txn-stat-sub{font-size:11.5px;color:var(--text3);margin-top:3px;}

.txn-filter-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.txn-method-btns{display:flex;gap:4px;}
.txn-method-btn{
  padding:6px 13px;border-radius:99px;
  border:1px solid var(--border);background:var(--surface2);
  color:var(--text2);font-size:12px;font-weight:600;
  cursor:pointer;transition:all var(--transition);
}
.txn-method-btn:hover{border-color:var(--border2);color:var(--text);}
.txn-method-btn.active{background:var(--accent);border-color:var(--accent);color:white;}
.txn-method-btn.cash.active{background:var(--green);border-color:var(--green);}
.txn-method-btn.gcash.active{background:var(--blue);border-color:var(--blue);}

.txn-date-btns{display:flex;gap:4px;}
.txn-date-btn{
  padding:6px 12px;border-radius:99px;
  border:1px solid var(--border);background:var(--surface2);
  color:var(--text2);font-size:12px;font-weight:600;
  cursor:pointer;transition:all var(--transition);
}
.txn-date-btn:hover{border-color:var(--border2);color:var(--text);}
.txn-date-btn.active{background:var(--accent);border-color:var(--accent);color:white;}

.txn-empty{text-align:center;padding:48px 24px;color:var(--text3);}
.txn-empty .e-icon{font-size:40px;opacity:.25;margin-bottom:10px;}
.txn-empty p{font-size:13.5px;}

/* View receipt button */
.view-receipt-btn{
  display:inline-flex;align-items:center;gap:5px;
  padding:5px 11px;border-radius:var(--r-xs);
  border:1px solid var(--border);background:var(--surface2);
  color:var(--text2);font-size:11.5px;font-weight:600;
  cursor:pointer;transition:all var(--transition);
  box-shadow:var(--sh-raised);white-space:nowrap;
}
.view-receipt-btn:hover{border-color:var(--accent);color:var(--accent-text);background:var(--accent-bg);}

/* Void / Refund action buttons */
.void-btn{
  display:inline-flex;align-items:center;gap:4px;
  padding:5px 10px;border-radius:var(--r-xs);
  border:1px solid rgba(244,63,94,.3);background:var(--red-bg);
  color:var(--red-text);font-size:11.5px;font-weight:700;
  cursor:pointer;transition:all var(--transition);white-space:nowrap;
}
.void-btn:hover{border-color:var(--red-text);background:rgba(244,63,94,.2);}
.refund-btn{
  display:inline-flex;align-items:center;gap:4px;
  padding:5px 10px;border-radius:var(--r-xs);
  border:1px solid rgba(245,158,11,.3);background:var(--amber-bg);
  color:var(--amber-text);font-size:11.5px;font-weight:700;
  cursor:pointer;transition:all var(--transition);white-space:nowrap;
}
.refund-btn:hover{border-color:var(--amber-text);background:rgba(245,158,11,.2);}
.action-cell{display:flex;align-items:center;gap:5px;flex-wrap:wrap;}

/* Status badges extended */
.bg-voided{background:var(--red-bg);color:var(--red-text);border-color:rgba(244,63,94,.3);}
.bg-refunded{background:var(--amber-bg);color:var(--amber-text);border-color:rgba(245,158,11,.3);}

/* Void modal */
.void-warning{
  background:var(--red-bg);border:1px solid rgba(244,63,94,.3);
  border-radius:var(--r-sm);padding:14px 16px;margin-bottom:18px;
  display:flex;gap:12px;align-items:flex-start;
}
.void-warning .w-icon{font-size:22px;flex-shrink:0;}
.void-warning h4{font-size:13.5px;font-weight:800;color:var(--red-text);margin-bottom:4px;}
.void-warning p{font-size:12.5px;color:var(--red-text);opacity:.8;line-height:1.5;}

/* Refund modal */
.refund-type-row{display:flex;gap:8px;margin-bottom:18px;}
.rtype-btn{
  flex:1;padding:12px;border-radius:var(--r-sm);
  border:1.5px solid var(--border);background:var(--surface2);
  text-align:center;cursor:pointer;transition:all var(--transition);
}
.rtype-btn:hover{border-color:var(--border2);}
.rtype-btn.active{border-color:var(--accent);background:var(--accent-bg);}
.rtype-btn .rt-icon{font-size:22px;margin-bottom:6px;}
.rtype-btn .rt-label{font-size:13px;font-weight:800;color:var(--text);}
.rtype-btn .rt-desc{font-size:11px;color:var(--text3);margin-top:2px;}
.rtype-btn.active .rt-label{color:var(--accent-text);}

.refund-items-list{
  background:var(--surface2);border:1px solid var(--border);
  border-radius:var(--r-sm);padding:12px;margin-bottom:14px;
  display:flex;flex-direction:column;gap:8px;
  box-shadow:var(--sh-inset);
}
.ri-row{display:flex;align-items:center;gap:10px;}
.ri-thumb{width:32px;height:32px;border-radius:var(--r-xs);background:var(--surface3);display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;}
.ri-name{flex:1;font-size:13px;font-weight:600;}
.ri-qty-ctrl{display:flex;align-items:center;gap:6px;}
.ri-qty-btn{width:22px;height:22px;border-radius:var(--r-xs);border:1px solid var(--border);background:var(--surface);color:var(--text2);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;font-weight:800;transition:all var(--transition);}
.ri-qty-btn:hover{border-color:var(--accent);color:var(--accent-text);}
.ri-qty-num{font-size:13px;font-weight:800;min-width:28px;text-align:center;font-family:var(--mono);}
.ri-max{font-size:11px;color:var(--text3);}
.ri-price{font-size:13px;font-weight:700;font-family:var(--mono);color:var(--text2);}

.refund-summary{
  background:var(--amber-bg);border:1px solid rgba(245,158,11,.3);
  border-radius:var(--r-sm);padding:12px 14px;margin-bottom:14px;
  display:flex;justify-content:space-between;align-items:center;
}
.rs-label{font-size:13px;font-weight:700;color:var(--amber-text);}
.rs-amount{font-size:20px;font-weight:800;font-family:var(--mono);color:var(--amber-text);}

.restore-toggle{
  display:flex;align-items:center;gap:10px;
  padding:11px 14px;background:var(--surface2);
  border:1px solid var(--border);border-radius:var(--r-sm);
  margin-bottom:14px;cursor:pointer;
}
.restore-toggle input{accent-color:var(--accent);width:15px;height:15px;}
.restore-toggle-text{flex:1;}
.restore-toggle-text strong{font-size:13px;font-weight:700;display:block;}
.restore-toggle-text span{font-size:11.5px;color:var(--text3);}

.reason-field{margin-bottom:14px;}
.reason-field label{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.6px;color:var(--text3);display:block;margin-bottom:6px;}
.reason-field textarea{
  width:100%;padding:10px 12px;
  background:var(--surface2);border:1px solid var(--border);
  border-radius:var(--r-sm);font-size:13px;color:var(--text);
  outline:none;resize:none;height:72px;line-height:1.5;
  font-family:inherit;box-shadow:var(--sh-inset);
}
.reason-field textarea:focus{border-color:var(--accent);}
.reason-field textarea::placeholder{color:var(--text3);}

/* Voided/Refunded row styling */
tbody tr.voided{opacity:.6;}
tbody tr.voided td{text-decoration:line-through;text-decoration-color:var(--red-text);}
tbody tr.voided td:first-child,tbody tr.voided td:last-child{text-decoration:none;}

/* Txn receipt modal - reuse or-modal but with "viewed" header instead of success */
.or-viewed-bar{
  display:flex;align-items:center;gap:12px;
  background:var(--accent-bg);border:1px solid rgba(91,79,233,.25);
  border-radius:var(--r);padding:12px 16px;margin-bottom:16px;
}
.or-viewed-bar .s-icon{font-size:24px;}
.or-viewed-bar h2{font-size:15px;font-weight:800;color:var(--accent-text);margin-bottom:1px;}
.or-viewed-bar p{font-size:12px;color:var(--accent-text);opacity:.7;}

/* ── Badges ── */
.badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:99px;font-size:11.5px;font-weight:700;border:1px solid transparent;}
.bg-green{background:var(--green-bg);color:var(--green-text);border-color:rgba(34,197,94,.3);}
.bg-amber{background:var(--amber-bg);color:var(--amber-text);border-color:rgba(245,158,11,.3);}
.bg-red{background:var(--red-bg);color:var(--red-text);border-color:rgba(244,63,94,.3);}
.bg-blue{background:var(--blue-bg);color:var(--blue);border-color:rgba(59,130,246,.3);}
.bg-purple{background:var(--accent-bg);color:var(--accent-text);border-color:rgba(91,79,233,.3);}
.bg-gray{background:var(--surface2);color:var(--text2);border-color:var(--border2);}

/* ── Settings ── */
.settings-wrap{display:grid;grid-template-columns:188px 1fr;gap:20px;}
.settings-nav-list{display:flex;flex-direction:column;gap:2px;}
.s-nav-item{
  padding:9px 12px;border-radius:var(--r-sm);
  font-size:13.5px;font-weight:600;color:var(--text2);
  cursor:pointer;transition:all var(--transition);
  background:none;border:none;text-align:left;width:100%;
}
.s-nav-item:hover{background:var(--surface2);color:var(--text);}
.s-nav-item.active{background:var(--accent-bg);color:var(--accent-text);}
.settings-cards{display:flex;flex-direction:column;gap:16px;}
.settings-card{
  background:var(--surface);border:1px solid var(--border);
  border-radius:var(--r-lg);padding:22px;box-shadow:var(--sh-raised);
}
.settings-card h3{font-size:15px;font-weight:800;letter-spacing:-.3px;margin-bottom:3px;}
.settings-card .desc{font-size:12.5px;color:var(--text3);margin-bottom:18px;}
.field-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.field{display:flex;flex-direction:column;gap:5px;}
.field.full{grid-column:1/-1;}
.field label{font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--text3);}
.field input,.field select{
  padding:10px 13px;background:var(--surface2);
  border:1px solid var(--border);border-radius:var(--r-sm);
  color:var(--text);font-size:13.5px;outline:none;
  transition:all var(--transition);box-shadow:var(--sh-inset);
}
.field input:focus,.field select:focus{border-color:var(--accent);box-shadow:var(--sh-inset),var(--sh-glow);}
.field select option{background:var(--surface);}

.qr-upload{
  border:2px dashed var(--border2);border-radius:var(--r-lg);
  padding:28px;text-align:center;cursor:pointer;
  transition:all var(--transition);max-width:280px;
}
.qr-upload:hover{border-color:var(--accent);background:var(--accent-bg);}
.qr-img{width:150px;height:150px;border-radius:var(--r);object-fit:contain;box-shadow:var(--sh-raised);}

/* ── Modals ── */
.overlay{
  position:fixed;inset:0;
  background:rgba(0,0,0,.55);backdrop-filter:blur(8px);
  z-index:200;
  display:flex;align-items:flex-start;justify-content:center;
  padding:24px 16px;
  overflow-y:auto;
  animation:ov-in .2s ease;
}
@keyframes ov-in{from{opacity:0;}}
.modal{
  background:var(--surface);border:1px solid var(--border2);
  border-radius:var(--r-xl);padding:26px;
  width:440px;max-width:96vw;
  box-shadow:var(--sh-float);
  animation:md-in .22s cubic-bezier(.34,1.56,.64,1);
}
.modal.wide{width:560px;}
.modal.xl{width:640px;}
@keyframes md-in{from{transform:translateY(18px) scale(.97);opacity:0;}}
.modal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;}
.modal-head h2{font-size:18px;font-weight:800;letter-spacing:-.4px;}
.modal-x{
  width:32px;height:32px;border-radius:var(--r-xs);
  border:1px solid var(--border);background:var(--surface2);
  color:var(--text2);display:flex;align-items:center;justify-content:center;
  transition:all var(--transition);box-shadow:var(--sh-raised);
}
.modal-x:hover{background:var(--red-bg);color:var(--red-text);border-color:var(--red);}
.modal-actions{display:flex;gap:10px;margin-top:20px;}
.modal-actions .btn{flex:1;justify-content:center;padding:11px;font-size:14px;}

/* Cash modal */
.amt-due{
  background:var(--surface2);border-radius:var(--r);padding:14px 18px;
  margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;
  box-shadow:var(--sh-inset);
}
.amt-due .lbl{font-size:13px;color:var(--text2);}
.amt-due .val{font-size:24px;font-weight:800;font-family:var(--mono);}
.quick-amts{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;}
.qa-btn{
  padding:7px 15px;background:var(--surface2);
  border:1px solid var(--border);border-radius:var(--r-sm);
  font-size:13px;font-weight:700;font-family:var(--mono);
  transition:all var(--transition);box-shadow:var(--sh-raised);
}
.qa-btn:hover{background:var(--accent);color:white;border-color:var(--accent);box-shadow:0 4px 14px var(--accent-glow);}
.cash-wrap{position:relative;margin-bottom:14px;}
.cash-pfx{position:absolute;left:14px;top:50%;transform:translateY(-50%);font-weight:800;color:var(--text2);font-family:var(--mono);}
.cash-input{
  width:100%;padding:13px 14px 13px 30px;
  background:var(--surface2);border:1px solid var(--border);
  border-radius:var(--r);font-size:24px;font-weight:800;font-family:var(--mono);
  color:var(--text);outline:none;transition:all var(--transition);box-shadow:var(--sh-inset);
}
.cash-input:focus{border-color:var(--accent);box-shadow:var(--sh-inset),var(--sh-glow);}
.change-box{
  background:var(--green-bg);border:1px solid rgba(34,197,94,.3);
  border-radius:var(--r);padding:14px 18px;
  display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;
}
.change-box .lbl{font-size:13px;color:var(--green-text);font-weight:700;}
.change-box .val{font-size:24px;font-weight:800;color:var(--green-text);font-family:var(--mono);}
.insuf{background:var(--red-bg);border:1px solid rgba(244,63,94,.3);border-radius:var(--r);padding:10px 14px;font-size:13px;color:var(--red-text);font-weight:700;margin-bottom:14px;display:flex;align-items:center;gap:7px;}

/* GCash modal */
.gcash-header{
  background:linear-gradient(135deg,#0070ba,#00b4d8);
  border-radius:var(--r-lg);padding:20px;text-align:center;margin-bottom:18px;color:white;
  box-shadow:0 8px 24px rgba(0,112,186,.35);
}
.gcash-header h3{font-size:15px;font-weight:700;margin-bottom:4px;opacity:.9;}
.gcash-header .gamt{font-size:32px;font-weight:800;font-family:var(--mono);}
.gcash-qr-area{text-align:center;margin-bottom:18px;}
.gcash-qr-area img{width:190px;height:190px;border-radius:var(--r-lg);border:1px solid var(--border);box-shadow:var(--sh-float);}
.no-qr{
  width:190px;height:190px;border-radius:var(--r-lg);
  border:2px dashed var(--border2);margin:0 auto;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:8px;color:var(--text3);font-size:13px;
}
.steps{display:flex;flex-direction:column;gap:8px;margin-bottom:18px;}
.step{display:flex;align-items:center;gap:10px;font-size:13px;color:var(--text2);}
.step-n{width:22px;height:22px;background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:99px;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:var(--sh-raised);}

/* Receipt */
.receipt-top{text-align:center;padding:6px 0 16px;}
.receipt-icon{font-size:54px;animation:pop .4s cubic-bezier(.175,.885,.32,1.275);}
@keyframes pop{from{transform:scale(0);}to{transform:scale(1);}}
.receipt-top h2{font-size:22px;font-weight:800;letter-spacing:-.5px;margin:10px 0 4px;}
.receipt-top p{font-size:12.5px;color:var(--text3);}
.receipt-body{background:var(--surface2);border-radius:var(--r);padding:15px;margin:16px 0;box-shadow:var(--sh-inset);}
.r-item{display:flex;justify-content:space-between;font-size:12.5px;padding:5px 0;border-bottom:1px solid var(--border);}
.r-item:last-child{border:none;}
.r-totals{border-top:1px solid var(--border2);padding-top:10px;margin-top:2px;}
.r-row{display:flex;justify-content:space-between;font-size:12.5px;padding:4px 0;color:var(--text2);}
.r-row.grand{color:var(--text);font-size:15px;font-weight:800;padding-top:8px;border-top:1px solid var(--border2);margin-top:4px;}
.r-row.disc{color:var(--green-text);}

/* Official BIR Receipt */
.or-modal{width:420px;max-width:96vw;}

/* Print / action button row below receipt */
.receipt-actions{
  display:flex;gap:8px;margin-top:14px;
}
.print-btn{
  flex:1;display:flex;align-items:center;justify-content:center;gap:7px;
  padding:11px 16px;border-radius:var(--r-sm);
  border:1.5px solid var(--border2);background:var(--surface2);
  color:var(--text2);font-size:13px;font-weight:700;
  cursor:pointer;transition:all var(--transition);
}
.print-btn:hover{border-color:var(--accent);color:var(--accent-text);background:var(--accent-bg);}
.print-btn svg{flex-shrink:0;}
.or-success-bar{
  display:flex;align-items:center;gap:12px;
  background:var(--green-bg);border:1px solid rgba(34,197,94,.3);
  border-radius:var(--r);padding:12px 16px;margin-bottom:16px;
}
.or-success-bar .s-icon{font-size:28px;animation:pop .4s cubic-bezier(.175,.885,.32,1.275);}
.or-success-bar h2{font-size:16px;font-weight:800;color:var(--green-text);margin-bottom:1px;}
.or-success-bar p{font-size:12px;color:var(--green-text);opacity:.8;}

.or-paper{
  background:var(--surface2);
  border:1px solid var(--border2);
  border-radius:var(--r);
  overflow:hidden;
  box-shadow:var(--sh-inset);
  margin-bottom:14px;
}
.or-header{
  text-align:center;
  padding:16px 16px 12px;
  border-bottom:2px dashed var(--border2);
}
.or-biz-name{font-size:16px;font-weight:800;letter-spacing:-.3px;margin-bottom:2px;}
.or-owner{font-size:11.5px;color:var(--text2);margin-bottom:4px;}
.or-address{font-size:10.5px;color:var(--text3);line-height:1.4;margin-bottom:4px;}
.or-contact{font-size:10.5px;color:var(--text3);margin-bottom:8px;}
.or-tin-row{
  display:inline-block;
  background:var(--surface3);
  border:1px solid var(--border2);
  border-radius:4px;
  padding:3px 10px;
  font-size:10px;font-weight:800;
  text-transform:uppercase;letter-spacing:.5px;
  color:var(--text2);
}
.or-title-row{
  display:flex;align-items:center;justify-content:space-between;
  background:var(--surface3);
  padding:8px 14px;
  margin:0;
  border-bottom:1px solid var(--border);
}
.or-title{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:var(--text2);}
.or-ref{font-size:11px;font-family:var(--mono);font-weight:700;color:var(--accent-text);}
.or-meta{
  display:flex;justify-content:space-between;
  padding:8px 14px;border-bottom:1px solid var(--border);
  font-size:11px;color:var(--text3);
}
.or-meta span strong{color:var(--text);font-weight:700;}
.or-items{padding:10px 14px;}
.or-item-row{
  display:flex;justify-content:space-between;align-items:flex-start;
  padding:5px 0;border-bottom:1px solid var(--border);gap:8px;
}
.or-item-row:last-child{border:none;}
.or-item-left{flex:1;min-width:0;}
.or-item-name{font-size:12.5px;font-weight:700;}
.or-item-sub{font-size:11px;color:var(--text3);font-family:var(--mono);}
.or-item-right{text-align:right;flex-shrink:0;}
.or-item-total{font-size:12.5px;font-weight:800;font-family:var(--mono);}

.or-totals{
  border-top:2px dashed var(--border2);
  padding:10px 14px;
}
.or-t-row{display:flex;justify-content:space-between;font-size:12px;padding:3px 0;color:var(--text2);}
.or-t-row .v{font-family:var(--mono);font-weight:600;}
.or-t-row.disc .v{color:var(--green-text);}
.or-t-row.grand{
  font-size:15px;font-weight:800;color:var(--text);
  padding-top:8px;margin-top:4px;
  border-top:2px solid var(--border2);
}
.or-t-row.grand .v{font-family:var(--mono);color:var(--accent-text);}
.or-payment-badge{
  display:flex;align-items:center;justify-content:center;gap:7px;
  margin:8px 0 0;padding:8px;
  background:var(--accent-bg);border-radius:var(--r-sm);
  font-size:12px;font-weight:700;color:var(--accent-text);
}
.or-vat-breakdown{
  border-top:1px solid var(--border);
  padding:8px 14px;
  display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;
  text-align:center;
}
.or-vat-col .lbl{font-size:9.5px;color:var(--text3);text-transform:uppercase;letter-spacing:.4px;margin-bottom:2px;}
.or-vat-col .val{font-size:11.5px;font-weight:800;font-family:var(--mono);}
.or-footer{
  text-align:center;padding:10px 16px 14px;
  border-top:2px dashed var(--border2);
}
.or-footer p{font-size:10.5px;color:var(--text3);line-height:1.5;margin-bottom:6px;}
.or-accred{font-size:9.5px;color:var(--text3);opacity:.7;}

/* Discount modal */
.disc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;}
.disc-opt{
  padding:14px 10px;border:1.5px solid var(--border);border-radius:var(--r);
  text-align:center;cursor:pointer;transition:all var(--transition);
  background:var(--surface2);box-shadow:var(--sh-raised);
}
.disc-opt:hover{border-color:var(--border2);transform:translateY(-1px);}
.disc-opt.sel{border-color:var(--accent);background:var(--accent-bg);box-shadow:0 4px 14px var(--accent-glow);}
.do-ico{font-size:22px;margin-bottom:6px;}
.do-name{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.3px;color:var(--text2);}
.do-pct{font-size:20px;font-weight:800;color:var(--accent-text);font-family:var(--mono);margin:3px 0 1px;}
.do-desc{font-size:10px;color:var(--text3);}
.custom-row{display:flex;align-items:center;gap:10px;margin-top:6px;}
.custom-row input{
  flex:1;padding:10px 13px;background:var(--surface2);
  border:1px solid var(--border);border-radius:var(--r-sm);
  font-size:18px;font-weight:800;font-family:var(--mono);
  color:var(--text);outline:none;box-shadow:var(--sh-inset);
}
.custom-row input:focus{border-color:var(--accent);}
.custom-row span{font-size:13px;color:var(--text2);font-weight:600;}
.disc-preview{
  background:var(--green-bg);border:1px solid rgba(34,197,94,.3);
  border-radius:var(--r-sm);padding:11px 14px;
  font-size:13px;font-weight:700;color:var(--green-text);
  display:flex;align-items:center;gap:8px;
}

/* Icon Picker / Product Modal */
.prod-media-row{display:flex;gap:10px;margin-bottom:18px;}
.media-opt{
  flex:1;padding:14px;border:1.5px solid var(--border);border-radius:var(--r);
  text-align:center;cursor:pointer;transition:all var(--transition);
  background:var(--surface2);box-shadow:var(--sh-raised);
}
.media-opt:hover{border-color:var(--border2);}
.media-opt.sel{border-color:var(--accent);background:var(--accent-bg);}
.media-opt .mo-icon{font-size:24px;margin-bottom:6px;}
.media-opt .mo-label{font-size:12px;font-weight:700;color:var(--text2);}

.icon-picker-wrap{margin-bottom:14px;}
.icon-picker-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;}
.ip-tab{
  padding:5px 12px;border-radius:99px;border:1px solid var(--border);
  background:var(--surface2);font-size:11.5px;font-weight:600;color:var(--text2);
  cursor:pointer;transition:all var(--transition);
}
.ip-tab.active{background:var(--accent);border-color:var(--accent);color:white;}
.icon-grid{display:grid;grid-template-columns:repeat(10,1fr);gap:4px;max-height:180px;overflow-y:auto;padding:4px;}
.icon-cell{
  width:32px;height:32px;border-radius:var(--r-xs);font-size:18px;
  display:flex;align-items:center;justify-content:center;cursor:pointer;
  transition:all var(--transition);border:1.5px solid transparent;
}
.icon-cell:hover{background:var(--surface3);}
.icon-cell.sel{background:var(--accent-bg);border-color:var(--accent);}

.upload-drop{
  border:2px dashed var(--border2);border-radius:var(--r);padding:22px;
  text-align:center;cursor:pointer;transition:all var(--transition);
  background:var(--surface2);
}
.upload-drop:hover{border-color:var(--accent);background:var(--accent-bg);}
.upload-drop p{font-size:13px;color:var(--text3);margin-top:8px;}
.upload-preview{
  width:100%;max-height:140px;object-fit:contain;border-radius:var(--r-sm);margin-bottom:8px;box-shadow:var(--sh-raised);
}

.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.form-field{display:flex;flex-direction:column;gap:5px;}
.form-field.full{grid-column:1/-1;}
.form-field label{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.6px;color:var(--text3);}
.form-field input,.form-field select{
  padding:10px 12px;background:var(--surface2);
  border:1px solid var(--border);border-radius:var(--r-sm);
  color:var(--text);font-size:14px;outline:none;
  box-shadow:var(--sh-inset);transition:all var(--transition);
}
.form-field input:focus,.form-field select:focus{border-color:var(--accent);box-shadow:var(--sh-inset),var(--sh-glow);}

@media(max-width:900px){
  :root{--sidebar-w:64px;}
  .sb-brand{justify-content:center;padding:0;}
  .brand-text,.sb-section-label,.nav-label,.nav-badge,.user-info{display:none;}
  .stat-grid{grid-template-columns:repeat(2,1fr);}
  .charts-grid{grid-template-columns:1fr;}
}

/* ── Print Styles ── */
@media print {
  /* Hide everything */
  body > * { display: none !important; }

  /* Show only the receipt paper */
  .print-receipt-root,
  .print-receipt-root * { display: revert !important; }

  /* Receipt paper styles */
  .print-receipt-root {
    position: fixed !important;
    inset: 0 !important;
    z-index: 9999 !important;
    background: white !important;
    display: flex !important;
    justify-content: center !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  .or-paper {
    width: 80mm !important;
    max-width: 80mm !important;
    box-shadow: none !important;
    border: none !important;
    background: white !important;
    color: black !important;
    font-size: 11px !important;
    padding: 8px !important;
  }
  /* Hide all modal chrome — only paper shows */
  .or-success-bar,
  .or-viewed-bar,
  .print-hide { display: none !important; }
  /* Force dark text on white */
  .or-paper * { color: black !important; background: transparent !important; border-color: #ddd !important; }
  .or-t-row.grand { border-top: 1.5px solid black !important; }
  .or-t-row.grand span { font-size: 13px !important; font-weight: 900 !important; }
}
`;
