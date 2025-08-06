package usecase

import (
	"errors"
	"fmt"
	"time"

	"github.com/attendance_report_app/backend/internal/domain/entity"
	"golang.org/x/crypto/bcrypt"
)

// Date and time format constants
const (
	DateFormat = "2006-01-02"
	TimeFormat = time.RFC3339
)

// CalculateWorkingHours calculates the actual working hours from an attendance record
// It subtracts break time from the total duration
func CalculateWorkingHours(attendance *entity.Attendance) float64 {
	duration := attendance.EndTime.Sub(attendance.StartTime)
	breakDuration := time.Duration(attendance.BreakMinutes) * time.Minute
	workingHours := (duration - breakDuration).Hours()

	// Ensure non-negative hours
	if workingHours < 0 {
		return 0
	}

	return workingHours
}

// CalculateSalary calculates the salary based on pay type and working hours
func CalculateSalary(payType entity.PayType, payRate int, workingHours float64) int {
	if payType == entity.PayTypeHourly {
		return int(workingHours * float64(payRate))
	}
	// Monthly pay type
	return payRate
}

// ValidateRole validates if the role is valid
func ValidateRole(role entity.UserRole) error {
	if role != entity.UserRoleAdmin && role != entity.UserRoleUser {
		return errors.New("invalid role")
	}
	return nil
}

// ValidatePayType validates if the pay type is valid
func ValidatePayType(payType entity.PayType) error {
	if payType != entity.PayTypeHourly && payType != entity.PayTypeSalary {
		return errors.New("invalid pay type")
	}
	return nil
}

// ParseDate parses a date string in YYYY-MM-DD format
func ParseDate(dateStr string) (time.Time, error) {
	date, err := time.Parse(DateFormat, dateStr)
	if err != nil {
		return time.Time{}, fmt.Errorf("invalid date format: %w", err)
	}
	return date, nil
}

// ParseTime parses a time string in RFC3339 format
func ParseTime(timeStr string) (time.Time, error) {
	t, err := time.Parse(TimeFormat, timeStr)
	if err != nil {
		return time.Time{}, fmt.Errorf("invalid time format: %w", err)
	}
	return t, nil
}

// ParseMonth parses a month string in YYYY-MM format
func ParseMonth(monthStr string) (time.Time, error) {
	month, err := time.Parse("2006-01", monthStr)
	if err != nil {
		return time.Time{}, fmt.Errorf("invalid month format: %w", err)
	}
	return month, nil
}

// HashPassword hashes a password using bcrypt
func HashPassword(password string) (string, error) {
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", fmt.Errorf("failed to hash password: %w", err)
	}
	return string(hashedBytes), nil
}

// VerifyPassword compares a hashed password with a plain text password
func VerifyPassword(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}

