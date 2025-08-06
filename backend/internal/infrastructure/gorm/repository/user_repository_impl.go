package repository

import (
	"context"

	"gorm.io/gorm"

	"github.com/attendance_report_app/backend/internal/domain/entity"
	"github.com/attendance_report_app/backend/internal/domain/repository"
	"github.com/attendance_report_app/backend/internal/infrastructure/gorm/model"
)

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) repository.UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) getDB(ctx context.Context) *gorm.DB {
	if tx, ok := ctx.Value("tx").(*gorm.DB); ok {
		return tx
	}
	return r.db
}

func (r *userRepository) FindAll(ctx context.Context) ([]*entity.User, error) {
	var users []model.User
	if err := r.getDB(ctx).Find(&users).Error; err != nil {
		return nil, err
	}
	return model.ToUserEntities(users), nil
}

func (r *userRepository) FindById(ctx context.Context, id int) (*entity.User, error) {
	var user model.User
	if err := r.getDB(ctx).First(&user, id).Error; err != nil {
		return nil, err
	}
	return model.ToUserEntity(&user), nil
}

func (r *userRepository) FindByEmail(ctx context.Context, email string) (*entity.User, error) {
	var user model.User
	if err := r.getDB(ctx).Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return model.ToUserEntity(&user), nil
}

func (r *userRepository) Create(ctx context.Context, user *entity.User) (*entity.User, error) {
	userModel := model.FromUserEntity(user)
	if err := r.getDB(ctx).Create(&userModel).Error; err != nil {
		return nil, err
	}
	return model.ToUserEntity(userModel), nil
}

func (r *userRepository) Update(ctx context.Context, user *entity.User) (*entity.User, error) {
	userModel := model.FromUserEntity(user)
	// Use Updates instead of Save to avoid updating created_at
	if err := r.getDB(ctx).Model(&model.User{}).Where("id = ?", userModel.Id).Updates(map[string]interface{}{
		"name":      userModel.Name,
		"email":     userModel.Email,
		"password":  userModel.Password,
		"role":      userModel.Role,
		"pay_type":  userModel.PayType,
		"pay_rate":  userModel.PayRate,
		"goal":      userModel.Goal,
	}).Error; err != nil {
		return nil, err
	}
	
	// Fetch the updated user to return
	var updatedUser model.User
	if err := r.getDB(ctx).First(&updatedUser, userModel.Id).Error; err != nil {
		return nil, err
	}
	return model.ToUserEntity(&updatedUser), nil
}

func (r *userRepository) Delete(ctx context.Context, id int) error {
	return r.getDB(ctx).Delete(&model.User{}, id).Error
}