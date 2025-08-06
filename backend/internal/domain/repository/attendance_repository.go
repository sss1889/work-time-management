package repository

import (
	"context"
	"time"

	"github.com/attendance_report_app/backend/internal/domain/entity"
)

type AttendanceRepository interface {
	FindAll(ctx context.Context) ([]*entity.Attendance, error)
	FindByUserId(ctx context.Context, userId int) ([]*entity.Attendance, error)
	FindByDatePeriod(ctx context.Context, userId int, startDate, endDate time.Time) ([]*entity.Attendance, error)
	FindById(ctx context.Context, id int) (*entity.Attendance, error)
	Create(ctx context.Context, attendance *entity.Attendance) (*entity.Attendance, error)
	Update(ctx context.Context, attendance *entity.Attendance) (*entity.Attendance, error)
	Delete(ctx context.Context, id int) error
}
