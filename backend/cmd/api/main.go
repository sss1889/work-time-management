package main

import (
	"log"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"github.com/attendance_report_app/backend/internal/application/transaction"
	"github.com/attendance_report_app/backend/internal/application/usecase"
	"github.com/attendance_report_app/backend/internal/infrastructure/database"
	"github.com/attendance_report_app/backend/internal/infrastructure/gorm/repository"
	"github.com/attendance_report_app/backend/internal/infrastructure/jwt"
	"github.com/attendance_report_app/backend/internal/interface/handler"
	"github.com/attendance_report_app/backend/internal/interface/middleware"
	"github.com/attendance_report_app/backend/internal/interface/router"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	config := database.NewConfigFromEnv()
	db, err := database.Connect(config)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	txManager := transaction.NewManager(db)

	userRepo := repository.NewUserRepository(db)
	attendanceRepo := repository.NewAttendanceRepository(db)

	tokenService := jwt.NewTokenService(
		os.Getenv("JWT_SECRET"),
		7*24*time.Hour, // 7 days for development
	)

	userUseCase := usecase.NewUserUseCase(userRepo, tokenService)
	attendanceUseCase := usecase.NewAttendanceUseCase(attendanceRepo)
	dailyReportUseCase := usecase.NewDailyReportUseCase(attendanceRepo, userRepo)
	adminUseCase := usecase.NewAdminUseCase(userRepo, attendanceRepo)

	authHandler := handler.NewAuthHandler(userUseCase)
	userHandler := handler.NewUserHandler(userUseCase, txManager)
	attendanceHandler := handler.NewAttendanceHandler(attendanceUseCase, txManager)
	dailyReportHandler := handler.NewDailyReportHandler(dailyReportUseCase)
	adminHandler := handler.NewAdminHandler(adminUseCase, attendanceUseCase)

	authMiddleware := middleware.NewAuthMiddleware(os.Getenv("JWT_SECRET"))

	r := router.NewRouter(
		authHandler,
		userHandler,
		attendanceHandler,
		dailyReportHandler,
		adminHandler,
		authMiddleware,
	)

	engine := gin.Default()
	
	engine.Use(middleware.CORS())
	engine.Use(middleware.ErrorHandler())
	
	r.Setup(engine)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := engine.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

