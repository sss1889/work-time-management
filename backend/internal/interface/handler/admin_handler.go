package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/attendance_report_app/backend/internal/application/usecase"
)

type AdminHandler struct {
	adminUseCase      usecase.AdminUseCase
	attendanceUseCase usecase.AttendanceUseCase
}

func NewAdminHandler(adminUseCase usecase.AdminUseCase, attendanceUseCase usecase.AttendanceUseCase) *AdminHandler {
	return &AdminHandler{
		adminUseCase:      adminUseCase,
		attendanceUseCase: attendanceUseCase,
	}
}

func (h *AdminHandler) GetDashboard(c *gin.Context) {
	dashboard, err := h.adminUseCase.GetDashboardData(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, dashboard)
}

func (h *AdminHandler) GetPayroll(c *gin.Context) {
	month := c.Query("month")
	if month == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "month parameter is required"})
		return
	}

	payroll, err := h.adminUseCase.GetPayrollData(c.Request.Context(), month)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, payroll)
}

func (h *AdminHandler) GetUserAttendances(c *gin.Context) {
	userIDStr := c.Param("userId")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	month := c.Query("month")
	var monthPtr *string
	if month != "" {
		monthPtr = &month
	}

	attendances, err := h.attendanceUseCase.GetMyAttendances(c.Request.Context(), userID, monthPtr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, attendances.Attendances)
}