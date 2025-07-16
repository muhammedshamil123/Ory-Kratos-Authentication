package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Identity struct {
	ID     string `json:"id"`
	Traits struct {
		Email string `json:"email"`
		Name  string `json:"name"`
	} `json:"traits"`
}
type Organization struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name        string             `bson:"name" json:"name"`
	Description string             `bson:"description" json:"description"`
	CreatedBy   string             `bson:"created_by" json:"created_by"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
	Users       []User             `bson:"users"`
}
type User struct {
	ID    string `bson:"_id,omitempty" json:"id"`
	Email string `bson:"email" json:"email"`
	Name  string `bson:"name" json:"name"`
	Role  string `bson:"role" json:"role"`
}

type CreateRepoInput struct {
	Name        string
	Description string
	Private     bool
	GithubToken string
}
type InviteRequest struct {
	OrgID       string `json:"org_id"`
	OrgName     string `json:"org_name"`
	Email       string `json:"email"`
	Description string `json:"description"`
}
type CreateInvite struct {
	OrgID       string
	OrgName     string
	Email       string
	Description string
	UserId      string
}
type IdentetyEmail struct {
	Email      string
	Identities []map[string]interface{}
}
type SelfActivity struct {
	UserId   string
	SenderId string
}
type AddCasbinPolicy struct {
	UserId string
	OrgId  string
}
