package dto

import "time"

type DailyReportResponse struct {
	Id       int       `json:"id"`
	UserId   int       `json:"user_id"`
	Date     time.Time `json:"date"`
	Report   string    `json:"report"`
	UserName string    `json:"user_name"`
}

type DailyReportsResponse struct {
	Reports []DailyReportResponse `json:"reports"`
}

func ToDailyReportResponse(id int, userId int, date time.Time, report string, userName string) *DailyReportResponse {
	return &DailyReportResponse{
		Id:       id,
		UserId:   userId,
		Date:     date,
		Report:   report,
		UserName: userName,
	}
}
func ToDailyReportsResponse(reports []DailyReportResponse) *DailyReportsResponse {
	return &DailyReportsResponse{
		Reports: reports,
	}
}
