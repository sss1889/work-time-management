package repository

import (
	"context"

	"github.com/attendance_report_app/backend/internal/domain/entity"
)

type UserRepository interface {
	FindAll(ctx context.Context) ([]*entity.User, error)
	FindById(ctx context.Context, id int) (*entity.User, error)
	Create(ctx context.Context, user *entity.User) (*entity.User, error)
	Update(ctx context.Context, user *entity.User) (*entity.User, error)
	Delete(ctx context.Context, id int) error
	FindByEmail(ctx context.Context, email string) (*entity.User, error)
}
