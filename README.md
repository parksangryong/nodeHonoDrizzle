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
npm run dev
```

```sh # 빌드 실행
npm run build
```

```sh # pm2 실행
npm run start
```

```sh # pm2 중지
npm run stop
```

```sh # 서버 배포
npm run deploy
```

```sh # 스키마 생성
npm run db:generate
```

```sh # 스키마 저장
npm run db:push
```

```sh # 스키마 확인
npm run db:studio
```
