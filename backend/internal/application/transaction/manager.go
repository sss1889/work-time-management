package transaction

import (
	"context"
	"gorm.io/gorm"
)

type Manager interface {
	ExecuteInTx(ctx context.Context, fn func(ctx context.Context) error) error
}

type managerImpl struct {
	db *gorm.DB
}

func NewManager(db *gorm.DB) Manager {
	return &managerImpl{db: db}
}

func (m *managerImpl) ExecuteInTx(ctx context.Context, fn func(ctx context.Context) error) error {
	tx := m.db.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			panic(r)
		}
	}()

	txCtx := context.WithValue(ctx, "tx", tx)

	if err := fn(txCtx); err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		return err
	}

	return nil
}