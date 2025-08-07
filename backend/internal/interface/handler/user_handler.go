package handler

import (
	"context"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/attendance_report_app/backend/internal/application/dto"
	"github.com/attendance_report_app/backend/internal/application/dto/request"
	"github.com/attendance_report_app/backend/internal/application/usecase"
	"github.com/attendance_report_app/backend/internal/application/transaction"
)

type UserHandler struct {
	userUseCase usecase.UserUseCase
	txManager   transaction.Manager
}

func NewUserHandler(userUseCase usecase.UserUseCase, txManager transaction.Manager) *UserHandler {
	return &UserHandler{
		userUseCase: userUseCase,
		txManager:   txManager,
	}
}

func (h *UserHandler) GetAllUsers(c *gin.Context) {
	users, err := h.userUseCase.GetAllUsers(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve users"})
		return
	}

	c.JSON(http.StatusOK, users.Users)
}

func (h *UserHandler) CreateUser(c *gin.Context) {
	var req request.CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	if err := req.Validate(); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user *dto.UserResponse
	err := h.txManager.ExecuteInTx(c.Request.Context(), func(ctx context.Context) error {
		var err error
		user, err = h.userUseCase.CreateUser(ctx, &req)
		return err
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, user)
}

func (h *UserHandler) UpdateUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var req request.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	if err := req.Validate(); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user *dto.UserResponse
	err = h.txManager.ExecuteInTx(c.Request.Context(), func(ctx context.Context) error {
		var err error
		user, err = h.userUseCase.UpdateUser(ctx, id, &req)
		return err
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (h *UserHandler) UpdateMyProfile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req request.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	// For profile updates, only allow goal updates for now
	// You can extend this to allow name updates etc. if needed
	if req.Name != nil || req.Email != nil || req.Role != nil || req.PayType != nil || req.PayRate != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only goal updates are allowed"})
		return
	}

	if err := req.Validate(); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user *dto.UserResponse
	err := h.txManager.ExecuteInTx(c.Request.Context(), func(ctx context.Context) error {
		var err error
		user, err = h.userUseCase.UpdateUser(ctx, userID.(int), &req)
		return err
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (h *UserHandler) DeleteUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	err = h.txManager.ExecuteInTx(c.Request.Context(), func(ctx context.Context) error {
		return h.userUseCase.DeleteUser(ctx, id)
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

func (h *UserHandler) ChangePassword(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req request.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	if err := req.Validate(); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.txManager.ExecuteInTx(c.Request.Context(), func(ctx context.Context) error {
		return h.userUseCase.ChangePassword(ctx, userID.(int), &req)
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password changed successfully"})
}