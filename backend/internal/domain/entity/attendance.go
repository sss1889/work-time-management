package entity

import (
	"errors"
	"time"
)

type Attendance struct {
	Id           int
	UserId       int
	Date         time.Time
	StartTime    time.Time
	EndTime      time.Time
	BreakMinutes int
	Report       string
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

func NewAttendance(userId int, date, startTime, endTime time.Time, breakMinutes int, report string) (*Attendance, error) {
	if userId <= 0 {
		return nil, errors.New("invalid user ID")
	}
	if startTime.After(endTime) {
		return nil, errors.New("start time cannot be after end time")
	}
	if breakMinutes < 0 {
		return nil, errors.New("break minutes cannot be negative")
	}

	return &Attendance{
		UserId:       userId,
		Date:         date,
		StartTime:    startTime,
		EndTime:      endTime,
		BreakMinutes: breakMinutes,
		Report:       report,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}, nil
}
func (a *Attendance) Validate() error {
	if a.UserId <= 0 {
		return errors.New("invalid user ID")
	}
	if a.StartTime.After(a.EndTime) {
		return errors.New("start time cannot be after end time")
	}
	if a.BreakMinutes < 0 {
		return errors.New("break minutes cannot be negative")
	}
	if a.Report == "" {
		return errors.New("report cannot be empty")
	}
	return nil
}
