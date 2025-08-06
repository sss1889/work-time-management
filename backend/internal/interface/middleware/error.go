package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/attendance_report_app/backend/internal/application/dto"
)

// ErrorHandler returns a global error handler middleware
func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		// Check if there are any errors
		if len(c.Errors) > 0 {
			err := c.Errors.Last()

			// Default to internal server error
			status := http.StatusInternalServerError

			// Check if a status code was already set
			if c.Writer.Status() != http.StatusOK {
				status = c.Writer.Status()
			}

			// Create error response
			response := dto.ErrorResponse{
				Error: err.Error(),
			}

			c.JSON(status, response)
		}
	}
}
