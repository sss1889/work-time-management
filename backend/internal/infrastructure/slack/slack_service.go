package slack

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type SlackService interface {
	SendAttendanceNotification(userName string, date time.Time, startTime, endTime time.Time, breakMinutes int, report string) error
}

type slackService struct {
	webhookURL string
	httpClient *http.Client
}

func NewSlackService(webhookURL string) SlackService {
	return &slackService{
		webhookURL: webhookURL,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

type SlackMessage struct {
	Text        string       `json:"text"`
	Attachments []Attachment `json:"attachments,omitempty"`
}

type Attachment struct {
	Color  string  `json:"color"`
	Fields []Field `json:"fields"`
}

type Field struct {
	Title string `json:"title"`
	Value string `json:"value"`
	Short bool   `json:"short"`
}

func (s *slackService) SendAttendanceNotification(userName string, date time.Time, startTime, endTime time.Time, breakMinutes int, report string) error {
	if s.webhookURL == "" {
		return fmt.Errorf("Slack webhook URL is not configured")
	}

	dateStr := date.Format("2006-01-02")
	startTimeStr := startTime.Format("15:04")
	endTimeStr := endTime.Format("15:04")
	
	workDuration := endTime.Sub(startTime) - time.Duration(breakMinutes)*time.Minute
	workHours := int(workDuration.Hours())
	workMinutes := int(workDuration.Minutes()) % 60

	message := SlackMessage{
		Text: "🔔 新しい勤務報告が登録されました",
		Attachments: []Attachment{
			{
				Color: "good",
				Fields: []Field{
					{
						Title: "社員",
						Value: userName,
						Short: true,
					},
					{
						Title: "日付",
						Value: dateStr,
						Short: true,
					},
					{
						Title: "勤務時間",
						Value: fmt.Sprintf("%s - %s", startTimeStr, endTimeStr),
						Short: true,
					},
					{
						Title: "実働時間",
						Value: fmt.Sprintf("%d時間%d分", workHours, workMinutes),
						Short: true,
					},
					{
						Title: "休憩時間",
						Value: fmt.Sprintf("%d分", breakMinutes),
						Short: true,
					},
				},
			},
		},
	}

	// レポートを必ず追加（空でも項目として表示）
	reportValue := report
	if reportValue == "" {
		reportValue = "（レポートなし）"
	}
	message.Attachments[0].Fields = append(message.Attachments[0].Fields, Field{
		Title: "業務報告",
		Value: reportValue,
		Short: false,
	})

	jsonData, err := json.Marshal(message)
	if err != nil {
		return fmt.Errorf("failed to marshal slack message: %w", err)
	}

	req, err := http.NewRequest("POST", s.webhookURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send slack notification: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("slack notification failed with status: %d", resp.StatusCode)
	}

	return nil
}