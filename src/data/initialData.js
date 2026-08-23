// ─── Icon Picker Library ──────────────────────────────────────────────────────
export const ICON_LIBRARY = {
  "Food & Drinks": ["☕","🥛","🧋","🍵","🧃","🥤","🍺","🍷","🍸","💧","🧊","🫖","🍔","🍟","🌮","🥪","🥗","🍕","🍣","🍜","🍝","🥩","🍗","🥚","🧆","🥙","🌯","🫔"],
  "Desserts": ["🍰","🎂","🧁","🍩","🍪","🍫","🍬","🍭","🍮","🧇","🥞","🍦","🍧","🍨","🫐","🍓","🍒","🍑","🥭","🍍","🍊","🍋"],
  "Snacks": ["🍿","🥨","🧂","🥜","🌰","🍡","🧀","🥐","🥖","🥞","🧈","🫙","🥫"],
  "Retail": ["👕","👖","👗","👠","👟","🧢","🎒","💍","⌚","🕶️","💄","🧴","🧹","🧺","📦","🛍️","🎁","💝"],
  "Electronics": ["📱","💻","🖥️","⌨️","🖱️","📷","🎧","🎮","🔋","💡","📺","📻","⌚"],
  "Health": ["💊","🩺","🩹","🧬","🌿","🌱","🍃","🫁","❤️","🧘","🏃","💪"],
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
export const CATS = ["All","Drinks","Food","Desserts","Snacks","Retail"];
export const DISCOUNTS = [
  { id:"senior", name:"Senior Citizen", pct:20, icon:"👴", desc:"RA 9994" },
  { id:"pwd",    name:"PWD",            pct:20, icon:"♿", desc:"RA 10754" },
  { id:"employee",name:"Employee",      pct:15, icon:"🏷️", desc:"Staff discount" },
  { id:"loyalty", name:"Loyalty",       pct:10, icon:"⭐", desc:"Regular customer" },
  { id:"student", name:"Student",       pct:5,  icon:"🎓", desc:"With valid ID" },
  { id:"custom",  name:"Custom",        pct:0,  icon:"✏️", desc:"Enter amount" },
];

export const INIT_PRODUCTS = [
  { id:1,  name:"Espresso",       price:85,  cat:"Drinks",   stock:50, icon:"☕", image:null, variants:[
    { id:"v1", name:"Size", required:true, options:[{id:"o1",name:"Solo",price:0},{id:"o2",name:"Doppio",price:30}]},
    { id:"v2", name:"Temperature", required:true, options:[{id:"o3",name:"Hot",price:0},{id:"o4",name:"Iced",price:10}]},
  ]},
  { id:2,  name:"Café Latte",     price:120, cat:"Drinks",   stock:45, icon:"🥛", image:null, variants:[
    { id:"v3", name:"Size", required:true, options:[{id:"o5",name:"Small",price:0},{id:"o6",name:"Medium",price:25},{id:"o7",name:"Large",price:45}]},
    { id:"v4", name:"Temperature", required:true, options:[{id:"o8",name:"Hot",price:0},{id:"o9",name:"Iced",price:15}]},
    { id:"v5", name:"Add-ons", required:false, options:[{id:"o10",name:"Extra Shot",price:25},{id:"o11",name:"Oat Milk",price:30},{id:"o12",name:"Vanilla Syrup",price:15}]},
  ]},
  { id:3,  name:"Americano",      price:95,  cat:"Drinks",   stock:60, icon:"☕", image:null, variants:[
    { id:"v6", name:"Size", required:true, options:[{id:"o13",name:"Regular",price:0},{id:"o14",name:"Large",price:30}]},
    { id:"v7", name:"Temperature", required:true, options:[{id:"o15",name:"Hot",price:0},{id:"o16",name:"Iced",price:10}]},
  ]},
  { id:4,  name:"Mango Shake",    price:130, cat:"Drinks",   stock:18, icon:"🥭", image:null, variants:[
    { id:"v8", name:"Size", required:true, options:[{id:"o17",name:"Regular",price:0},{id:"o18",name:"Large",price:30}]},
    { id:"v9", name:"Add-ons", required:false, options:[{id:"o19",name:"Extra Mango",price:20},{id:"o20",name:"Nata de Coco",price:15}]},
  ]},
  { id:5,  name:"Orange Juice",   price:75,  cat:"Drinks",   stock:25, icon:"🍊", image:null, variants:[] },
  { id:6,  name:"Cheese Burger",  price:180, cat:"Food",     stock:20, icon:"🍔", image:null, variants:[
    { id:"v10", name:"Doneness", required:true, options:[{id:"o21",name:"Regular",price:0},{id:"o22",name:"Well Done",price:0}]},
    { id:"v11", name:"Add-ons", required:false, options:[{id:"o23",name:"Extra Cheese",price:25},{id:"o24",name:"Bacon",price:35},{id:"o25",name:"Fried Egg",price:20}]},
  ]},
  { id:7,  name:"Club Sandwich",  price:155, cat:"Food",     stock:15, icon:"🥪", image:null, variants:[] },
  { id:8,  name:"Caesar Salad",   price:145, cat:"Food",     stock:12, icon:"🥗", image:null, variants:[
    { id:"v12", name:"Size", required:true, options:[{id:"o26",name:"Regular",price:0},{id:"o27",name:"Large",price:40}]},
    { id:"v13", name:"Protein", required:false, options:[{id:"o28",name:"Grilled Chicken",price:45},{id:"o29",name:"Shrimp",price:60}]},
  ]},
  { id:9,  name:"Fried Rice",     price:90,  cat:"Food",     stock:30, icon:"🍚", image:null, variants:[
    { id:"v14", name:"Add-ons", required:false, options:[{id:"o30",name:"Extra Egg",price:15},{id:"o31",name:"Spam",price:30}]},
  ]},
  { id:10, name:"Cheesecake",     price:110, cat:"Desserts", stock:8,  icon:"🍰", image:null, variants:[] },
  { id:11, name:"Choco Brownie",  price:90,  cat:"Desserts", stock:10, icon:"🍫", image:null, variants:[] },
  { id:12, name:"Fries",          price:65,  cat:"Snacks",   stock:40, icon:"🍟", image:null, variants:[
    { id:"v15", name:"Size", required:true, options:[{id:"o32",name:"Regular",price:0},{id:"o33",name:"Large",price:25}]},
    { id:"v16", name:"Flavor", required:false, options:[{id:"o34",name:"Cheese",price:15},{id:"o35",name:"BBQ",price:15},{id:"o36",name:"Sour Cream",price:15}]},
  ]},
  { id:13, name:"Nachos",         price:85,  cat:"Snacks",   stock:22, icon:"🌮", image:null, variants:[] },
  { id:14, name:"Bottled Water",  price:30,  cat:"Drinks",   stock:100,icon:"💧", image:null, variants:[] },
];

export const genId = () => Math.random().toString(36).slice(2,8).toUpperCase();
export const fmt = n => `₱${Number(n).toLocaleString("en-PH",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
export const todayStr = () => new Date().toISOString().slice(0,10);
export const WEEK_DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export const buildTxns = () => Array.from({length:18},(_,i)=>{
  const d=new Date(); d.setDate(d.getDate()-(17-i));
  const items=INIT_PRODUCTS.slice(0,Math.ceil(Math.random()*4)+1).map(p=>({...p,qty:Math.ceil(Math.random()*3),note:""}));
  const sub=items.reduce((s,it)=>s+it.price*it.qty,0);
  const disc=Math.random()>.65?Math.round(sub*.1):0;
  const tax=Math.round((sub-disc)*.12);
  return {id:`TXN-${genId()}`,date:d.toISOString().slice(0,10),items,subtotal:sub,discount:disc,tax,total:sub-disc+tax,method:Math.random()>.45?"Cash":"GCash",status:"Completed"};
});

// ─── Staff / Roles ────────────────────────────────────────────────────────────
export const INIT_STAFF = [
  { id:"s1", name:"Admin Owner", pin:"1234", role:"owner",   avatar:"AO", active:true,  createdAt:"2025-01-01" },
  { id:"s2", name:"Maria Santos",pin:"5678", role:"manager", avatar:"MS", active:true,  createdAt:"2025-01-15" },
  { id:"s3", name:"Juan Reyes",  pin:"9012", role:"cashier", avatar:"JR", active:true,  createdAt:"2025-02-01" },
  { id:"s4", name:"Ana Cruz",    pin:"3456", role:"cashier", avatar:"AC", active:false, createdAt:"2025-02-10" },
];

export const ROLE_LABELS = { owner:"Owner", manager:"Manager", cashier:"Cashier" };
export const ROLE_COLORS = { owner:"var(--accent-text)", manager:"var(--green-text)", cashier:"var(--text2)" };
export const ROLE_BG         = { owner:"var(--accent-bg)",  manager:"var(--green-bg)",   cashier:"var(--surface3)" };

export const PERMISSIONS = {
  owner:   ["pos","analytics","transactions","inventory","inventory_edit","settings","staff","void","refund","discount_any","kitchen"],
  manager: ["pos","analytics","transactions","inventory","void","refund","discount_any","kitchen"],
  cashier: ["pos","kitchen"],
};

export const genStaffId = () => "s" + Math.random().toString(36).slice(2,8);
