package usecase

import (
	"context"
	"errors"
	"fmt"

	"github.com/attendance_report_app/backend/internal/application/dto"
	"github.com/attendance_report_app/backend/internal/application/dto/request"
	"github.com/attendance_report_app/backend/internal/domain/entity"
	"github.com/attendance_report_app/backend/internal/domain/repository"
)

type UserUseCase interface {
	// Authentication
	Login(ctx context.Context, email, password string) (*dto.LoginResponse, error)
	Logout(ctx context.Context, userID int) error

	// User Profile
	ChangePassword(ctx context.Context, userID int, req *request.ChangePasswordRequest) error

	// User Management (ADMIN only)
	// NOTE: These methods should only be called after verifying ADMIN role in the handler/middleware layer
	GetAllUsers(ctx context.Context) (*dto.UsersResponse, error)
	CreateUser(ctx context.Context, req *request.CreateUserRequest) (*dto.UserResponse, error)
	UpdateUser(ctx context.Context, userID int, req *request.UpdateUserRequest) (*dto.UserResponse, error)
	DeleteUser(ctx context.Context, userID int) error
}

type userUseCase struct {
	userRepo     repository.UserRepository
	tokenService TokenService // JWT token service interface
}

// TokenService interface for JWT operations
type TokenService interface {
	GenerateToken(userID int, role string) (string, error)
	InvalidateToken(token string) error
}

func NewUserUseCase(userRepo repository.UserRepository, tokenService TokenService) UserUseCase {
	return &userUseCase{
		userRepo:     userRepo,
		tokenService: tokenService,
	}
}

func (u *userUseCase) Login(ctx context.Context, email, password string) (*dto.LoginResponse, error) {
	// Find user by email
	user, err := u.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	// Verify password
	if err := VerifyPassword(user.Password, password); err != nil {
		return nil, errors.New("invalid email or password")
	}

	// Generate JWT token
	token, err := u.tokenService.GenerateToken(user.Id, string(user.Role))
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	return dto.ToLoginResponse(user, token), nil
}

func (u *userUseCase) Logout(ctx context.Context, userID int) error {
	// In a real implementation, you might want to invalidate the token
	// This depends on your token management strategy
	return nil
}

// GetAllUsers returns all users (ADMIN only)
// NOTE: Caller must verify ADMIN role before calling this method
func (u *userUseCase) GetAllUsers(ctx context.Context) (*dto.UsersResponse, error) {
	users, err := u.userRepo.FindAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get users: %w", err)
	}

	return dto.ToUsersResponse(users), nil
}

// CreateUser creates a new user (ADMIN only)
// NOTE: Caller must verify ADMIN role before calling this method
func (u *userUseCase) CreateUser(ctx context.Context, req *request.CreateUserRequest) (*dto.UserResponse, error) {
	// Validate request
	if err := req.Validate(); err != nil {
		return nil, fmt.Errorf("invalid request: %w", err)
	}

	// Check if email already exists
	existingUser, _ := u.userRepo.FindByEmail(ctx, req.Email)
	if existingUser != nil {
		return nil, errors.New("email already exists")
	}

	// Hash password
	hashedPassword, err := HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	// Create user entity
	user := &entity.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: hashedPassword,
		Role:     entity.UserRole(req.Role),
		PayType:  entity.PayType(req.PayType),
		PayRate:  req.PayRate,
	}

	// Validate user entity
	if err := user.Validate(); err != nil {
		return nil, err
	}

	// Save to repository
	createdUser, err := u.userRepo.Create(ctx, user)
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return dto.ToUserResponse(createdUser), nil
}

// UpdateUser updates an existing user (ADMIN only)
// NOTE: Caller must verify ADMIN role before calling this method
func (u *userUseCase) UpdateUser(ctx context.Context, userID int, req *request.UpdateUserRequest) (*dto.UserResponse, error) {
	// Validate request
	if err := req.Validate(); err != nil {
		return nil, fmt.Errorf("invalid request: %w", err)
	}

	// Get existing user
	user, err := u.userRepo.FindById(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	// Update fields if provided
	if req.Name != nil {
		user.Name = *req.Name
	}

	if req.Email != nil {
		// Check if new email already exists
		existingUser, _ := u.userRepo.FindByEmail(ctx, *req.Email)
		if existingUser != nil && existingUser.Id != userID {
			return nil, errors.New("email already exists")
		}
		user.Email = *req.Email
	}

	if req.Role != nil {
		role := entity.UserRole(*req.Role)
		if err := role.Validate(); err != nil {
			return nil, err
		}
		user.Role = role
	}

	if req.PayType != nil {
		payType := entity.PayType(*req.PayType)
		if err := payType.Validate(); err != nil {
			return nil, err
		}
		user.PayType = payType
	}

	if req.PayRate != nil {
		user.PayRate = *req.PayRate
	}

	if req.Goal != nil {
		user.Goal = *req.Goal
	}

	// Update in repository
	updatedUser, err := u.userRepo.Update(ctx, user)
	if err != nil {
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	return dto.ToUserResponse(updatedUser), nil
}

// DeleteUser deletes a user (ADMIN only)
// NOTE: Caller must verify ADMIN role before calling this method
func (u *userUseCase) DeleteUser(ctx context.Context, userID int) error {
	// Check if user exists
	_, err := u.userRepo.FindById(ctx, userID)
	if err != nil {
		return fmt.Errorf("user not found: %w", err)
	}

	// Delete user
	if err := u.userRepo.Delete(ctx, userID); err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}

	return nil
}

// ChangePassword changes a user's password
func (u *userUseCase) ChangePassword(ctx context.Context, userID int, req *request.ChangePasswordRequest) error {
	// Get user
	user, err := u.userRepo.FindById(ctx, userID)
	if err != nil {
		return fmt.Errorf("user not found: %w", err)
	}

	// Verify current password
	if err := VerifyPassword(user.Password, req.CurrentPassword); err != nil {
		return errors.New("current password is incorrect")
	}

	// Hash new password
	hashedNewPassword, err := HashPassword(req.NewPassword)
	if err != nil {
		return fmt.Errorf("failed to hash new password: %w", err)
	}

	// Update password
	user.Password = hashedNewPassword

	// Save to repository
	_, err = u.userRepo.Update(ctx, user)
	if err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}

	return nil
}

