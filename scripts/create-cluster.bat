@ECHO OFF
ECHO Creating EKS cluster in AWS (make sure you have created AWS account and configured locally as well as given administrative IAM policy).
call eksctl create cluster ^
    --name mailer-cluster ^
    --region ap-southeast-1 ^
    --nodegroup-name mailer-nodegroup ^
    --node-type t3.small ^
    --nodes 2 ^
    --zones=ap-southeast-1a,ap-southeast-1b
call aws eks update-kubeconfig --name mailer-cluster --region ap-southeast-1