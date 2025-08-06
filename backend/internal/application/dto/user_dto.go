package dto

import (
	"github.com/attendance_report_app/backend/internal/domain/entity"
)

type UserResponse struct {
	ID      int    `json:"id"`
	Email   string `json:"email"`
	Name    string `json:"name"`
	Role    string `json:"role"`
	PayType string `json:"pay_type"`
	PayRate int    `json:"pay_rate"`
	Goal    int    `json:"goal"`
}

type LoginResponse struct {
	Token string       `json:"token"`
	User  UserResponse `json:"user"`
}

type UsersResponse struct {
	Users []UserResponse `json:"users"`
}

func ToUserResponse(user *entity.User) *UserResponse {
	return &UserResponse{
		ID:      user.Id,
		Email:   user.Email,
		Name:    user.Name,
		Role:    string(user.Role),
		PayType: string(user.PayType),
		PayRate: user.PayRate,
		Goal:    user.Goal,
	}
}

func ToLoginResponse(user *entity.User, token string) *LoginResponse {
	return &LoginResponse{
		Token: token,
		User:  *ToUserResponse(user),
	}
}

func ToUsersResponse(users []*entity.User) *UsersResponse {
	userResponses := make([]UserResponse, len(users))
	for i, user := range users {
		userResponses[i] = *ToUserResponse(user)
	}
	return &UsersResponse{
		Users: userResponses,
	}
}
