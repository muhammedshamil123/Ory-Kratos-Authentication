package workflows

import (
	"backend/models"
	"backend/temporal/activities"
	"time"

	"go.temporal.io/sdk/temporal"
	"go.temporal.io/sdk/workflow"
)

func NovuInviteWorkflow(ctx workflow.Context, input models.CreateInvite) (bool, error) {
	opts := workflow.ActivityOptions{
		StartToCloseTimeout: time.Minute,
		RetryPolicy: &temporal.RetryPolicy{
			InitialInterval: time.Second * 1,
			MaximumAttempts: 2,
		},
	}
	ctx = workflow.WithActivityOptions(ctx, opts)
	var done bool

	var identities []map[string]interface{}
	err := workflow.ExecuteActivity(ctx, activities.FetchIdentitiesActivity).Get(ctx, &identities)
	if err != nil {
		return false, err
	}
	var id string
	IdentityInput := models.IdentetyEmail{
		Email:      input.Email,
		Identities: identities,
	}
	err = workflow.ExecuteActivity(ctx, activities.FindIdentityByEmailActivity, IdentityInput).Get(ctx, &id)
	if err != nil {
		return false, err
	}

	SelfInvite := models.SelfActivity{
		UserId:   id,
		SenderId: input.UserId,
	}

	err = workflow.ExecuteActivity(ctx, activities.CheckSelfInviteActivity, SelfInvite).Get(ctx, &done)
	if err != nil {
		return false, err
	}
	Casbin := models.AddCasbinPolicy{
		UserId: id,
		OrgId:  input.OrgID,
	}
	err = workflow.ExecuteActivity(ctx, "AddCasbinPolicyActivity", Casbin).Get(ctx, &done)
	if err != nil {
		return false, err
	}
	err = workflow.ExecuteActivity(ctx, activities.SendInviteNotificationActivity, input).Get(ctx, &done)
	if err != nil {
		return done, err
	}
	return done, nil
}
