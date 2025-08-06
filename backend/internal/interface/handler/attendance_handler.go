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

type AttendanceHandler struct {
	attendanceUseCase usecase.AttendanceUseCase
	txManager         transaction.Manager
}

func NewAttendanceHandler(attendanceUseCase usecase.AttendanceUseCase, txManager transaction.Manager) *AttendanceHandler {
	return &AttendanceHandler{
		attendanceUseCase: attendanceUseCase,
		txManager:         txManager,
	}
}

func (h *AttendanceHandler) GetMyAttendances(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	month := c.Query("month")
	var monthPtr *string
	if month != "" {
		monthPtr = &month
	}

	attendances, err := h.attendanceUseCase.GetMyAttendances(c.Request.Context(), userID.(int), monthPtr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, attendances.Attendances)
}

func (h *AttendanceHandler) CreateAttendance(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req request.CreateAttendanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	if err := req.Validate(); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var attendance *dto.AttendanceResponse
	err := h.txManager.ExecuteInTx(c.Request.Context(), func(ctx context.Context) error {
		var err error
		attendance, err = h.attendanceUseCase.CreateAttendance(ctx, &req, userID.(int))
		return err
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, attendance)
}

func (h *AttendanceHandler) UpdateAttendance(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid attendance ID"})
		return
	}

	var req request.UpdateAttendanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	if err := req.Validate(); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var attendance *dto.AttendanceResponse
	err = h.txManager.ExecuteInTx(c.Request.Context(), func(ctx context.Context) error {
		var err error
		attendance, err = h.attendanceUseCase.UpdateAttendance(ctx, id, &req)
		return err
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, attendance)
}