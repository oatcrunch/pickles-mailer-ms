#!/bin/bash
echo "Destryoying kuberketes resources (make sure you have Docker and Kubernetes installed and that Docker Desktop is running)."
kubectl delete -f ../modules/mailer-service/k8s
kubectl delete namespace mailer

echo "============================"
echo "Destroying EKS stack in AWS (make sure you have created AWS account and configured locally as well as given administrative IAM policy)."
eksctl delete cluster --name mailer-cluster