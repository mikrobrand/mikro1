# mikro — 기능 명세서

> 동대문 패션 모바일 마켓플레이스 MVP (Next.js App Router)
> 최종 업데이트: 2026-02-12

---

## 테스트 계정

| 역할 | 아이디 | 비밀번호 | 설명 |
|------|--------|---------|------|
| 고객 | `1` | `1` | CUSTOMER 역할, userId = `mvp-customer-1` |
| 판매자 | `s` | `s` | SELLER 역할, userId = `MVP_SELLER_ID` 환경변수 |

---

## 공통 레이아웃

### TopBar (상단바)
- **mikro** 로고 → 홈(`/`)으로 이동
- 검색바 (placeholder, 기능 미구현)
- 햄버거 메뉴 → Drawer 열기

### BottomTab (하단 탭)
- **홈** (`/`) — 상품 피드
- **관심** (`/wishlist`) — 찜 목록
- **뉴스** (`/news`) — placeholder
- **채팅** (`/chat`) — placeholder (로그인 필요)
- **MY** (`/my`) — 마이페이지

### Drawer (사이드 메뉴)
- 로그인 상태 표시 (판매자/고객/비로그인)
- 카테고리: 바지, 아우터, 반팔티, 긴팔티, 니트
- 브랜드 보기 → `/brands`
- 판매자 센터 → `/seller` (판매자만 노출)
- 이용약관, 개인정보처리방침
- 입점 안내 → `/apply`
- 페이지 이동 시 자동 닫힘

### Container
- 최대 너비 420px, 중앙 정렬, 모바일 퍼스트

---

## 페이지별 기능

### 1. 홈 피드 — `/`

| 항목 | 설명 |
|------|------|
| 카테고리 필터 | 상단 chip 스크롤: 전체, 바지, 아우터, 반팔티, 긴팔티, 니트 |
| 상품 카드 | 세로 나열, 각 카드에 이미지 캐러셀 + 상품명 + 가격 + 상점명 |
| 이미지 캐러셀 | MAIN 이미지 횡스크롤 스와이프 (scroll-snap), 도트 인디케이터 |
| 찜 버튼 | 카드 우상단 하트 아이콘, localStorage 기반 토글 |
| 데이터 | `isActive=true`, `isDeleted=false`인 상품만 표시 |
| 정렬 | 최신순 (createdAt desc), 최대 20개 |

**쿼리 파라미터**: `?category=pants` → DB의 "바지" 카테고리 필터

---

### 2. 상품 상세 — `/p/[id]`

| 항목 | 설명 |
|------|------|
| 메인 이미지 | `ImageCarousel` — MAIN 이미지 횡스크롤, 3:4 비율 |
| 판매자 정보 | 아바타 + 상점명, 클릭 시 `/s/[sellerId]`로 이동 |
| 상품명 | 20px bold |
| 가격 | 24px extrabold, 원화 포맷 (₩19,000) |
| 품절 뱃지 | 전체 variant stock 합계 0이면 빨간 "품절" 뱃지 |
| 사이즈/재고 | 각 variant를 pill로 표시: `S (10)`, `M (8)`, `L (6)` / 재고 0이면 취소선 |
| 상품 설명 | `description` 텍스트 (있을 때만 표시) |
| 상세 이미지 | CONTENT 이미지들 세로 스택 (있을 때만 표시) |
| 구매 버튼 | "구매하기" (품절 시 비활성화) |
| 찜 버튼 | 하트 아이콘 (detail variant, 52x52) |

---

### 3. 판매자 상점 — `/s/[sellerId]`

| 항목 | 설명 |
|------|------|
| 상점 헤더 | 아바타 + 상점명 + 위치 정보 (상가·층·호수) + 카테고리 타입 |
| 상품 수 | "상품 N개" 표시 |
| 상품 목록 | `isActive=true`, `isDeleted=false`인 해당 판매자 상품 카드 나열 |

---

### 4. 로그인 — `/login`

| 항목 | 설명 |
|------|------|
| 로그인 폼 | 아이디 + 비밀번호 입력 |
| MVP 테스트 계정 | 하단에 "고객 (1/1)", "판매자 (s/s)" 버튼 → 자동 입력 |
| 인증 방식 | HMAC-SHA256 서명된 HttpOnly 쿠키 (`mikro_session`) |
| 쿠키 만료 | 7일 |
| 리다이렉트 | `?next=` 파라미터로 로그인 후 이동할 페이지 지정 |

---

### 5. MY 페이지 — `/my`

| 항목 | 설명 |
|------|------|
| 프로필 | 로그인: 역할(판매자/고객) + userId 일부 표시 + 로그아웃 버튼 |
| 비로그인 | "게스트" 표시 → 로그인 페이지로 이동 |
| 메뉴 | 주문내역(미구현), 관심목록, 판매자 센터(판매자만), 이용약관, 개인정보처리방침 |

---

### 6. 관심목록 (찜) — `/wishlist`

| 항목 | 설명 |
|------|------|
| 저장 방식 | localStorage (`mikro_wishlist` 키, productId 배열) |
| 데이터 로딩 | `POST /api/products/by-ids`로 상품 정보 일괄 조회 |
| 실시간 동기화 | `wishlist-change` 커스텀 이벤트로 다른 탭/컴포넌트와 동기화 |
| 빈 상태 | "관심 상품이 없어요" + 홈으로 가기 버튼 |

---

### 7. 브랜드 목록 — `/brands`

| 항목 | 설명 |
|------|------|
| 목록 | 승인된(`APPROVED`) 판매자 프로필 전체 표시 |
| 카드 | 2열 그리드, 아바타 + 상점명 + 타입 + 위치 |
| 클릭 | `/s/[sellerId]`로 이동 |

---

### 8. 입점 안내 — `/apply`

| 항목 | 설명 |
|------|------|
| 입점 조건 | 사업자등록증, 동대문 매장, 자체 상품 보유 |
| 신청 방법 | 문의 접수 → 서류 제출 → 심사/승인 (3일 이내) |
| 문의 | partner@mikro.kr |

---

### 9. 뉴스 — `/news`

placeholder ("아직 등록된 소식이 없어요")

---

### 10. 채팅 — `/chat`

placeholder ("준비 중인 기능입니다"), 로그인 필요

---

### 11. 이용약관 — `/policy/terms`

5개 조항: 목적, 정의, 약관의 효력, 서비스의 제공, 면책조항

---

### 12. 개인정보처리방침 — `/policy/privacy`

5개 항목: 수집 항목, 수집·이용 목적, 보유 기간, 제3자 제공, 보호책임자

---

## 판매자 전용 기능

> `/seller/*` 경로는 SELLER 역할 로그인 필수. 미로그인 시 `/login?next=/seller`로 리다이렉트.

### 13. 판매자 대시보드 — `/seller`

| 항목 | 설명 |
|------|------|
| 헤더 | 상점명 + "전체 N개" + "상품 올리기" 버튼 |
| 필터 토글 | 판매중, 숨김, 품절, 삭제됨 카운트 표시 + 토글 |
| 상품 카드 | 첫 번째 MAIN 이미지 + 상품명 + 가격 |
| 상태 뱃지 | 판매중(초록), 숨김(회색), 품절(주황), 삭제됨(빨강) |
| 재고 표시 | 총 재고 합계 + 사이즈별 상세 (`S:10 M:8 L:6`) |
| 액션 버튼 | "숨김/판매" 토글 + "수정" 링크 |
| 재고 미세 조정 | 사이즈별 `- / +` 버튼으로 재고를 즉시 증감 (원자적 update) |
| 복제 | "복제" 버튼으로 기존 상품을 템플릿으로 신규 등록 화면 이동 |
| 빈 상태 | "아직 등록된 상품이 없어요" + "첫 상품 올리기" 버튼 |

---

### 14. 상품 올리기 — `/seller/products/new`

| 섹션 | 설명 |
|------|------|
| **대표 이미지** | 필수, 최대 10장, 가로 스크롤 미리보기, ←→ 순서 변경, × 삭제, 첫 번째에 "대표" 뱃지 |
| **상세 이미지** | 선택, 최대 20장, 동일한 미리보기 UI |
| **사이즈/재고** | 필수, 기본 S/M/L (재고 0), 사이즈명 + 재고 입력, 행 추가/삭제, 중복 사이즈 불가 |
| **상품명** | 필수, 최대 100자 |
| **가격** | 필수, 원화 포맷 자동 (쉼표), 0 이상 |
| **카테고리** | 선택: 아우터, 반팔티, 긴팔티, 니트, 셔츠, 바지, 원피스, 스커트 |
| **상품 설명** | 선택, 자유 텍스트 |
| **등록 버튼** | 로딩 스피너 표시 |

**업로드 흐름**:
1. 파일 선택 → 클라이언트에서 타입(jpg/png/webp/gif) + 크기(10MB) 검증
2. `POST /api/uploads/presign` → presigned S3 PUT URL 발급
3. 클라이언트가 S3에 직접 PUT 업로드
4. 모든 이미지 업로드 완료 후 `POST /api/seller/products` 호출

**복제 등록 흐름**:
- `/seller/products/new?cloneFrom={productId}` 접근 시 기존 상품 데이터 프리필
- MAIN/CONTENT 이미지, 제목/가격/카테고리/설명, 사이즈 라벨을 그대로 복사
- 재고는 모든 variant를 `0`으로 초기화해 새 상품으로 등록

---

### 15. 상품 수정 — `/seller/products/[id]/edit`

| 항목 | 설명 |
|------|------|
| 데이터 로딩 | `GET /api/seller/products/[id]`로 기존 데이터 프리필 |
| 폼 구조 | 상품 올리기와 동일 |
| 판매 상태 토글 | 우상단 "판매중 ●" / "숨김 ●" 버튼 → 즉시 PATCH |
| 저장 | PATCH — 스칼라 필드 업데이트 + 이미지/variants 전체 교체 (delete+recreate) |
| 삭제 | "삭제" 버튼 → confirm 다이얼로그 → DELETE 호출 |

---

## API 엔드포인트

### 인증
| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/auth/login` | `{id, pw}` → 쿠키 발급 |
| POST | `/api/auth/logout` | 쿠키 삭제 |

### 상품 (고객용)
| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/products/by-ids` | `{ids: string[]}` → 상품 배열 (찜 목록용) |

### 상품 (판매자용)
| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/seller/products` | 상품 생성 (mainImages, contentImages, variants) |
| GET | `/api/seller/products/[id]` | 상품 상세 (images by kind + variants) |
| PATCH | `/api/seller/products/[id]` | 상품 수정 (트랜잭션, 이미지/variants 교체 포함) |
| DELETE | `/api/seller/products/[id]` | 상품 삭제 (`isDeleted=true` soft delete) |

### 재고 (판매자용)
| Method | Path | 설명 |
|--------|------|------|
| PATCH | `/api/seller/variants/[id]/stock` | variant 재고 증감 (`delta` 정수, 음수 방어) |

### 이미지
| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/uploads/presign` | S3 presigned PUT URL 발급 (SELLER 전용) |
| GET | `/api/images/[...path]` | S3 이미지 프록시 (presigned GET → 302 redirect) |

### 결제
| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/payments/confirm` | 결제 확인 (재고 차감 + 상태 변경, Toss 연동) |

### 디버그
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/debug/env` | 환경변수 존재 여부 확인 (프로덕션 디버그용) |

---

## 재사용 컴포넌트

| 컴포넌트 | 설명 |
|---------|------|
| `ImageCarousel` | 횡스크롤 이미지 캐러셀, scroll-snap, 도트 인디케이터, 6장+ 카운터 뱃지 |
| `ProductCard` | 상품 카드 (고객/판매자 모드), 이미지 캐러셀 포함 |
| `ProductForm` | 판매자 상품 등록 공통 폼 (신규/복제 등록 공용) |
| `StockAdjuster` | 판매자 카드에서 사이즈별 재고 `- / +` 즉시 조절 |
| `WishlistButton` | 찜 토글 버튼 (card/detail 두 가지 variant) |
| `ToggleActiveButton` | 판매중↔숨김 토글 (PATCH isActive) |
| `SellerProductFilter` | 판매자 대시보드 필터 토글 (판매중/숨김/품절/삭제) |
| `Container` | max-w-420 중앙정렬 래퍼 |
| `TopBar` | 상단 고정 네비게이션 |
| `BottomTab` | 하단 고정 탭 네비게이션 |
| `Drawer` | 우측 슬라이드 메뉴 |
| `LogoutButton` | 로그아웃 버튼 |
| `SessionProvider` | 클라이언트 세션 컨텍스트 |

---

## 데이터 모델 (주요)

### Product
`id`, `sellerId`, `title`, `description`, `category`, `priceKrw`, `isActive`, `isDeleted`, `createdAt`, `updatedAt`

**상태 판정 규칙(코드 공통화):**
- `isDeleted=true` → `DELETED`
- `isDeleted=false` + `isActive=false` → `HIDDEN`
- `isDeleted=false` + `isActive=true` + `totalStock=0` → `SOLD_OUT`
- `isDeleted=false` + `isActive=true` + `totalStock>0` → `ACTIVE`

### ProductImage
`id`, `productId`, `url`, `kind` (MAIN/CONTENT), `sortOrder`

### ProductVariant
`id`, `productId`, `color` (기본 "FREE"), `sizeLabel`, `stock`, `sku` (optional), `@@unique([productId, color, sizeLabel])`

### User
`id`, `email`, `phone`, `name`, `role` (CUSTOMER/SELLER_PENDING/SELLER_ACTIVE/ADMIN)

### SellerProfile
`userId`, `shopName`, `type`, `marketBuilding`, `floor`, `roomNo`, `status` (PENDING/APPROVED/REJECTED)

### Order / OrderItem / Payment / Shipment
주문 → 주문아이템 → 결제 → 배송 파이프라인 (결제 확인 API에서 재고 차감 + Toss 연동)

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router, Turbopack) |
| 데이터베이스 | PostgreSQL (Neon) |
| ORM | Prisma + @prisma/adapter-pg |
| 스토리지 | AWS S3 (presigned PUT/GET) |
| 인증 | HMAC-SHA256 서명 HttpOnly 쿠키 |
| 결제 | Toss Payments 연동 |
| 배포 | AWS Amplify |
| 스타일 | Tailwind CSS |
| 폰트 | Geist Sans |
