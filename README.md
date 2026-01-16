# HNUE Grade Simulator

Ứng dụng mô phỏng bảng điểm và tính CPA dự kiến cho sinh viên HNUE.

## Cài đặt và Chạy (Local)

1.  Cài đặt dependencies:
    ```bash
    npm install
    ```

2.  Chạy server development:
    ```bash
    npm run dev
    ```

## Deploy lên Vercel

Dự án này được cấu hình để deploy dễ dàng lên Vercel sử dụng Vite.

1.  Đẩy code lên GitHub.
2.  Tạo project mới trên Vercel và import repository này.
3.  Vercel sẽ tự động nhận diện `Vite` framework.
4.  Cài đặt mặc định của Vercel (`Build Command: vite build`, `Output Directory: dist`) là chính xác.

## Cấu trúc thư mục

Dự án sử dụng cấu trúc chuẩn của Vite + React:

```
/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── types.ts
    ├── components/
    └── services/
```

**LƯU Ý QUAN TRỌNG:** Nếu bạn thấy các file code (`.tsx`, `.ts`) nằm trực tiếp ở thư mục gốc (root) thay vì trong `src/`, vui lòng **XÓA CHÚNG** để tránh gây lỗi khi build. Chỉ giữ lại code trong thư mục `src/`.