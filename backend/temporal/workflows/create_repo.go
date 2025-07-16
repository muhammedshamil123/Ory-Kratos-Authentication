package workflows

import (
	"backend/models"
	"backend/temporal/activities"
	"time"

	"github.com/google/go-github/v55/github"
	"go.temporal.io/sdk/temporal"
	"go.temporal.io/sdk/workflow"
)

func CreateRepoWorkflow(ctx workflow.Context, input models.CreateRepoInput) (*github.Repository, error) {
	opts := workflow.ActivityOptions{
		StartToCloseTimeout: time.Minute,
		RetryPolicy: &temporal.RetryPolicy{
			InitialInterval: time.Second * 1,
			MaximumAttempts: 0,
		},
	}
	ctx = workflow.WithActivityOptions(ctx, opts)
	var repo *github.Repository
	err := workflow.ExecuteActivity(ctx, activities.CreateRepoActivity, input).Get(ctx, &repo)
	if err != nil {
		return nil, err
	}
	return repo, nil
}
