package domain

import (
	"errors"
)

// Domain errors
var (
	ErrUserNotFound       = errors.New("user not found")
	ErrAttendanceNotFound = errors.New("attendance not found")
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrEmailAlreadyExists = errors.New("email already exists")
	ErrUnauthorized       = errors.New("unauthorized")
	ErrForbidden          = errors.New("forbidden")
)