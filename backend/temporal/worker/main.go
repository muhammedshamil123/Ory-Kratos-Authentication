package main

import (
	"backend/middleware"
	"backend/temporal/activities"
	"backend/temporal/workflows"
	"log"

	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/worker"
)

type NoopLogger struct{}

func (l *NoopLogger) Debug(msg string, keyvals ...interface{}) {}
func (l *NoopLogger) Info(msg string, keyvals ...interface{})  {}
func (l *NoopLogger) Warn(msg string, keyvals ...interface{})  {}
func (l *NoopLogger) Error(msg string, keyvals ...interface{}) {}

func main() {
	c, err := client.Dial(client.Options{
		Logger: &NoopLogger{},
	})
	if err != nil {
		log.Fatalf("unable to create Temporal client: %v", err)
	}
	w1 := worker.New(c, "CREATE_REPO_QUEUE", worker.Options{})
	w1.RegisterWorkflow(workflows.CreateRepoWorkflow)
	w1.RegisterActivity(activities.CreateRepoActivity)

	enforcer, err := middleware.InitCasbin()
	if err != nil {
		log.Fatalf("Casbin init failed: %v", err)
	}
	casbinActivities := &activities.CasbinActivities{
		Enforcer: enforcer,
	}

	w2 := worker.New(c, "NOVU_INVITE_QUEUE", worker.Options{})
	w2.RegisterWorkflow(workflows.NovuInviteWorkflow)
	w2.RegisterActivity(activities.SendInviteNotificationActivity)
	w2.RegisterActivity(activities.FetchIdentitiesActivity)
	w2.RegisterActivity(activities.FindIdentityByEmailActivity)
	w2.RegisterActivity(activities.CheckSelfInviteActivity)
	w2.RegisterActivity(casbinActivities)

	go func() {
		err := w1.Run(worker.InterruptCh())
		if err != nil {
			log.Fatal("unable to start worker 1:", err)
		}
	}()

	go func() {
		err := w2.Run(worker.InterruptCh())
		if err != nil {
			log.Fatal("unable to start worker 2:", err)
		}
	}()

	select {}

	// c.Close()
}
