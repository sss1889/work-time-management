package dto

import (
	"time"

	"github.com/attendance_report_app/backend/internal/domain/entity"
)

type AttendanceResponse struct {
	Id           int       `json:"id"`
	UserId       int       `json:"user_id"`
	Date         time.Time `json:"date"`       // ISO 8601 format
	StartTime    time.Time `json:"start_time"` // ISO 8601 format
	EndTime      time.Time `json:"end_time"`   // ISO 8601 format
	BreakMinutes int       `json:"break_minutes"`
	Report       string    `json:"report"`
	CreatedAt    time.Time `json:"created_at"` // ISO 8601 format
	UpdatedAt    time.Time `json:"updated_at"` // ISO 8601 format
}

type AttendanceListResponse struct {
	Attendances []AttendanceResponse `json:"attendances"`
}

func ToAttendanceResponse(attendance *entity.Attendance) *AttendanceResponse {
	return &AttendanceResponse{
		Id:           attendance.Id,
		UserId:       attendance.UserId,
		Date:         attendance.Date,
		StartTime:    attendance.StartTime,
		EndTime:      attendance.EndTime,
		BreakMinutes: attendance.BreakMinutes,
		Report:       attendance.Report,
		CreatedAt:    attendance.CreatedAt,
		UpdatedAt:    attendance.UpdatedAt,
	}
}

func ToAttendanceListResponse(attendances []*entity.Attendance) *AttendanceListResponse {
	response := &AttendanceListResponse{
		Attendances: make([]AttendanceResponse, len(attendances)),
	}

	for i, attendance := range attendances {
		response.Attendances[i] = *ToAttendanceResponse(attendance)
	}

	return response
}
