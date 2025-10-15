# shoppingmol

Express.js와 SQLite를 사용한 간단한 온라인 쇼핑몰 웹 애플리케이션입니다.

## 개요

shoppingmol은 기본적인 전자상거래 기능을 구현한 학습용 프로젝트입니다. 사용자 인증, 상품 관리, 장바구니 기능을 포함하며 서버사이드 렌더링(EJS)을 사용합니다.

## 주요 기능

### 사용자 기능
- **회원가입/로그인** - 계정 생성 및 인증
- **비밀번호 암호화** - SHA-256 해시를 사용한 보안
- **세션 관리** - 로그인 상태 유지
- **사용자 정보 조회** - 개인 정보 페이지

### 상품 기능
- **상품 목록 조회** - 메인 페이지에서 상품 카드 형식으로 표시
- **상품 상세보기** - 개별 상품 정보 페이지
- **태그별 필터링** - 카테고리별 상품 검색
- **상품 이미지** - 타이틀, 메인, 서브 이미지 지원

### 장바구니 기능
- **장바구니 담기** - 상품을 장바구니에 추가
- **장바구니 조회** - 담은 상품 목록 확인
- **구매 기능** - (UI만 구현, 실제 결제는 미구현)

## 기술 스택

### Backend
- **Node.js** - 서버 런타임
- **Express.js 4.18.2** - 웹 프레임워크
- **SQLite3 5.1.6** - 경량 데이터베이스

### 인증 및 보안
- **express-session 1.17.3** - 세션 관리
- **memorystore 1.6.7** - 세션 스토어
- **crypto-js 4.2.0** - SHA-256 암호화

### 템플릿 엔진
- **EJS 3.1.9** - 서버사이드 렌더링

### 개발 도구
- **nodemon 3.1.7** - 개발 서버 자동 재시작
- **dotenv 16.3.1** - 환경 변수 관리
- **prettier-plugin-ejs** - 코드 포맷팅

## 프로젝트 구조

```
shoppingmol/
├── index.js              # Express 서버 및 라우팅
├── package.json          # 프로젝트 설정
├── .env                  # 환경 변수 (세션 시크릿 등)
├── static/
│   ├── css/
│   │   └── main.css      # 스타일시트
│   ├── js/
│   │   └── main.js       # 클라이언트 스크립트
│   └── db/
│       └── main.db       # SQLite 데이터베이스
└── views/
    ├── header.ejs        # 헤더 컴포넌트
    ├── footer.ejs        # 푸터 컴포넌트
    ├── main.ejs          # 메인 페이지
    ├── product.ejs       # 상품 상세 페이지
    ├── login.ejs         # 로그인 페이지
    ├── signup.ejs        # 회원가입 페이지
    ├── userinfo.ejs      # 사용자 정보 페이지
    ├── buket.ejs         # 장바구니 페이지
    └── template.ejs      # 기본 템플릿
```

## 데이터베이스 스키마

### product 테이블
```sql
CREATE TABLE product (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name STRING,
    description STRING,
    price INTEGER,
    titleImg STRING,
    mainImgs STRING,
    subImgs STRING,
    tag STRING
);
```

### users 테이블
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name STRING,
    nick STRING,
    phoneNumber STRING,
    pw STRING  -- SHA-256 해시값
);
```

## 설치 및 실행

### 사전 요구사항
- Node.js 14 이상
- npm 또는 yarn

### 1. 저장소 클론
```bash
git clone https://github.com/herbpot/shoppingmol.git
cd shoppingmol
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가:

```env
session=your-secret-session-key-here
```

### 4. 서버 실행

**개발 모드** (nodemon 사용):
```bash
npm test
```

**프로덕션 모드**:
```bash
node index.js
```

서버가 시작되면 http://localhost:8080 에서 접속 가능합니다.

## API 엔드포인트

### 페이지 라우트

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/` | 메인 페이지 (전체 상품 목록) |
| GET | `/:tag` | 태그별 상품 목록 |
| GET | `/product/:id` | 상품 상세 페이지 |
| GET | `/login` | 로그인 페이지 |
| GET | `/signup` | 회원가입 페이지 |
| GET | `/user/:id` | 사용자 정보 페이지 |
| GET | `/buket` | 장바구니 페이지 |

### API 라우트

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/login` | 로그인 처리 |
| POST | `/signup` | 회원가입 처리 |
| POST | `/user/:id` | 사용자 정보 수정 |
| POST | `/buket/:id` | 장바구니에 상품 추가 |
| POST | `/purchase` | 구매 처리 (미구현) |

## 주요 기능 구현

### 세션 관리
```javascript
const sessionObj = {
    secret: process.env.session,
    resave: false,
    saveUninitialized: true,
    store: new MemoryStore({ checkPeriod: maxAge }),
    cookie: {
        maxAge: 1000 * 60 * 30  // 30분
    }
};
```

### 비밀번호 암호화
```javascript
// 회원가입 시
const hashedPw = cryptojs.SHA256(password).toString();

// 로그인 검증 시
db.get(`SELECT * FROM users WHERE nick="${id}" AND pw="${hashedPw}"`);
```

### 상품 청크 처리
메인 페이지에서 상품을 4개씩 그룹화하여 표시:
```javascript
function chunk(data = [], size = 4) {
    const arr = [];
    for (let i = 0; i < data.length; i += size) {
        arr.push(data.slice(i, i + size));
    }
    return arr;
}
```

## 보안 고려사항

⚠️ **주의**: 이 프로젝트는 학습 목적으로 제작되었으며, 프로덕션 환경에서는 다음 보안 개선이 필요합니다:

1. **SQL Injection 방지**: 현재 코드는 템플릿 리터럴을 사용하여 SQL 쿼리를 작성하므로 SQL Injection에 취약합니다. Prepared Statements 사용 권장
2. **비밀번호 해싱**: SHA-256 대신 bcrypt나 argon2 같은 전용 비밀번호 해싱 알고리즘 사용 권장
3. **HTTPS**: 프로덕션에서는 반드시 HTTPS 사용
4. **입력 검증**: 클라이언트 입력에 대한 철저한 검증 필요
5. **CSRF 보호**: CSRF 토큰 구현 권장

## 알려진 제한사항

- 실제 결제 기능 미구현 (알림창만 표시)
- 세션이 메모리에 저장되어 서버 재시작 시 소실
- 상품 등록/수정/삭제 관리자 기능 미구현
- 이미지 업로드 기능 없음 (경로만 저장)

## 개발 로드맵

- [ ] 관리자 페이지 (상품 CRUD)
- [ ] 이미지 업로드 기능
- [ ] 주문 내역 조회
- [ ] 상품 검색 기능
- [ ] 페이지네이션
- [ ] Redis를 사용한 세션 스토어
- [ ] 실제 결제 API 연동 (테스트 환경)

## 라이선스

학습 목적으로 작성된 프로젝트입니다.

## 기여

이슈 및 개선 제안은 언제나 환영합니다!
