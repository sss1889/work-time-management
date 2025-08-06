package entity

import (
	"errors"
	"time"
)

type UserRole string

const (
	UserRoleAdmin UserRole = "ADMIN"
	UserRoleUser  UserRole = "USER"
)

type PayType string

const (
	PayTypeHourly PayType = "HOURLY"
	PayTypeSalary PayType = "MONTHLY"
)

func (r UserRole) Validate() error {
	switch r {
	case UserRoleAdmin, UserRoleUser:
		return nil
	default:
		return errors.New("invalid user role")
	}
}

func (p PayType) Validate() error {
	switch p {
	case PayTypeHourly, PayTypeSalary:
		return nil
	default:
		return errors.New("invalid pay type")
	}
}

type User struct {
	Id        int
	Name      string
	Email     string
	Password  string
	Role      UserRole
	PayType   PayType
	PayRate   int
	Goal      int
	CreatedAt time.Time
	UpdatedAt time.Time
}

func NewUser(name, email, password string, role UserRole, payType PayType, payRate int) (*User, error) {
	if err := role.Validate(); err != nil {
		return nil, err
	}
	if err := payType.Validate(); err != nil {
		return nil, err
	}

	return &User{
		Name:      name,
		Email:     email,
		Password:  password,
		Role:      role,
		PayType:   payType,
		PayRate:   payRate,
		Goal:      0, // Default goal is 0
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}, nil
}

func (u *User) IsAdmin() bool {
	return u.Role == UserRoleAdmin
}
func (u *User) IsUser() bool {
	return u.Role == UserRoleUser
}

func (u *User) Validate() error {
	if u.Name == "" {
		return errors.New("name cannot be empty")
	}
	if u.Email == "" {
		return errors.New("email cannot be empty")
	}
	if u.Password == "" {
		return errors.New("password cannot be empty")
	}
	if err := u.Role.Validate(); err != nil {
		return err
	}
	if err := u.PayType.Validate(); err != nil {
		return err
	}
	if u.PayRate <= 0 {
		return errors.New("pay rate must be greater than zero")
	}
	return nil
}
