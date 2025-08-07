package usecase

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/attendance_report_app/backend/internal/application/dto"
	"github.com/attendance_report_app/backend/internal/application/dto/request"
	"github.com/attendance_report_app/backend/internal/domain/entity"
	"github.com/attendance_report_app/backend/internal/domain/repository"
	"github.com/attendance_report_app/backend/internal/infrastructure/slack"
)

type AttendanceUseCase interface {
	GetMyAttendances(ctx context.Context, userID int, month *string) (*dto.AttendanceListResponse, error)
	CreateAttendance(ctx context.Context, req *request.CreateAttendanceRequest, userID int) (*dto.AttendanceResponse, error)
	UpdateAttendance(ctx context.Context, id int, req *request.UpdateAttendanceRequest) (*dto.AttendanceResponse, error)
}

type attendanceUseCase struct {
	attendanceRepo repository.AttendanceRepository
	userRepo       repository.UserRepository
	slackService   slack.SlackService
}

func NewAttendanceUseCase(attendanceRepo repository.AttendanceRepository, userRepo repository.UserRepository, slackService slack.SlackService) AttendanceUseCase {
	return &attendanceUseCase{
		attendanceRepo: attendanceRepo,
		userRepo:       userRepo,
		slackService:   slackService,
	}
}

func (u *attendanceUseCase) GetMyAttendances(ctx context.Context, userID int, month *string) (*dto.AttendanceListResponse, error) {
	var attendances []*entity.Attendance
	var err error

	if month != nil && *month != "" {
		// Parse month string (YYYY-MM format)
		monthTime, err := ParseMonth(*month)
		if err != nil {
			return nil, err
		}

		// Get first and last day of the month
		startDate := monthTime
		endDate := monthTime.AddDate(0, 1, 0).Add(-time.Second)

		attendances, err = u.attendanceRepo.FindByDatePeriod(ctx, userID, startDate, endDate)
		if err != nil {
			return nil, fmt.Errorf("failed to get attendances by period: %w", err)
		}
	} else {
		// Get all attendances for the user
		attendances, err = u.attendanceRepo.FindByUserId(ctx, userID)
		if err != nil {
			return nil, fmt.Errorf("failed to get all attendances: %w", err)
		}
	}

	return dto.ToAttendanceListResponse(attendances), nil
}

func (u *attendanceUseCase) CreateAttendance(ctx context.Context, req *request.CreateAttendanceRequest, userID int) (*dto.AttendanceResponse, error) {
	// Validate request
	if err := req.Validate(); err != nil {
		return nil, fmt.Errorf("invalid request: %w", err)
	}

	// Parse date and time strings
	date, err := ParseDate(req.Date)
	if err != nil {
		return nil, err
	}

	startTime, err := ParseTime(req.StartTime)
	if err != nil {
		return nil, err
	}

	endTime, err := ParseTime(req.EndTime)
	if err != nil {
		return nil, err
	}

	// Create attendance entity
	attendance := &entity.Attendance{
		UserId:       userID,
		Date:         date,
		StartTime:    startTime,
		EndTime:      endTime,
		BreakMinutes: req.BreakMinutes,
		Report:       req.Report,
	}

	// Save to repository
	createdAttendance, err := u.attendanceRepo.Create(ctx, attendance)
	if err != nil {
		return nil, fmt.Errorf("failed to create attendance: %w", err)
	}

	// Send Slack notification asynchronously
	go func() {
		// Use background context for async operation
		user, err := u.userRepo.FindById(context.Background(), userID)
		if err != nil {
			log.Printf("Failed to get user for Slack notification: %v", err)
			return
		}

		// Send Slack notification
		err = u.slackService.SendAttendanceNotification(
			user.Name,
			date,
			startTime,
			endTime,
			req.BreakMinutes,
			req.Report,
		)
		if err != nil {
			log.Printf("Failed to send Slack notification: %v", err)
		}
	}()

	return dto.ToAttendanceResponse(createdAttendance), nil
}

func (u *attendanceUseCase) UpdateAttendance(ctx context.Context, id int, req *request.UpdateAttendanceRequest) (*dto.AttendanceResponse, error) {
	// Validate request
	if err := req.Validate(); err != nil {
		return nil, fmt.Errorf("invalid request: %w", err)
	}

	// Get existing attendance
	attendance, err := u.attendanceRepo.FindById(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to find attendance: %w", err)
	}

	// Update fields if provided
	if req.Date != nil {
		date, err := ParseDate(*req.Date)
		if err != nil {
			return nil, err
		}
		attendance.Date = date
	}

	if req.StartTime != nil {
		startTime, err := ParseTime(*req.StartTime)
		if err != nil {
			return nil, err
		}
		attendance.StartTime = startTime
	}

	if req.EndTime != nil {
		endTime, err := ParseTime(*req.EndTime)
		if err != nil {
			return nil, err
		}
		attendance.EndTime = endTime
	}

	if req.BreakMinutes != nil {
		attendance.BreakMinutes = *req.BreakMinutes
	}

	if req.Report != nil {
		attendance.Report = *req.Report
	}

	// Update in repository
	updatedAttendance, err := u.attendanceRepo.Update(ctx, attendance)
	if err != nil {
		return nil, fmt.Errorf("failed to update attendance: %w", err)
	}

	return dto.ToAttendanceResponse(updatedAttendance), nil
}
