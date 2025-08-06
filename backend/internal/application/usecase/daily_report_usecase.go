package usecase

import (
	"context"
	"fmt"
	"sort"

	"github.com/attendance_report_app/backend/internal/application/dto"
	"github.com/attendance_report_app/backend/internal/domain/repository"
)

type DailyReportUseCase interface {
	// GetAllDailyReports returns all daily reports from all users, sorted by date descending
	GetAllDailyReports(ctx context.Context) (*dto.DailyReportsResponse, error)
}

type dailyReportUseCase struct {
	attendanceRepo repository.AttendanceRepository
	userRepo       repository.UserRepository
}

func NewDailyReportUseCase(attendanceRepo repository.AttendanceRepository, userRepo repository.UserRepository) DailyReportUseCase {
	return &dailyReportUseCase{
		attendanceRepo: attendanceRepo,
		userRepo:       userRepo,
	}
}

func (u *dailyReportUseCase) GetAllDailyReports(ctx context.Context) (*dto.DailyReportsResponse, error) {
	// Get all attendances (which contain the reports)
	attendances, err := u.attendanceRepo.FindAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get attendances: %w", err)
	}

	// Create a map to cache user information
	userCache := make(map[int]string)

	// Convert attendances to daily reports
	reports := make([]dto.DailyReportResponse, 0, len(attendances))

	for _, attendance := range attendances {
		// Skip if no report
		if attendance.Report == "" {
			continue
		}

		// Get user name from cache or fetch from repository
		userName, ok := userCache[attendance.UserId]
		if !ok {
			user, err := u.userRepo.FindById(ctx, attendance.UserId)
			if err != nil {
				// Log error but continue processing
				userName = "Unknown User"
			} else {
				userName = user.Name
				userCache[attendance.UserId] = userName
			}
		}

		// Create daily report response
		report := dto.DailyReportResponse{
			Id:       attendance.Id,
			UserId:   attendance.UserId,
			Date:     attendance.Date,
			Report:   attendance.Report,
			UserName: userName,
		}

		reports = append(reports, report)
	}

	// Sort reports by date descending (newest first)
	sort.Slice(reports, func(i, j int) bool {
		return reports[i].Date.After(reports[j].Date)
	})

	return dto.ToDailyReportsResponse(reports), nil
}

