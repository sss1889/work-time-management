package main

import (
	"log"

	"github.com/joho/godotenv"
	"gorm.io/gorm"

	"github.com/attendance_report_app/backend/internal/infrastructure/database"
	"github.com/attendance_report_app/backend/internal/infrastructure/gorm/model"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	config := database.NewConfigFromEnv()

	// First, create database if not exists
	if err := database.CreateDatabaseIfNotExists(config); err != nil {
		log.Fatal("Failed to create database:", err)
	}
	log.Printf("Database '%s' created or already exists", config.DBName())

	// Then connect to the database
	db, err := database.Connect(config)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	if err := migrate(db); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	log.Println("Migration completed successfully")
}

func migrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&model.User{},
		&model.Attendance{},
	)
}
