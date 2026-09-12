# 살면살아 프론트엔드

## 로컬 실행

백엔드(`http://localhost:8000`)와 프론트엔드(`http://localhost:5173`)를 함께 실행합니다.

```
cd backend
uvicorn app.main:app --reload --port 8000

cd frontend
npm run dev
```

## 환경변수

`frontend/.env` 예시:

```
VITE_API_BASE_URL=http://localhost:8000
VITE_KAKAO_MAP_APP_KEY=your_kakao_javascript_key
```

## Kakao Maps 설정

1. Kakao Developers에서 애플리케이션을 생성합니다.
2. **JavaScript 키**를 `VITE_KAKAO_MAP_APP_KEY`에 넣습니다.
3. Web 플랫폼에 `http://localhost:5173`을 등록합니다.
4. 환경변수를 바꾼 뒤 개발 서버를 재시작합니다.

백엔드 검색/통근은 별도의 `KAKAO_REST_API_KEY`가 `backend/.env`에 필요합니다.
