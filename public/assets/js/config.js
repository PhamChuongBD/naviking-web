/* ==========================================================================
   CẤU HÌNH NAVI KING — chỉ cần sửa file này để cập nhật thông tin liên hệ.
   Ô nào để trống ('') sẽ tự ẩn hoặc hiện "Đang cập nhật" trên trang.
   ========================================================================== */
window.NAVI_CONFIG = {
  company: {
    name: 'NAVI KING',
    address: '21A đường 19A, Phường Bình Hưng Hòa, TP. Hồ Chí Minh'
  },

  contact: {
    hotline: '',   // ví dụ: '0901 234 567'
    email: '',     // ví dụ: 'lienhe@naviking.vn'
    website: ''    // ví dụ: 'https://naviking.vn'
  },

  // Kênh bán hàng & liên hệ trực tuyến: dán link đầy đủ (https://...).
  // Zalo có thể điền số điện thoại (tự chuyển thành link zalo.me).
  channels: {
    shopee: 'https://s.shopee.vn/114oQhmiGC',
    tiktok: 'https://vt.tiktok.com/ZSsBd4yE5/?page=TikTokShop',
    zalo: '0969707171',
    facebook: 'https://www.facebook.com/share/1DqHC7bLRk/?mibextid=wwXIfr'
  },

  form: {
    // URL nhận dữ liệu form dạng POST JSON (Formspree, Google Apps Script, API riêng...).
    endpoint: '',
    // true = luôn giả lập gửi thành công (chỉ dùng cho bản demo). Khi chạy thật để false.
    demo: false
  },

  map: {
    // true = nhúng bản đồ Google Maps theo địa chỉ ở trên.
    embed: true
  }
};
