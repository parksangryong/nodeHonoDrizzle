To install dependencies:

DB 생성 후 스키마 생성:

```sh
npx drizzle-kit push
```

DB에 데이터 가져와서 스키마 생성:

```sh
npx drizzle-kit introspect
```

To install:

```sh
npm install
```

To run:

```sh
npm run dev
```

open http://localhost:3000

### script 설명

```sh # 개발 모드 실행
npm run dev // 개발 모드 실행
```

```sh # 빌드 실행
npm run build // 빌드 실행
```

```sh # pm2 실행
npm run start // pm2 실행
```

```sh # pm2 중지
npm run stop // pm2 중지
```

```sh # 서버 배포
npm run deploy // 서버 배포
```

```sh # 스키마 생성
npm run db:pull // 현재 DB 스키마 가져오기
```

```sh # 스키마 저장
npm run db:push // 현재 스키마를 DB에 저장
```

```sh # 스키마 확인
npm run db:studio // 현재 스키마를 확인
```
