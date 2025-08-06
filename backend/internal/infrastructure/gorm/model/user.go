package model

import (
	"time"

	"github.com/attendance_report_app/backend/internal/domain/entity"
)

type User struct {
	Id        int          `gorm:"primaryKey;column:id;autoIncrement"`
	Name      string       `gorm:"column:name;not null;size:255"`
	Email     string       `gorm:"column:email;not null;size:255"`
	Password  string       `gorm:"column:password;not null;size:255"`
	Role      string       `gorm:"column:role;not null;size:50;default:'USER'"`
	PayType   string       `gorm:"column:pay_type;not null;size:50;default:'HOURLY'"`
	PayRate   int          `gorm:"column:pay_rate;not null"`
	Goal      int          `gorm:"column:goal;default:0"`
	CreatedAt time.Time    `gorm:"column:created_at;autoCreateTime"`
	UpdatedAt time.Time    `gorm:"column:updated_at;autoUpdateTime"`
	
	// Relations
	Attendances []Attendance `gorm:"foreignKey:UserId"`
}

func (User) TableName() string {
	return "users"
}

func (u *User) ToEntity() *entity.User {
	return &entity.User{
		Id:        u.Id,
		Name:      u.Name,
		Email:     u.Email,
		Password:  u.Password,
		Role:      entity.UserRole(u.Role),
		PayType:   entity.PayType(u.PayType),
		PayRate:   u.PayRate,
		Goal:      u.Goal,
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
	}
}

func (u *User) FromEntity(user *entity.User) {
	u.Id = user.Id
	u.Name = user.Name
	u.Email = user.Email
	u.Password = user.Password
	u.Role = string(user.Role)
	u.PayType = string(user.PayType)
	u.PayRate = user.PayRate
	u.Goal = user.Goal
}

// Helper functions for conversion
func ToUserEntity(u *User) *entity.User {
	return u.ToEntity()
}

func ToUserEntities(users []User) []*entity.User {
	entities := make([]*entity.User, len(users))
	for i, u := range users {
		entities[i] = u.ToEntity()
	}
	return entities
}

func FromUserEntity(user *entity.User) *User {
	u := &User{}
	u.FromEntity(user)
	return u
}
