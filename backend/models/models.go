package models

type Identity struct {
	ID     string `json:"id"`
	Traits struct {
		Email string `json:"email"`
		Name  string `json:"name"`
	} `json:"traits"`
}
