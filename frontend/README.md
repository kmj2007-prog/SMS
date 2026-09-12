# 살면살아 프론트엔드

## Kakao Maps 설정

1. [Kakao Developers](https://developers.kakao.com/)에서 애플리케이션을 생성합니다.
2. 앱 키에서 **JavaScript 키**를 확인합니다. REST API 키는 사용하지 않습니다.
3. 플랫폼 > Web에 사이트 도메인을 등록합니다.
4. 로컬 개발 주소는 Vite 기본 포트 기준 `http://localhost:5173` 입니다.
5. `frontend/.env` 파일을 만들고 아래 환경변수를 입력합니다.

```
VITE_KAKAO_MAP_APP_KEY=your_kakao_javascript_key
```

6. 환경변수를 바꾼 뒤에는 개발 서버를 재시작합니다.

```
cd frontend
npm run dev
```
