package router

import (
	"github.com/gin-gonic/gin"
	"github.com/attendance_report_app/backend/internal/interface/handler"
	"github.com/attendance_report_app/backend/internal/interface/middleware"
)

type Router struct {
	authHandler       *handler.AuthHandler
	userHandler       *handler.UserHandler
	attendanceHandler *handler.AttendanceHandler
	dailyReportHandler *handler.DailyReportHandler
	adminHandler      *handler.AdminHandler
	authMiddleware    middleware.AuthMiddleware
}

func NewRouter(
	authHandler *handler.AuthHandler,
	userHandler *handler.UserHandler,
	attendanceHandler *handler.AttendanceHandler,
	dailyReportHandler *handler.DailyReportHandler,
	adminHandler *handler.AdminHandler,
	authMiddleware middleware.AuthMiddleware,
) *Router {
	return &Router{
		authHandler:       authHandler,
		userHandler:       userHandler,
		attendanceHandler: attendanceHandler,
		dailyReportHandler: dailyReportHandler,
		adminHandler:      adminHandler,
		authMiddleware:    authMiddleware,
	}
}

func (r *Router) Setup(engine *gin.Engine) {
	api := engine.Group("/api")

	auth := api.Group("/auth")
	{
		auth.POST("/login", r.authHandler.Login)
		auth.POST("/logout", r.authMiddleware.RequireAuth(), r.authHandler.Logout)
	}

	users := api.Group("/users")
	users.Use(r.authMiddleware.RequireAuth(), r.authMiddleware.RequireAdmin())
	{
		users.GET("", r.userHandler.GetAllUsers)
		users.POST("", r.userHandler.CreateUser)
		users.PUT("/:id", r.userHandler.UpdateUser)
		users.DELETE("/:id", r.userHandler.DeleteUser)
	}

	// User profile endpoint (user can update their own profile)
	profile := api.Group("/profile")
	profile.Use(r.authMiddleware.RequireAuth())
	{
		profile.PUT("", r.userHandler.UpdateMyProfile)
		profile.POST("/change-password", r.userHandler.ChangePassword)
	}

	attendance := api.Group("/attendance")
	attendance.Use(r.authMiddleware.RequireAuth())
	{
		attendance.GET("", r.attendanceHandler.GetMyAttendances)
		attendance.POST("", r.attendanceHandler.CreateAttendance)
		attendance.PUT("/:id", r.authMiddleware.RequireAdmin(), r.attendanceHandler.UpdateAttendance)
	}

	reports := api.Group("/reports")
	reports.Use(r.authMiddleware.RequireAuth())
	{
		reports.GET("", r.dailyReportHandler.GetAllDailyReports)
	}

	admin := api.Group("/admin")
	admin.Use(r.authMiddleware.RequireAuth(), r.authMiddleware.RequireAdmin())
	{
		admin.GET("/dashboard", r.adminHandler.GetDashboard)
		admin.GET("/payroll", r.adminHandler.GetPayroll)
		admin.GET("/users/:userId/attendances", r.adminHandler.GetUserAttendances)
	}
}