package activities

import (
	"backend/models"
	"context"

	"github.com/google/go-github/v55/github"
	"golang.org/x/oauth2"
)

func CreateRepoActivity(ctx context.Context, input models.CreateRepoInput) (*github.Repository, error) {
	client := oauth2.NewClient(ctx, oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: input.GithubToken},
	))

	repo := &github.Repository{
		Name:        github.String(input.Name),
		Description: github.String(input.Description),
		Private:     github.Bool(input.Private),
	}
	createdRepo, _, err := github.NewClient(client).Repositories.Create(ctx, "", repo)
	if err != nil {
		return nil, err
	}

	return createdRepo, nil
}
