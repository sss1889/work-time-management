# AWS CDK デプロイガイド

出勤管理アプリケーション（Go + React）を AWS にデプロイする完全ガイド

## 目次

1. [AWS アカウント作成](#awsアカウント作成)
2. [開発環境セットアップ](#開発環境セットアップ)
3. [CDK プロジェクト作成](#cdkプロジェクト作成)
4. [インフラストラクチャ構成](#インフラストラクチャ構成)
5. [デプロイ手順](#デプロイ手順)
6. [トラブルシューティング](#トラブルシューティング)

---

## AWS アカウント作成

### 1. AWS アカウント作成

1. [AWS 公式サイト](https://aws.amazon.com/) にアクセス
2. 「AWS アカウントを作成」をクリック
3. 以下の情報を入力：
   - メールアドレス
   - パスワード
   - AWS アカウント名

### 2. アカウント情報入力

- **連絡先情報**: 個人 or ビジネスを選択
- **住所**: 正確な住所を入力
- **電話番号**: SMS 受信可能な番号

### 3. 支払い情報

- クレジットカード情報を登録
- 無料利用枠内でも必須

### 4. 本人確認

- SMS または 音声通話で認証コードを受信
- PIN 入力で確認完了

### 5. アカウント有効化

- 数分で有効化完了
- AWS マネジメントコンソールにアクセス可能

---

## 開発環境セットアップ

### 必要なツール

- Node.js (v16 以上)
- AWS CLI
- AWS CDK
- Git

### 1. Node.js インストール

```bash
# Node.js 公式サイト https://nodejs.org/ から LTS版をダウンロード
# または Homebrew (Mac)
brew install node

# バージョン確認
node --version
npm --version
```

### 2. AWS CLI インストール

```bash
# Mac (Homebrew)
brew install awscli

# Windows
# https://aws.amazon.com/cli/ からインストーラーをダウンロード

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# バージョン確認
aws --version
```

### 3. IAMユーザー作成とAWS CLI設定

#### 3-1. IAMユーザー作成（AWSマネジメントコンソール）

1. **AWSマネジメントコンソールにログイン**
   - https://aws.amazon.com/ → 「AWSマネジメントコンソール」

2. **IAMサービスに移動**
   - 検索バーで「IAM」と入力 → 「IAM」をクリック

3. **新しいIAMユーザーを作成**
   - 左メニュー「ユーザー」→「ユーザーを作成」
   - **ユーザー名**: `cdk-deploy-user`（任意の名前）
   
4. **ユーザータイプの選択**
   - 「IAM ユーザーを作成します」を選択
   - ⚠️ 注意: 「Identity Center でユーザーを指定する」は推奨されているが、CDKのプログラムアクセスには不適切
   
5. **コンソールアクセス設定**
   - 「AWS マネジメントコンソールへのユーザーアクセスを提供する」は**チェックしない**
   - CDKはプログラムアクセスのみ必要

6. **アクセス許可の設定**
   - **方法1（開発用・簡単）**: 「既存のポリシーを直接アタッチ」
     - `AdministratorAccess` にチェック（⚠️ 本番環境では最小権限を推奨）
   
   - **方法2（本番用・推奨）**: 必要最小限の権限のみ
     ```json
     {
       "Version": "2012-10-17",
       "Statement": [
         {
           "Effect": "Allow", 
           "Action": [
             "ec2:*",
             "ecs:*", 
             "rds:*",
             "iam:*",
             "logs:*",
             "secretsmanager:*",
             "cloudformation:*"
           ],
           "Resource": "*"
         }
       ]
     }
     ```

7. **確認画面**
   - 設定内容を確認 → 「ユーザーの作成」

8. **アクセスキーの作成**
   - ユーザー作成後、ユーザーの詳細画面に移動
   - 「セキュリティ認証情報」タブをクリック
   - 「アクセスキー」セクションで「アクセスキーを作成」をクリック
   
9. **アクセスキー使用目的の選択**
   - 「コマンドラインインターフェイス (CLI)」を選択
   - 確認チェックボックスにチェック → 「次へ」
   
10. **説明タグ（オプション）**
    - 説明: `CDK deployment key` などを入力
    - 「アクセスキーを作成」をクリック

11. **アクセスキーをダウンロード**
    - ⚠️ **重要**: アクセスキーIDとシークレットアクセスキーを安全な場所に保存
    - 「.csvファイルをダウンロード」または画面をメモ
    - ⚠️ この画面を閉じると二度と表示されません

#### 3-2. AWS CLI設定

```bash
aws configure
# AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE  # 上記で取得したアクセスキーID
# AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY  # シークレットアクセスキー
# Default region name [None]: ap-northeast-1  # 東京リージョン
# Default output format [None]: json  # JSON形式
```

#### 3-3. 設定確認
```bash
# アカウント情報確認
aws sts get-caller-identity

# 正常に設定されていれば以下のような出力
{
    "UserId": "AIDACKCEVSQ6C2EXAMPLE",
    "Account": "123456789012", 
    "Arn": "arn:aws:iam::123456789012:user/cdk-deploy-user"
}
```

#### 💡 セキュリティのベストプラクティス

1. **アクセスキーの管理**
   - アクセスキーを絶対にGitにコミットしない
   - 定期的にローテーション（90日ごと推奨）
   - 不要になったら即座に削除

2. **権限の最小化**
   - 開発段階ではAdministratorAccessでも可
   - 本番環境では必要最小限の権限のみ付与

3. **MFA（多要素認証）の有効化**
   - ルートユーザーには必ずMFA設定
   - IAMユーザーにもMFA推奨

#### ⚠️ よくあるエラーと対処法

**エラー1**: `Unable to locate credentials`
```bash
# 解決策: AWS CLI設定を再実行
aws configure
```

**エラー2**: `Access Denied`
```bash
# 解決策: IAMユーザーの権限確認
aws iam get-user
aws iam list-attached-user-policies --user-name YOUR_USERNAME
```

**エラー3**: `Invalid region`
```bash
# 解決策: 有効なリージョン名を指定
aws ec2 describe-regions --output table
```

### 4. AWS CDK インストール

```bash
# グローバルインストール
npm install -g aws-cdk

# バージョン確認
cdk --version
```

### 5. CDK Bootstrap (初回のみ)

```bash
# まずアカウントID確認
aws sts get-caller-identity

# CDKが必要なAWSリソースを作成（ACCOUNT-IDは実際の値に置き換え）
cdk bootstrap aws://016065104496/ap-northeast-1

# または、以下でも可能（自動的にアカウントIDを取得）
cdk bootstrap
```

**Bootstrapの説明:**
- CDKが使用するS3バケットやIAMロールを作成
- アカウント・リージョンごとに初回のみ実行
- 成功すると「✅ Bootstrapping completed」が表示される

---

## CDK プロジェクト作成

### 1. CDKディレクトリの作成と初期化

```bash
# プロジェクトルートで実行
cd attendance_report_app

# CDK用ディレクトリを作成
mkdir cdk
cd cdk

# TypeScript CDKプロジェクトを初期化
cdk init app --language typescript

# プロジェクト構造を作成
mkdir -p stacks constructs config

# 依存関係をインストール
npm install
```

### 2. 構造化されたCDK プロジェクト構成

```
cdk/
├── bin/
│   └── cdk.ts                    # CDKアプリのエントリーポイント
├── stacks/                       # スタック定義（論理的な分離）
│   ├── VPCStack.ts              # VPC関連リソース
│   ├── RDSStack.ts              # データベース関連
│   ├── MainAppStack.ts          # メインアプリケーション(ECS)
│   ├── CertificateStack.ts      # SSL証明書
│   ├── AmplifyStack.ts          # フロントエンド(Amplify)
│   └── BatchAppStack.ts         # バッチ処理用(オプション)
├── constructs/                   # 再利用可能なコンストラクト
│   ├── VPCConstruct.ts          # VPC構成
│   ├── RDSConstruct.ts          # RDS構成
│   ├── ECSConstruct.ts          # ECS構成
│   ├── AmplifyConstruct.ts      # Amplify構成
│   └── EventBridgeConstruct.ts  # イベント処理
├── config/
│   └── constants.ts             # 設定値・定数
├── test/
│   └── *.test.ts               # テストファイル
├── cdk.json                    # CDK設定
├── package.json               # npm設定
└── tsconfig.json              # TypeScript設定
```

### 3. 設計思想とメリット

**スタック分離のメリット:**
- **独立デプロイ**: VPCとRDSを先にデプロイ、アプリは後から
- **責任分離**: インフラとアプリケーションの明確な分離
- **再利用性**: 他のプロジェクトでも構成要素を再利用可能
- **保守性**: 変更箇所が明確で影響範囲を限定

**ファイル構成の役割:**
- `stacks/`: 実際にデプロイされるCloudFormationスタック
- `constructs/`: 再利用可能なコンポーネント
- `config/`: 環境固有の設定値を一元管理

### 4. 環境別管理

```typescript
// config/constants.ts の例
export const AppConfig = {
  APP_NAME: 'AttendanceApp',
  ENVIRONMENT: 'dev', // dev, staging, prod
  AWS: {
    ACCOUNT_ID: '016065104496',
    REGION: 'ap-northeast-1',
  },
  // その他の設定...
}
```

### 5. 必要なCDKライブラリ

CDK v2では統合されているため、追加インストールは不要
```bash
# 既にaws-cdk-libに含まれている
# - ec2, ecs, rds, ecs-patterns
# - secretsmanager, logs
# - route53, certificatemanager
# - amplify
```

---

## アーキテクチャ構成

```
Internet Gateway
    ↓
Application Load Balancer (ALB)
    ↓
ECS Fargate Service (Go API)
    ↓
RDS MySQL Database

AWS Amplify → React Frontend (別ドメイン)
```

### 使用する AWS サービス

- **VPC**: ネットワーク分離
- **ECS Fargate**: Go API サーバー
- **RDS MySQL**: データベース
- **ALB**: ロードバランサー
- **AWS Amplify**: React フロントエンド
- **Secrets Manager**: 認証情報管理
- **CloudWatch**: ログ・監視

---

## 進捗記録

### 完了済み

- [x] プロジェクト構成調査・理解
- [x] AWS アカウント作成手順をドキュメント化
- [x] AWS CLI・CDK セットアップ手順
- [x] CDK プロジェクトの初期化と構造化

### 次のステップ

**Phase 1: インフラ基盤**
- [ ] config/constants.ts - 設定値の定義
- [ ] VPCStack.ts & VPCConstruct.ts - ネットワーク構成
- [ ] RDSStack.ts & RDSConstruct.ts - データベース構成

**Phase 2: アプリケーション**
- [ ] MainAppStack.ts & ECSConstruct.ts - バックエンドAPI
- [ ] CertificateStack.ts - SSL証明書管理
- [ ] AmplifyStack.ts & AmplifyConstruct.ts - フロントエンド

**Phase 3: デプロイ・統合**
- [ ] デプロイスクリプト作成
- [ ] 環境変数とシークレット設定
- [ ] CORS設定とAPI接続確認
- [ ] 監視・ログ設定

### デプロイ順序
1. **VPC** → **RDS** → **Certificate** (基盤)
2. **MainApp**(ECS) (バックエンド)
3. **Amplify** (フロントエンド)
4. **統合テスト**

---

_最終更新: 2025-08-07_
