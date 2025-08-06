package request

import "errors"

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (l *LoginRequest) Validate() error {
	if l.Email == "" || l.Password == "" {
		return errors.New("email and password cannot be empty")
	}
	return nil
}

type CreateUserRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
	PayType  string `json:"pay_type"`
	PayRate  int    `json:"pay_rate"`
}

func (c *CreateUserRequest) Validate() error {
	if c.Name == "" {
		return errors.New("name cannot be empty")
	}
	if c.Email == "" {
		return errors.New("email cannot be empty")
	}
	if c.Password == "" {
		return errors.New("password cannot be empty")
	}
	if c.Role == "" {
		return errors.New("role cannot be empty")
	}
	if c.PayType == "" {
		return errors.New("pay type cannot be empty")
	}
	if c.PayRate <= 0 {
		return errors.New("pay rate must be greater than zero")
	}
	return nil
}

type UpdateUserRequest struct {
	Name    *string `json:"name,omitempty"`
	Email   *string `json:"email,omitempty"`
	Role    *string `json:"role,omitempty"`
	PayType *string `json:"pay_type,omitempty"`
	PayRate *int    `json:"pay_rate,omitempty"`
	Goal    *int    `json:"goal,omitempty"`
}

func (u *UpdateUserRequest) Validate() error {
	if u.Name != nil && *u.Name == "" {
		return errors.New("name cannot be empty")
	}
	if u.Email != nil && *u.Email == "" {
		return errors.New("email cannot be empty")
	}
	if u.Role != nil && *u.Role == "" {
		return errors.New("role cannot be empty")
	}
	if u.PayType != nil && *u.PayType == "" {
		return errors.New("pay type cannot be empty")
	}
	if u.PayRate != nil && *u.PayRate <= 0 {
		return errors.New("pay rate must be greater than zero")
	}
	if u.Goal != nil && *u.Goal < 0 {
		return errors.New("goal must be greater than or equal to zero")
	}
	return nil
}
