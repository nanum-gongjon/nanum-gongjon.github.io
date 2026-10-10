# 처음 해보는 GitHub Pages + Supabase 배포 가이드

> 전체 순서: **① 계정 만들기 → ② Supabase 만들기 → ③ 연결 값 넣기 → ④ GitHub에 올리기 → ⑤ 인터넷 주소 켜기 → ⑥ 휴대폰 확인 → ⑦ QR코드**
> 소요 시간: 처음이면 40분~1시간. 비용: 둘 다 무료 요금제로 충분합니다.

> **압축 파일이 3개로 나뉘어 있습니다.** (전송 용량 제한 때문)
> `1_사이트본체.zip` , `2_확대용이미지_01-15.zip` , `3_확대용이미지_16-30.zip` 을 **같은 위치에 모두 풀어서** `exhibition` 폴더 하나로 합쳐 주세요. (“폴더 병합/덮어쓰기” 질문이 나오면 **예**) 합친 뒤 `exhibition/images/large` 안에 사진이 30개 있으면 정상입니다.

폴더 구성 (이 폴더 전체가 홈페이지입니다)

```
index.html           ← 첫 화면(이 이름은 바꾸지 마세요)
css/style.css        ← 디자인
js/config.js         ← ★ Supabase 연결 값을 넣는 파일 (③에서 수정)
js/data.js           ← 작품 설명·작가의 말·약력 글
js/api.js, app.js    ← 동작 프로그램 (수정하지 않아도 됩니다)
images/              ← 작품 사진 (thumb·view·large 3단계) + 작가 사진
supabase/schema.sql  ← ② 에서 Supabase에 붙여넣을 설정문
GUIDE.md             ← 이 안내서
```

---

## ① 계정 만들기 (GitHub 먼저)

1. https://github.com 접속 → **Sign up** → 이메일, 비밀번호, 사용자 이름(영문, 예: `leechungil-art`) 입력 → 이메일로 온 인증번호 입력.
   - 사용자 이름이 나중에 주소의 일부가 됩니다. (`https://사용자이름.github.io/...`)
2. Supabase는 GitHub 계정으로 바로 로그인할 수 있어서 별도 가입이 필요 없습니다.

---

## ② Supabase 만들기 (좋아요·댓글·방명록 저장소)

### 2-1. 프로젝트 만들기
1. https://supabase.com 접속 → **Start your project** → **Continue with GitHub** → 승인.
2. 처음이면 조직(Organization) 이름을 묻습니다. 아무 이름(예: 내 이름) 입력, 종류는 **Personal**, 요금제는 **Free** 선택.
3. **New project** 클릭 후
   - **Name**: `art-exhibition`
   - **Database Password**: **Generate a password**를 눌러 만들고, **복사해서 메모장에 보관** (나중에 거의 안 쓰지만 분실하면 곤란합니다)
   - **Region**: **Northeast Asia (Seoul)** — 한국에서 가장 빠릅니다
   - **Create new project** → 1~2분 기다리면 대시보드가 열립니다.

### 2-2. 표(테이블)와 보안 설정 한 번에 만들기
1. 왼쪽 메뉴에서 **SQL Editor**(`>_` 모양) 클릭 → **New query**.
2. 이 폴더의 `supabase/schema.sql` 파일을 메모장으로 열어 **내용 전체를 복사 → 붙여넣기**.
3. 오른쪽 아래 **Run**(또는 Ctrl+Enter) 클릭.
4. 아래에 `Success. No rows returned`가 나오면 성공입니다.
   - 경고창(“destructive operations” 등)이 뜨면 **Run this query**를 누르세요. 데이터를 지우는 명령이 아니라 `drop policy`(옛 규칙 교체)입니다.
5. 왼쪽 **Table Editor**를 눌러 `likes`, `comments`, `guestbook` 세 표가 보이면 정상입니다.

### 2-3. 연결 값 2개 복사하기
1. 왼쪽 아래 **Project Settings**(톱니바퀴) → **API Keys**(또는 **Data API** / **API**)로 이동.
2. 다음 두 가지를 메모합니다.
   - **Project URL** — 예: `https://abcdefghijkl.supabase.co`
   - **anon public key**(또는 **Publishable key**) — `eyJ...` 또는 `sb_publishable_...` 로 시작하는 긴 문자열
3. ⚠️ **`service_role` / `secret` 키는 절대 쓰지 마세요.** 위 anon(publishable) 키만 홈페이지에 넣습니다. anon 키는 공개되어도 안전하도록 이미 `schema.sql`에서 권한을 제한해 두었습니다.

---

## ③ 연결 값을 홈페이지에 넣기

1. `js/config.js` 파일을 메모장(또는 VS Code)으로 엽니다.
2. 따옴표 안만 바꿉니다.

```js
window.APP_CONFIG = {
  SUPABASE_URL: "https://abcdefghijkl.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOi... (복사한 긴 키)"
};
```
3. 저장합니다. (따옴표, 쉼표를 지우지 않게 주의)

> 이 값을 넣기 전에는 “미리보기 모드”로 동작합니다. 좋아요·댓글이 내 휴대폰에만 저장되며, 화면에 노란 안내 문구가 보입니다. 연결에 성공하면 이 문구가 사라집니다.

---

## ④ GitHub에 올리기 (명령어 없이 웹에서)

### 4-1. 저장소(repository) 만들기
1. GitHub 로그인 → 오른쪽 위 **+** → **New repository**.
2. **Repository name**: `nanum-exhibition` (영문 소문자·숫자·하이픈만)
3. **Public** 선택 (무료 GitHub Pages는 Public이어야 합니다. 올리는 것은 전시 안내 내용뿐이라 문제없습니다.)
4. 다른 체크박스는 건드리지 않고 **Create repository**.

### 4-2. 파일 올리기 — ⚠️ 두 번에 나눠서
GitHub 웹 업로드는 **한 번에 100개 파일까지**입니다. 이 폴더는 약 100개 파일이라 나눠 올립니다.

**1차 — 사진 폴더**
1. 새 저장소 화면에서 **uploading an existing file** 링크 클릭.
2. 컴퓨터에서 `images` **폴더 자체**를 끌어다 놓습니다. (폴더째 놓으면 안의 구조가 유지됩니다)
3. 파일이 모두 올라가면 맨 아래 **Commit changes** 클릭.

**2차 — 나머지**
1. 저장소 첫 화면 → **Add file** → **Upload files**.
2. `index.html`, `css` 폴더, `js` 폴더, `supabase` 폴더, `GUIDE.md`를 끌어다 놓습니다.
   - `js/config.js`는 ③에서 수정한 것이어야 합니다.
3. **Commit changes**.

저장소 첫 화면에 `index.html`, `css`, `js`, `images`가 보이면 완료입니다.

---

## ⑤ 인터넷 주소 켜기 (GitHub Pages)

1. 저장소 위쪽 메뉴 **Settings** → 왼쪽 **Pages**.
2. **Build and deployment → Source**: **Deploy from a branch**.
3. **Branch**: `main` / 폴더 `/ (root)` 선택 → **Save**.
4. 1~3분 뒤 페이지를 새로고침하면 위쪽에 *“Your site is live at …”* 와 주소가 나타납니다.
   - 주소 형태: `https://사용자이름.github.io/nanum-exhibition/`
   - 처음엔 404가 보일 수 있습니다. 3분 정도 기다렸다가 다시 열어 보세요.

---

## ⑥ 휴대폰에서 확인하기

체크리스트
- [ ] 표지 제목과 사진이 보이고, 노란 “미리보기 모드” 문구가 **없다**
- [ ] 작품에서 ♥ 좋아요를 누르면 숫자가 오르고, 새로고침해도 유지된다
- [ ] 다른 휴대폰에서 열었을 때 같은 좋아요 숫자·댓글이 보인다
- [ ] 방명록에 글을 남기면 목록에 나타난다
- [ ] 사진을 눌러 두 손가락으로 확대된다

**내가 남긴 글 확인/관리**: Supabase → **Table Editor** → `comments` 또는 `guestbook`.
- 부적절한 글 숨기기: 해당 행의 `hidden`을 **TRUE**로 바꾸고 저장 → 화면에서 즉시 사라집니다.
- 삭제: 행 선택 → 휴지통(Delete).
- 시험삼아 남긴 글도 여기서 지우고 전시를 시작하세요.

---

## ⑦ 전시장용 QR코드

- 완성된 주소를 QR코드 생성 사이트(검색: “QR코드 만들기”)에 붙여넣어 이미지를 저장 → 팸플릿·전시장 입구에 인쇄.
- 인쇄 전에 반드시 **본인 휴대폰으로 QR을 찍어 접속**되는지 확인하세요.

---

## 수정·업데이트하는 방법

| 하고 싶은 일 | 방법 |
|---|---|
| 작품 설명·작가의 말·약력 수정 | GitHub 저장소에서 `js/data.js` 클릭 → 연필(✏️) 아이콘 → 수정 → **Commit changes** |
| 작품 사진 교체 | `images/large`, `images/view`, `images/thumb`의 같은 번호 파일에 새 파일 업로드(같은 이름이면 덮어쓰기). (이미 원본 사진으로 제작되어 있습니다. 바꿀 때는 가로 2,400px 이하 WebP로 변환해 올리세요) |
| 수정이 안 보임 | 1~2분 뒤 새로고침. 계속 같으면 브라우저 캐시 삭제 또는 주소 끝에 `?v=2` 붙여 접속 |

---

## 자주 겪는 문제

| 증상 | 원인 / 해결 |
|---|---|
| 노란 “미리보기 모드” 문구가 계속 보임 | `js/config.js`의 URL·키가 아직 `YOUR_…` 이거나 따옴표가 깨짐. 값 다시 확인 후 저장·업로드 |
| “좋아요를 저장하지 못했습니다” | 2-2의 `schema.sql`이 실행되지 않았거나 오류가 났음. SQL Editor에서 다시 Run |
| 댓글 “불러오지 못했습니다” | anon 키 대신 다른 키를 넣었거나, 키 일부만 복사됨. 키 전체를 다시 복사 |
| 사진이 안 보임 | `images` 폴더가 저장소에 올라갔는지, 폴더·파일명 대소문자가 같은지 확인 |
| 404 페이지 | Pages 설정 저장 후 3분 대기, `index.html`이 저장소 최상위에 있는지 확인 |
| 며칠 후 Supabase가 멈춤 | 무료 프로젝트는 **일주일간 사용이 없으면 일시정지**됩니다. 전시 직전에 Supabase 대시보드에 들어가 **Restore project**를 누르고, 전시 기간 중에도 가끔 접속하세요 |

## 알아두면 좋은 점
- 좋아요는 “기기·브라우저당 작품마다 1번”입니다. (로그인 없이 쓰기 위한 방식이라, 일부러 여러 브라우저로 누르는 것까지 막지는 못합니다.)
- 댓글·방명록은 20초에 한 번만 등록되고, 스팸 방지용 숨은 칸이 있습니다. 심한 스팸은 위의 `hidden` 방법으로 정리하세요.
- 방문자 이름은 입력한 닉네임만 저장하며, 이메일·전화번호는 받지 않습니다.
