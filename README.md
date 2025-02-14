# Crawling_site

`Crawling_site` は、指定された特定のURLから階層的にリンクを辿りながら情報を取得し、データベースに格納するクローリングシステムです。このシステムは、ウェブページからリンクを抽出し、再帰的にそのリンクを訪れて情報を収集することができます。

## 機能

- **階層的クローリング**: 与えられたURLからリンクを抽出し、そのリンク先も再帰的にクローリングします。
- **データベース保存**: 各クローリング結果をデータベースに保存します。保存される情報には、URL、取得日時、ページのHTMLコンテンツなどが含まれます。
- **効率的なリンク追跡**: すでに訪問したURLを重複してクローリングしないように管理し、無駄なリクエストを避けます。
- **多重処理対応**: 複数のURLを並列で処理し、クローリングの効率を最大化します。

## インストール

### 1. リポジトリのクローン

まずは、リポジトリをクローンしてローカルにダウンロードします。

```bash
git clone https://github.com/tensandev/Crawling_site.git
cd Crawling_site
```

### 2. 必要なパッケージのインストール

`npm` または `yarn` を使用して、必要なパッケージをインストールします。

```bash
npm install
```

### 3. データベースの設定

- `MySQL` を使用してデータを保存します。MySQLサーバーがインストールされていることを確認してください。
- データベースとテーブルを作成するSQLクエリを以下に示します。

```sql
CREATE DATABASE IF NOT EXISTS crawler;
USE crawler;

CREATE TABLE IF NOT EXISTS pages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url TEXT NOT NULL,
    date DATETIME NOT NULL,
    html LONGTEXT NOT NULL
);

```

- データベースの接続情報を設定します。

```javascript
const dbConfig = {
    host: "127.0.0.1",
    user: "root",
    password: "password",
    database: "crawler"
};
```

## 使用方法

### 1. クローリングの開始

`index.js` を実行して、クローリングを開始します。

```bash
node index.js
```

実行時に、クローリングを開始するURLを指定することができます。デフォルトでは、`https://www.example.com` からクローリングを開始します。

### 2. 再帰的クローリング

指定されたURLから始まり、そのURL内のリンクを順番に辿りながらデータを収集します。リンク先のページがさらにリンクを持っている場合、そのリンクを再帰的に辿っていきます。

### 3. データベースへの保存

各URLのHTMLコンテンツ、取得日時などの情報は、MySQLデータベースに自動的に保存されます。

### 4. クローリング結果の確認

データベース内のデータは以下のクエリで確認できます。

```sql
SELECT * FROM pages;
```

## 構造

### フォルダ構成

```
Crawling_site/
├── create.sql           # データベース作成コード
├── index.js             # クローリング処理の本体
└── README.md            # このファイル
```

### 主なファイル

- **`index.js`**: クローリングを開始するエントリーポイント。指定されたURLからクローリングを開始します。

## データベース設計

| フィールド  | タイプ         | 説明                        |
|------------|---------------|-----------------------------|
| id         | INT           | 主キー、オートインクリメント   |
| url        | TEXT          | クローリングしたURL          |
| date       | DATETIME      | ページを取得した日時          |
| html       | LONGTEXT      | ページのHTML内容             |

## 開発

### 1. 並列クローリング

`Promise.all` や `async/await` を利用して並列処理を行い、クローリングの速度を向上させることができます。並列リクエスト数の制限やエラーハンドリングを行うと、より安定したクローラーにすることができます。

### 2. スクレイピングの精度向上

`cheerio` などのライブラリを使ってHTML構造を解析し、正確な情報を抽出できるようにします。また、`robots.txt` に基づいてクロール対象を制限することも可能です。

## テスト

プロジェクトにはテストコードを追加して、各部分の動作確認を行うことができます。テストには `Jest` や `Mocha` を使用することをお勧めします。

## 注意事項

- クローリングはサイトに負荷をかける可能性があります。`robots.txt` に従い、適切なインターバルでリクエストを行いましょう。
- 大量のデータを扱う場合、適切なエラーハンドリングとリトライ機能を実装してください。

## ライセンス

このプロジェクトは [MITライセンス](LICENSE) の下で公開されています。
