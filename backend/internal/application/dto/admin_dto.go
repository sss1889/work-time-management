package dto

type DashboardResponse struct {
	TotalHours      float64                 `json:"totalHours"`
	TotalSalary     int                     `json:"totalSalary"`
	ActiveEmployees int                     `json:"activeEmployees"`
	EmployeeData    []DashboardEmployeeData `json:"employeeData"`
}

type DashboardEmployeeData struct {
	Name        string  `json:"name"`
	TotalHours  float64 `json:"totalHours"`
	TotalSalary int     `json:"totalSalary"`
}

type PayrollResponse struct {
	TotalPayroll int               `json:"totalPayroll"`
	PayrollData  []PayrollEmployee `json:"payrollData"`
}

type PayrollEmployee struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	PayType     string  `json:"payType"`
	PayRate     int     `json:"payRate"`
	TotalHours  float64 `json:"totalHours"`
	TotalSalary int     `json:"totalSalary"`
}
