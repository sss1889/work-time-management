package request

import "errors"

type CreateAttendanceRequest struct {
	Date         string `json:"date"`       // ISO 8601 format
	StartTime    string `json:"start_time"` // ISO 8601 format
	EndTime      string `json:"end_time"`   // ISO 8601 format
	BreakMinutes int    `json:"break_minutes"`
	Report       string `json:"report"`
}

func (c *CreateAttendanceRequest) Validate() error {
	if c.Date == "" {
		return errors.New("date cannot be empty")
	}
	if c.StartTime == "" {
		return errors.New("start time cannot be empty")
	}
	if c.EndTime == "" {
		return errors.New("end time cannot be empty")
	}
	if c.BreakMinutes < 0 {
		return errors.New("break minutes cannot be negative")
	}
	if c.Report == "" {
		return errors.New("report cannot be empty")
	}
	return nil
}

type UpdateAttendanceRequest struct {
	Date         *string `json:"date,omitempty"`       // ISO 8601 format
	StartTime    *string `json:"start_time,omitempty"` // ISO 8601 format
	EndTime      *string `json:"end_time,omitempty"`   // ISO 8601 format
	BreakMinutes *int    `json:"break_minutes,omitempty"`
	Report       *string `json:"report,omitempty"`
}

func (u *UpdateAttendanceRequest) Validate() error {
	if u.Date != nil && *u.Date == "" {
		return errors.New("date cannot be empty")
	}
	if u.StartTime != nil && *u.StartTime == "" {
		return errors.New("start time cannot be empty")
	}
	if u.EndTime != nil && *u.EndTime == "" {
		return errors.New("end time cannot be empty")
	}
	if u.BreakMinutes != nil && *u.BreakMinutes < 0 {
		return errors.New("break minutes cannot be negative")
	}
	if u.Report != nil && *u.Report == "" {
		return errors.New("report cannot be empty")
	}
	return nil
}
