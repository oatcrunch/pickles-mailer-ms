@ECHO OFF
ECHO Destryoying kuberketes resources (make sure you have Docker and Kubernetes installed and that Docker Desktop is running).
call kubectl delete -f modules/mailer-service/k8s 
call kubectl delete namespace mailer

ECHO ============================
ECHO Destroying EKS stack in AWS (make sure you have created AWS account and configured locally as well as given administrative IAM policy).
call eksctl delete cluster --name mailer-cluster

ECHO ============================
ECHO Destryoying AWS resource stack (make sure you have created AWS account and configured locally as well as given administrative IAM policy).
ECHO Below command requires node and AWS-CDK to be installed locally.
call npm run destroy
