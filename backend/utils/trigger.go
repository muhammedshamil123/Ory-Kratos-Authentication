package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

type NovuPayload struct {
	To      map[string]interface{} `json:"to"`
	Name    string                 `json:"name"`
	Payload map[string]interface{} `json:"payload"`
}

func TriggerInviteAcceptedNotification(email, orgID, orgName string) error {
	apiKey := os.Getenv("NOVU_API_KEY")
	if apiKey == "" {
		return fmt.Errorf("NOVU_API_KEY not set")
	}

	payload := NovuPayload{
		To: map[string]interface{}{
			"subscriberId": email,
		},
		Name: "org-invite-notification",
		Payload: map[string]interface{}{
			"orgId":    orgID,
			"orgName":  orgName,
			"accepted": true,
		},
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", "https://api.novu.co/v1/events/trigger", bytes.NewBuffer(body))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "ApiKey "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("failed to trigger Novu notification: %s", resp.Status)
	}
	return nil
}
