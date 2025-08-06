package model

import (
	"time"

	"github.com/attendance_report_app/backend/internal/domain/entity"
)

type Attendance struct {
	Id           int       `gorm:"primaryKey;column:id;autoIncrement"`
	UserId       int       `gorm:"column:user_id;not null"`
	User         User      `gorm:"foreignKey:UserId;references:Id;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Date         time.Time `gorm:"column:date;not null"`
	StartTime    time.Time `gorm:"column:start_time;not null"`
	EndTime      time.Time `gorm:"column:end_time;not null"`
	BreakMinutes int       `gorm:"column:break_minutes;not null;default:0"`
	Report       string    `gorm:"column:report;not null;size:500"`
	CreatedAt    time.Time `gorm:"column:created_at;autoCreateTime"`
	UpdatedAt    time.Time `gorm:"column:updated_at;autoUpdateTime"`
}

func (Attendance) TableName() string {
	return "attendances"
}

func (a *Attendance) ToEntity() *entity.Attendance {
	return &entity.Attendance{
		Id:           a.Id,
		UserId:       a.UserId,
		Date:         a.Date,
		StartTime:    a.StartTime,
		EndTime:      a.EndTime,
		BreakMinutes: a.BreakMinutes,
		Report:       a.Report,
		CreatedAt:    a.CreatedAt,
		UpdatedAt:    a.UpdatedAt,
	}
}
func (a *Attendance) FromEntity(attendance *entity.Attendance) {
	a.Id = attendance.Id
	a.UserId = attendance.UserId
	a.Date = attendance.Date
	a.StartTime = attendance.StartTime
	a.EndTime = attendance.EndTime
	a.BreakMinutes = attendance.BreakMinutes
	a.Report = attendance.Report
}

// Helper functions for conversion
func ToAttendanceEntity(a *Attendance) *entity.Attendance {
	return a.ToEntity()
}

func ToAttendanceEntities(attendances []Attendance) []*entity.Attendance {
	entities := make([]*entity.Attendance, len(attendances))
	for i, a := range attendances {
		entities[i] = a.ToEntity()
	}
	return entities
}

func FromAttendanceEntity(attendance *entity.Attendance) *Attendance {
	a := &Attendance{}
	a.FromEntity(attendance)
	return a
}
