package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"github.com/attendance_report_app/backend/internal/infrastructure/database"
	"github.com/attendance_report_app/backend/internal/infrastructure/gorm/model"
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

	if err := seedData(db); err != nil {
		log.Fatal("Failed to seed database:", err)
	}

	log.Println("Seed completed successfully")
}

func seedData(db *gorm.DB) error {
	// Get admin user config from env
	adminEmail := os.Getenv("ADMIN_EMAIL")
	adminPassword := os.Getenv("ADMIN_PASSWORD")
	adminName := os.Getenv("ADMIN_NAME")

	if adminEmail == "" {
		adminEmail = "admin@example.com"
	}
	if adminPassword == "" {
		adminPassword = "admin123"
	}
	if adminName == "" {
		adminName = "System Administrator"
	}

	// Check if admin user already exists
	var existingUser model.User
	result := db.Where("email = ?", adminEmail).First(&existingUser)
	if result.Error == nil {
		log.Printf("Admin user with email %s already exists", adminEmail)
		return nil
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(adminPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// Create admin user
	adminUser := model.User{
		Email:    adminEmail,
		Name:     adminName,
		Password: string(hashedPassword),
		Role:     "ADMIN",
		PayType:  "MONTHLY",
		PayRate:  0, // Admin doesn't need pay rate
	}

	if err := db.Create(&adminUser).Error; err != nil {
		return err
	}

	log.Printf("Admin user created successfully: %s", adminEmail)

	// You can add more seed data here
	// For example, create sample users or attendance records

	return nil
}
