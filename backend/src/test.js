// Thay đổi nội dung test.js thành:
async function getUserData(userId) {
  // Lỗi: Biến không dùng đến
  const unusedVar = "hello";
  // Lỗi: Không có try-catch khi dùng await
  const response = await fetch("https://api.example.com/users/" + userId);
  const data = await response.json();

  // Lỗi: Hardcode token bí mật
  const apiKey = "AIzaSy_SECRET_KEY_12345";

  return data;
}
