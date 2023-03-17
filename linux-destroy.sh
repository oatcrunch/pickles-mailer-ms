#!/bin/bash
echo "Destroying kuberketes resources (make sure you have Docker and Kubernetes installed and that Docker Desktop is running)."
kubectl delete -f modules/mailer-service/k8s 
kubectl delete namespace mailer

echo "============================"
echo "Destroying EKS stack in AWS (make sure you have created AWS account and configured locally as well as given administrative IAM policy)."
eksctl delete cluster --name mailer-cluster

echo "============================"
echo "Destroying AWS resource stack (make sure you have created AWS account and configured locally as well as given administrative IAM policy)."
echo "Below command requires node and AWS-CDK to be installed locally."
npm run destroy
