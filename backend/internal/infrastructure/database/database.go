package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Config represents database configuration
type Config struct {
	Host     string
	Port     string
	User     string
	Password string
	Database string
	LogLevel logger.LogLevel
}

// Alias for backward compatibility
func NewConfigFromEnv() *Config {
	return NewConfig()
}

// DBName returns the database name for compatibility
func (c *Config) DBName() string {
	return c.Database
}

// NewConfig creates a new database configuration
func NewConfig() *Config {
	host := os.Getenv("DB_HOST")
	if host == "" {
		host = "localhost"
	}

	port := os.Getenv("DB_PORT")
	if port == "" {
		port = "3306"
	}

	user := os.Getenv("DB_USER")
	if user == "" {
		user = "root"
	}

	password := os.Getenv("DB_PASSWORD")
	database := os.Getenv("DB_NAME")
	if database == "" {
		database = "attendance_db"
	}

	logLevel := logger.Info
	if os.Getenv("ENV") == "production" {
		logLevel = logger.Error
	}

	return &Config{
		Host:     host,
		Port:     port,
		User:     user,
		Password: password,
		Database: database,
		LogLevel: logLevel,
	}
}

// NewDB creates a new database connection
func NewDB(config *Config) (*gorm.DB, error) {
	// Create custom logger
	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold:             time.Second,
			LogLevel:                  config.LogLevel,
			IgnoreRecordNotFoundError: true,
			Colorful:                  true,
		},
	)

	// Build MySQL DSN
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		config.User,
		config.Password,
		config.Host,
		config.Port,
		config.Database,
	)

	// Open database connection
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: newLogger,
		NowFunc: func() time.Time {
			return time.Now().Local()
		},
		PrepareStmt: true,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Configure connection pool for MySQL
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get database instance: %w", err)
	}

	// MySQL configuration
	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(25)
	sqlDB.SetConnMaxLifetime(5 * time.Minute)

	return db, nil
}

// CloseDB closes the database connection
func CloseDB(db *gorm.DB) error {
	sqlDB, err := db.DB()
	if err != nil {
		return fmt.Errorf("failed to get database instance: %w", err)
	}
	return sqlDB.Close()
}

// DSN returns the MySQL DSN with database
func (c *Config) DSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		c.User, c.Password, c.Host, c.Port, c.Database)
}

// DSNWithoutDB returns the MySQL DSN without database (for creating database)
func (c *Config) DSNWithoutDB() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/",
		c.User, c.Password, c.Host, c.Port)
}

// Connect creates a new database connection (alias for NewDB)
func Connect(config *Config) (*gorm.DB, error) {
	return NewDB(config)
}

// CreateDatabaseIfNotExists creates the database if it doesn't exist
func CreateDatabaseIfNotExists(config *Config) error {
	db, err := sql.Open("mysql", config.DSNWithoutDB())
	if err != nil {
		return err
	}
	defer db.Close()

	query := fmt.Sprintf("CREATE DATABASE IF NOT EXISTS `%s` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci", config.Database)
	_, err = db.Exec(query)
	return err
}
