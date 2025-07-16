package activities

import (
	"backend/models"
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/casbin/casbin/v2"
	"github.com/joho/godotenv"
)

func init() {
	err := godotenv.Load(".env")
	if err != nil {
		fmt.Println("Warning: .env file not found or failed to load")
		fmt.Println(err)
	}
}
func SendInviteNotificationActivity(ctx context.Context, input models.CreateInvite) (bool, error) {
	novuKey := os.Getenv("NOVU_API_KEY")
	if novuKey == "" {
		return false, errors.New("Missing Novu API key")
	}
	fmt.Println(input)
	payload := map[string]interface{}{
		"to": map[string]interface{}{
			"subscriberId": input.Email,
			"email":        input.Email,
		},
		"name": "org-invite-notification",
		"payload": map[string]interface{}{
			"orgId":       input.OrgID,
			"orgName":     input.OrgName,
			"description": input.Description,
			"accepted":    false,
		},
	}

	jsonPayload, _ := json.Marshal(payload)
	reqURL := "https://api.novu.co/v1/events/trigger"
	httpReq, _ := http.NewRequest("POST", reqURL, bytes.NewBuffer(jsonPayload))
	httpReq.Header.Set("Authorization", "ApiKey "+novuKey)
	httpReq.Header.Set("Content-Type", "application/json")
	client := &http.Client{}
	res, err := client.Do(httpReq)
	if err != nil || res.StatusCode >= 400 {
		return false, errors.New("Failed to send Novu invite")
	}
	defer res.Body.Close()
	return true, nil
}

func FetchIdentitiesActivity(ctx context.Context) ([]map[string]interface{}, error) {
	resp, err := http.Get("http://localhost:4434/admin/identities")
	if err != nil {
		return nil, errors.New("Failed to fetch identities")
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, errors.New("Non-OK HTTP status")
	}

	bodyBytes, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, errors.New("Failed to read body")
	}

	var identities []map[string]interface{}
	if err := json.Unmarshal(bodyBytes, &identities); err != nil {
		return nil, errors.New("Failed to unmarshal JSON")
	}
	return identities, nil
}

func FindIdentityByEmailActivity(ctx context.Context, input models.IdentetyEmail) (string, error) {
	found := false
	var id string
	for _, identity := range input.Identities {

		traits, ok := identity["traits"].(map[string]interface{})
		if !ok {
			continue
		}

		email, ok := traits["email"].(string)
		if ok && email == input.Email {
			found = true
			id = identity["id"].(string)
			break
		}
	}
	if !found {
		return "", errors.New("User with this email not found")
	}
	return id, nil
}

func CheckSelfInviteActivity(ctx context.Context, input models.SelfActivity) (bool, error) {
	if input.UserId == input.SenderId {
		return false, errors.New("You cannot invite yourself")
	}
	return true, nil
}

type CasbinActivities struct {
	Enforcer *casbin.Enforcer
}

func (a *CasbinActivities) AddCasbinPolicyActivity(ctx context.Context, input models.AddCasbinPolicy) (bool, error) {
	_ = a.Enforcer.LoadPolicy()
	oldRoles := a.Enforcer.GetRolesForUserInDomain(input.UserId, input.OrgId)
	for _, role := range oldRoles {
		if role == "invite" {
			return false, errors.New("User already invited")
		} else {
			return false, errors.New("User already exist")
		}
	}
	added, err := a.Enforcer.AddGroupingPolicy(input.UserId, "invite", input.OrgId)
	fmt.Println(added, input, err)
	if err != nil || !added {
		return false, err
	}
	return added, nil
}
