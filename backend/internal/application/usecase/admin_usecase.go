package usecase

import (
	"context"
	"fmt"
	"time"

	"github.com/attendance_report_app/backend/internal/application/dto"
	"github.com/attendance_report_app/backend/internal/domain/entity"
	"github.com/attendance_report_app/backend/internal/domain/repository"
)

type AdminUseCase interface {
	// GetDashboardData returns aggregated data for admin dashboard (ADMIN only)
	// NOTE: Caller must verify ADMIN role before calling this method
	GetDashboardData(ctx context.Context) (*dto.DashboardResponse, error)

	// GetPayrollData returns payroll data for all employees for a specified month (ADMIN only)
	// NOTE: Caller must verify ADMIN role before calling this method
	GetPayrollData(ctx context.Context, month string) (*dto.PayrollResponse, error)
}

type adminUseCase struct {
	userRepo       repository.UserRepository
	attendanceRepo repository.AttendanceRepository
}

func NewAdminUseCase(userRepo repository.UserRepository, attendanceRepo repository.AttendanceRepository) AdminUseCase {
	return &adminUseCase{
		userRepo:       userRepo,
		attendanceRepo: attendanceRepo,
	}
}

// GetDashboardData returns aggregated data for admin dashboard
func (u *adminUseCase) GetDashboardData(ctx context.Context) (*dto.DashboardResponse, error) {
	// Get all users
	users, err := u.userRepo.FindAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get users: %w", err)
	}

	// Get all attendances
	attendances, err := u.attendanceRepo.FindAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get attendances: %w", err)
	}

	// Calculate aggregated data
	var totalHours float64
	var totalSalary int
	activeEmployees := 0

	// Create employee data map
	employeeDataMap := make(map[int]*dto.DashboardEmployeeData)

	// Initialize employee data for all users
	for _, user := range users {
		if user.Role == entity.UserRoleUser {
			activeEmployees++
			employeeDataMap[user.Id] = &dto.DashboardEmployeeData{
				Name:        user.Name,
				TotalHours:  0,
				TotalSalary: 0,
			}
		}
	}

	// Calculate hours for each attendance
	for _, attendance := range attendances {
		// Calculate working hours using common utility
		workingHours := CalculateWorkingHours(attendance)

		// Add to employee's total hours
		if empData, exists := employeeDataMap[attendance.UserId]; exists {
			empData.TotalHours += workingHours
			totalHours += workingHours
		}
	}

	// Calculate salary for each employee
	for _, user := range users {
		if empData, exists := employeeDataMap[user.Id]; exists {
			empData.TotalSalary = CalculateSalary(user.PayType, user.PayRate, empData.TotalHours)
			totalSalary += empData.TotalSalary
		}
	}

	// Convert map to slice
	employeeDataSlice := make([]dto.DashboardEmployeeData, 0, len(employeeDataMap))
	for _, empData := range employeeDataMap {
		employeeDataSlice = append(employeeDataSlice, *empData)
	}

	return &dto.DashboardResponse{
		TotalHours:      totalHours,
		TotalSalary:     totalSalary,
		ActiveEmployees: activeEmployees,
		EmployeeData:    employeeDataSlice,
	}, nil
}

// GetPayrollData returns payroll data for all employees for a specified month
func (u *adminUseCase) GetPayrollData(ctx context.Context, month string) (*dto.PayrollResponse, error) {
	// Parse month string (YYYY-MM format)
	monthTime, err := ParseMonth(month)
	if err != nil {
		return nil, err
	}

	// Get first and last day of the month
	startDate := monthTime
	endDate := monthTime.AddDate(0, 1, 0).Add(-time.Second)

	// Get all users
	users, err := u.userRepo.FindAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get users: %w", err)
	}

	var totalPayroll int
	payrollData := make([]dto.PayrollEmployee, 0)

	// Calculate payroll for each user
	for _, user := range users {
		if user.Role != entity.UserRoleUser {
			continue // Skip non-employee users (e.g., admins)
		}

		// Get attendances for this user in the specified month
		attendances, err := u.attendanceRepo.FindByDatePeriod(ctx, user.Id, startDate, endDate)
		if err != nil {
			return nil, fmt.Errorf("failed to get attendances for user %d: %w", user.Id, err)
		}

		// Calculate total hours for the month
		var totalHours float64
		for _, attendance := range attendances {
			workingHours := CalculateWorkingHours(attendance)
			totalHours += workingHours
		}

		// Calculate salary
		salary := CalculateSalary(user.PayType, user.PayRate, totalHours)

		totalPayroll += salary

		// Add to payroll data
		payrollData = append(payrollData, dto.PayrollEmployee{
			ID:          fmt.Sprintf("user-%d", user.Id), // Convert int to string format
			Name:        user.Name,
			PayType:     string(user.PayType),
			PayRate:     user.PayRate,
			TotalHours:  totalHours,
			TotalSalary: salary,
		})
	}

	return &dto.PayrollResponse{
		TotalPayroll: totalPayroll,
		PayrollData:  payrollData,
	}, nil
}
