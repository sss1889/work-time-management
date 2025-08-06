package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/attendance_report_app/backend/internal/application/usecase"
)

type DailyReportHandler struct {
	dailyReportUseCase usecase.DailyReportUseCase
}

func NewDailyReportHandler(dailyReportUseCase usecase.DailyReportUseCase) *DailyReportHandler {
	return &DailyReportHandler{
		dailyReportUseCase: dailyReportUseCase,
	}
}

func (h *DailyReportHandler) GetAllDailyReports(c *gin.Context) {
	reports, err := h.dailyReportUseCase.GetAllDailyReports(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, reports.Reports)
}