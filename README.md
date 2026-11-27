# NAVI KING — Landing page

> **Tự động deploy:** mỗi lần đẩy code (push) lên nhánh `main`, Cloudflare Workers Builds tự build và đưa lên https://naviking.vn trong khoảng 1 phút.
>
> Cấu trúc repo: `wrangler.jsonc` (cấu hình Cloudflare) · `public/` (toàn bộ website).


Trang giới thiệu doanh nghiệp, viết bằng HTML + CSS + JavaScript thuần. Không cần cài đặt hay build: mở `index.html` bằng trình duyệt là chạy, hoặc tải nguyên thư mục lên bất kỳ hosting tĩnh nào (cPanel, Netlify, Vercel, GitHub Pages, Cloudflare Pages…).

```
public/
├── index.html            Toàn bộ nội dung trang
├── assets/css/styles.css Design system (màu, chữ, khoảng cách ở đầu file) + giao diện
├── assets/js/config.js   ⚙️ Thông tin liên hệ, kênh bán hàng, form — sửa ở đây
├── assets/js/main.js     Menu di động, hiệu ứng cuộn, tabs, form, đổ dữ liệu config
└── assets/img/           Logo, huy hiệu, favicon, ảnh chia sẻ mạng xã hội
```

## 1. File cấu hình — `assets/js/config.js`

Mọi thông tin hay thay đổi nằm trong **một file duy nhất**, không cần sửa HTML:

| Mục | Ý nghĩa |
|---|---|
| `company.name`, `company.address` | Tên công ty, địa chỉ (hiện ở Liên hệ + dùng cho bản đồ) |
| `contact.hotline`, `contact.email`, `contact.website` | Để trống thì dòng tương ứng tự ẩn |
| `channels.shopee`, `tiktok`, `zalo`, `facebook` | Link kênh bán hàng. Để trống → thẻ hiện "Đang cập nhật". Zalo có thể điền số điện thoại |
| `form.endpoint` | URL nhận dữ liệu form (xem mục 3) |
| `form.demo` | `true` = form luôn giả lập gửi thành công (chỉ cho bản demo) |
| `map.embed` | `true` = nhúng Google Maps theo địa chỉ |

Tên miền `naviking.vn` đã được điền sẵn trong thẻ canonical, Open Graph, `robots.txt` và `sitemap.xml`.

## 2. Hình ảnh

Ảnh trong `assets/img/` đã được nén sang WebP:

- `banner-*.webp` — banner danh mục ở hero (4 vùng trên banner bấm được, dẫn tới từng sản phẩm). Trên điện thoại banner tự chuyển thành 4 thẻ vuốt ngang (`*-card.webp`).
- `shampoo-*`, `plastic-*`, `wax-*`, `tile-*` — ảnh sản phẩm (600px và 1000px).
- `navi-king-logo-*`, `navi-king-shield.*` — logo ngang và logo khiên (nền trong suốt).

Theo ghi chú trong hồ sơ, ảnh sản phẩm hiện là hình minh họa/concept. Khi có ảnh bao bì chính thức, thay file **giữ nguyên tên và tỷ lệ vuông 1:1** (thẻ dọc: 450×630) là xong.

## 3. Kết nối form liên hệ

Form gửi dữ liệu dạng JSON (POST) tới `form.endpoint`. Dữ liệu gồm: `name`, `company`, `phone`, `email`, `need`, `message`, `page`.

- **Formspree** (nhanh nhất): tạo form → dán URL `https://formspree.io/f/xxxx`, email về hộp thư của bạn.
- **Google Apps Script**: ghi thẳng vào Google Sheets.
- **API / CRM riêng**: trả mã 2xx khi thành công, cho phép CORS từ tên miền của bạn.

Khi **chưa** có endpoint: chạy trên máy (file://, localhost) form giả lập gửi thành công để xem thử; trên tên miền thật form báo lỗi — tránh việc khách tưởng đã gửi mà không ai nhận.

## 4. Nội dung sản phẩm

Mỗi sản phẩm là một khối `<article class="product">` trong `index.html` (mô tả, điểm nổi bật, hướng dẫn sử dụng, lưu ý). Lưu ý từ hồ sơ: tỷ lệ pha, hướng dẫn sử dụng và tuyên bố hiệu quả cần đối chiếu với công thức, nhãn hàng hóa và thử nghiệm thực tế trước khi dùng trong quảng cáo chính thức.


## Đưa lên Cloudflare Pages

Gói `navi-king-cloudflare.zip` đã sẵn sàng: `index.html` nằm ngay ở gốc, kèm `_headers` (cache + bảo mật) và `404.html`.

### Cách 1 — Kéo thả (không cần cài gì)
1. Đăng nhập Cloudflare → **Workers & Pages** → **Create application** → **Pages** → **Upload assets** (Direct Upload).
2. Đặt tên dự án, ví dụ `navi-king` → trang sẽ có địa chỉ `navi-king.pages.dev`.
3. Kéo thả file `navi-king-cloudflare.zip` (hoặc cả thư mục) → **Deploy site**.
4. Lần sau cập nhật: vào dự án → **Create deployment** → kéo thả bản mới.

### Cách 2 — Wrangler CLI (cho người quen dòng lệnh)
```bash
npx wrangler login
npx wrangler pages deploy ./navi-king --project-name navi-king
```
Wrangler nhận **thư mục**, không nhận file zip.

### Tên miền riêng
Trong dự án Pages → **Custom domains** → **Set up a custom domain** → nhập tên miền (ví dụ `naviking.vn`) và làm theo hướng dẫn DNS. Sau đó thay `[TÊN-MIỀN]` trong thẻ `canonical` của `index.html`, và đổi `og:image` thành đường dẫn đầy đủ `https://<tên-miền>/assets/img/og-image.jpg` để chia sẻ lên Facebook/Zalo hiện ảnh.

### Trước khi chạy thật
- `assets/js/config.js`: `form.demo` phải là `false`, điền `form.endpoint` (Formspree…) để form gửi được.
- Điền hotline / email / link kênh bán hàng khi có — sửa `config.js` rồi deploy lại, không cần đụng HTML.

## 5. Đổi màu / chữ

Mọi màu, font và khoảng cách nằm trong `:root` ở đầu `assets/css/styles.css`:

- `--c-gold` vàng thương hiệu · `--c-blue` xanh điện · `--c-night` / `--c-navy` nền tối
- `--c-gold-ink` vàng đậm dùng cho chữ trên nền sáng (đạt chuẩn tương phản WCAG AA)
- Font: **Inter** (Google Fonts), hỗ trợ đầy đủ tiếng Việt.

## Đã có sẵn

- Responsive cho desktop, laptop, tablet, mobile; menu riêng cho mobile (đóng bằng phím Esc).
- Header dính khi cuộn, cuộn mượt tới từng section.
- Hiện dần khi cuộn, parallax nhẹ, hiệu ứng hover — tự tắt khi người dùng bật *Giảm chuyển động* trong hệ điều hành.
- Tabs Giải pháp chuẩn truy cập (điều khiển bằng phím mũi tên), link "Bỏ qua đến nội dung chính", focus hiển thị rõ.
- SEO: meta description, Open Graph (ảnh chia sẻ `og-image.jpg`), dữ liệu có cấu trúc `Organization`, favicon.
