/**
 * NAVI KING — nhận form liên hệ từ naviking.vn và ghi vào Google Sheet.
 * Cách cài: xem README (mục "Kết nối form với Google Sheet").
 */
const SHEET_NAME = 'Liên hệ website';   // tên tab sẽ tự tạo nếu chưa có
const NOTIFY_EMAIL = '';                // điền email nếu muốn nhận thông báo mỗi khi có yêu cầu mới

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    if (data.website) return json({ ok: true });            // ô chống spam bị điền → bỏ qua

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sh.getLastRow() === 0) {
      sh.appendRow(['Thời gian', 'Họ và tên', 'Cửa hàng / doanh nghiệp', 'Số điện thoại', 'Email', 'Nhu cầu', 'Nội dung', 'Trang gửi']);
      sh.getRange(1, 1, 1, 8).setFontWeight('bold');
      sh.setFrozenRows(1);
    }
    const row = [
      new Date(),
      clean(data.name), clean(data.company),
      "'" + String(data.phone || '').slice(0, 30),               // giữ số 0 đầu
      clean(data.email), clean(data.need), clean(data.message), clean(data.page)
    ];
    sh.appendRow(row);

    if (NOTIFY_EMAIL) {
      MailApp.sendEmail(NOTIFY_EMAIL, 'NAVI KING — yêu cầu mới từ ' + row[1],
        ['Họ tên: ' + row[1], 'Cửa hàng: ' + row[2], 'SĐT: ' + data.phone, 'Email: ' + row[4], 'Nhu cầu: ' + row[5], '', row[6]].join('\n'));
    }
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Cắt độ dài và chặn công thức độc hại (=, +, -, @ ở đầu ô)
function clean(v) {
  v = String(v || '').slice(0, 2000);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
