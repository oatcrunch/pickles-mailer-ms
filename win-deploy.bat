@ECHO OFF
ECHO Creating EKS cluster in AWS (make sure you have created AWS account and configured locally as well as given administrative IAM policy).
call eksctl create cluster ^
    --name mailer-cluster ^
    --region ap-southeast-1 ^
    --nodegroup-name mailer-nodegroup ^
    --node-type t3.small ^
    --nodes 2
call aws eks update-kubeconfig --name mailer-cluster --region ap-southeast-1

ECHO ============================
ECHO Deploying kuberketes resources (make sure you have Docker and Kubernetes installed and that Docker Desktop is running).
call kubectl create namespace mailer
call kubectl apply -f modules/mailer-service/k8s 

ECHO ============================
ECHO Deploying AWS resource stack (make sure you have created AWS account and configured locally as well as given administrative IAM policy).
ECHO Below command requires node and AWS-CDK to be installed locally.
call npm run deploy
