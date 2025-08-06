package jwt

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/attendance_report_app/backend/internal/application/usecase"
)

type tokenService struct {
	secretKey string
	expiresIn time.Duration
}

func NewTokenService(secretKey string, expiresIn time.Duration) usecase.TokenService {
	return &tokenService{
		secretKey: secretKey,
		expiresIn: expiresIn,
	}
}

func (s *tokenService) GenerateToken(userID int, role string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"role":    role,
		"exp":     time.Now().Add(s.expiresIn).Unix(),
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.secretKey))
}

func (s *tokenService) InvalidateToken(token string) error {
	return nil
}