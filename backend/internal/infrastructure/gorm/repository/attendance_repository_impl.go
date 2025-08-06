package repository

import (
	"context"
	"time"

	"gorm.io/gorm"

	"github.com/attendance_report_app/backend/internal/domain/entity"
	"github.com/attendance_report_app/backend/internal/domain/repository"
	"github.com/attendance_report_app/backend/internal/infrastructure/gorm/model"
)

type attendanceRepository struct {
	db *gorm.DB
}

func NewAttendanceRepository(db *gorm.DB) repository.AttendanceRepository {
	return &attendanceRepository{db: db}
}

func (r *attendanceRepository) getDB(ctx context.Context) *gorm.DB {
	if tx, ok := ctx.Value("tx").(*gorm.DB); ok {
		return tx
	}
	return r.db
}

func (r *attendanceRepository) FindAll(ctx context.Context) ([]*entity.Attendance, error) {
	var attendances []model.Attendance
	if err := r.getDB(ctx).Find(&attendances).Error; err != nil {
		return nil, err
	}
	return model.ToAttendanceEntities(attendances), nil
}

func (r *attendanceRepository) FindByUserId(ctx context.Context, userId int) ([]*entity.Attendance, error) {
	var attendances []model.Attendance
	if err := r.getDB(ctx).Where("user_id = ?", userId).Find(&attendances).Error; err != nil {
		return nil, err
	}
	return model.ToAttendanceEntities(attendances), nil
}

func (r *attendanceRepository) FindByDatePeriod(ctx context.Context, userId int, startDate, endDate time.Time) ([]*entity.Attendance, error) {
	var attendances []model.Attendance
	if err := r.getDB(ctx).
		Where("user_id = ? AND date >= ? AND date <= ?", userId, startDate, endDate).
		Find(&attendances).Error; err != nil {
		return nil, err
	}
	return model.ToAttendanceEntities(attendances), nil
}

func (r *attendanceRepository) FindById(ctx context.Context, id int) (*entity.Attendance, error) {
	var attendance model.Attendance
	if err := r.getDB(ctx).First(&attendance, id).Error; err != nil {
		return nil, err
	}
	return model.ToAttendanceEntity(&attendance), nil
}

func (r *attendanceRepository) Create(ctx context.Context, attendance *entity.Attendance) (*entity.Attendance, error) {
	attendanceModel := model.FromAttendanceEntity(attendance)
	if err := r.getDB(ctx).Create(&attendanceModel).Error; err != nil {
		return nil, err
	}
	return model.ToAttendanceEntity(attendanceModel), nil
}

func (r *attendanceRepository) Update(ctx context.Context, attendance *entity.Attendance) (*entity.Attendance, error) {
	attendanceModel := model.FromAttendanceEntity(attendance)
	// Use Updates instead of Save to avoid updating created_at
	if err := r.getDB(ctx).Model(&model.Attendance{}).Where("id = ?", attendanceModel.Id).Updates(map[string]interface{}{
		"user_id":       attendanceModel.UserId,
		"date":          attendanceModel.Date,
		"start_time":    attendanceModel.StartTime,
		"end_time":      attendanceModel.EndTime,
		"break_minutes": attendanceModel.BreakMinutes,
		"report":        attendanceModel.Report,
	}).Error; err != nil {
		return nil, err
	}
	
	// Fetch the updated attendance to return
	var updatedAttendance model.Attendance
	if err := r.getDB(ctx).First(&updatedAttendance, attendanceModel.Id).Error; err != nil {
		return nil, err
	}
	return model.ToAttendanceEntity(&updatedAttendance), nil
}

func (r *attendanceRepository) Delete(ctx context.Context, id int) error {
	return r.getDB(ctx).Delete(&model.Attendance{}, id).Error
}
