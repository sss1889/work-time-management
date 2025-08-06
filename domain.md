### `Users` テーブル

| カラム名     | 型                | 説明                           | 制約 / メモ                       |
| ------------ | ----------------- | ------------------------------ | --------------------------------- |
| `id`         | `string` / `UUID` | 主キー                         | PK, `user-` + `timestamp` or UUID |
| `name`       | `string`          | ユーザー名                     | NOT NULL                          |
| `email`      | `string`          | メールアドレス (ログイン ID)   | NOT NULL, UNIQUE                  |
| `password`   | `string`          | ハッシュ化されたパスワード     | NOT NULL                          |
| `role`       | `enum`            | 役割 (`ADMIN`, `USER`)         | NOT NULL, Default: `USER`         |
| `pay_type`   | `enum`            | 給与体系 (`MONTHLY`, `HOURLY`) | NOT NULL                          |
| `pay_rate`   | `number`          | 給与レート (月給または時給)    | NOT NULL, Default: 0              |
| `created_at` | `datetime`        | 作成日時                       |                                   |
| `updated_at` | `datetime`        | 更新日時                       |                                   |

---

## 2. 勤怠 (Attendance) ドメイン

日々の勤怠記録と業務報告を管理します。

### `AttendanceRecords` テーブル

| カラム名        | 型                | 説明                     | 制約 / メモ                                 |
| --------------- | ----------------- | ------------------------ | ------------------------------------------- |
| `id`            | `string` / `UUID` | 主キー                   | PK, `rec-` + `timestamp` or UUID            |
| `user_id`       | `string` / `UUID` | ユーザー ID への外部キー | FK ([Users.id](http://users.id/)), NOT NULL |
| `date`          | `date`            | 勤務日 (YYYY-MM-DD)      | NOT NULL                                    |
| `start_time`    | `time`            | 始業時刻 (HH:mm)         | NOT NULL                                    |
| `end_time`      | `time`            | 終業時刻 (HH:mm)         | NOT NULL                                    |
| `break_minutes` | `integer`         | 休憩時間（分）           | NOT NULL, Default: 0                        |
| `report`        | `text`            | 業務報告                 |                                             |
| `created_at`    | `datetime`        | 作成日時                 |                                             |
| `updated_at`    | `datetime`        | 更新日時                 |                                             |

---
