#!/bin/bash
echo "Creating EKS cluster in AWS (make sure you have created AWS account and configured locally as well as given administrative IAM policy)."
eksctl create cluster \
    --name mailer-cluster \
    --region ap-southeast-1 \
    --nodegroup-name mailer-nodegroup \
    --node-type t3.small \
    --nodes 2
aws eks update-kubeconfig --name mailer-cluster --region ap-southeast-1

echo "============================"
echo "Deploying kuberketes resources (make sure you have Docker and Kubernetes installed and that Docker Desktop is running)."
kubectl create namespace mailer
kubectl apply -f modules/mailer-service/k8s 

echo "============================"
echo "Deploying AWS resource stack (make sure you have created AWS account and configured locally as well as given administrative IAM policy)."
echo "Below command requires node and AWS-CDK to be installed locally."
npm run deploy
