# ベースイメージ
FROM node:20-alpine

# 作業ディレクトリを設定
WORKDIR /app

# Alpine Linux に不足しているビルドに必要なパッケージをインストール
RUN apk add --no-cache python3 make g++

# package.json と package-lock.json をコピー
COPY package*.json ./

# 開発環境を指定
ENV NODE_ENV=development

# 依存関係をインストール（devDependencies も含む）
RUN npm install

# ソースコードをすべてコピー
COPY . .

# ポートを解放
EXPOSE 3000

# Next.js開発サーバー起動
CMD ["npm", "run", "dev"]